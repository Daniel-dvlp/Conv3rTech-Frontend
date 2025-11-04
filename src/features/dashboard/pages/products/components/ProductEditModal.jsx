import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaPlus, FaReply } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { featuresService } from '../services/productsService';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
);

const inputBaseStyle =
  'block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const normalizeText = (text) =>
  text?.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const ToggleSwitch = ({ checked, onChange }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className={`${
      checked ? 'bg-green-500' : 'bg-gray-300'
    } relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none`}
  >
    <span
      className={`${
        checked ? 'translate-x-5' : 'translate-x-1'
      } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300`}
    />
  </Switch>
);

const ProductEditModal = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  existingProducts,
  features,
}) => {
  const [productData, setProductData] = useState(null);
  const [errors, setErrors] = useState({});
  const [allFeatures, setAllFeatures] = useState(features || []);

  useEffect(() => {
    if (productToEdit) {
      setProductData(productToEdit);
      setErrors({});
    }
  }, [productToEdit]);

  if (!isOpen || !productData) return null;

  const validateDuplicate = () => {
    const nombreNorm = normalizeText(productData.nombre);
    const modeloNorm = normalizeText(productData.modelo);
    const isDuplicate = existingProducts?.some(
      (prod) =>
        prod.id_producto !== productData.id_producto &&
        normalizeText(prod.nombre) === nombreNorm &&
        normalizeText(prod.modelo) === modeloNorm
    );

    const newErrors = { ...errors };
    if (isDuplicate) {
      newErrors.duplicate = 'Ya existe un producto con este nombre y modelo';
    } else {
      delete newErrors.duplicate;
    }
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // No permitir cambios en stock por seguridad
    if (name === 'stock') {
      return;
    }
    
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (name === 'nombre' || name === 'modelo') {
      validateDuplicate();
    }
  };

  // ✅ Fichas técnicas
  const handleFichaChange = (index, field, value) => {
    const updated = [...(productData.fichas_tecnicas || [])];
    updated[index][field] = value;

    if (field === 'id_caracteristica') {
      if (value === "otro") {
        // Si selecciona 'otro', inicializa el campo de texto para la nueva característica
        updated[index].nuevaCaracteristica = updated[index].nuevaCaracteristica || '';
      } else {
        // Si selecciona una existente, elimina el campo de texto si existía
        delete updated[index].nuevaCaracteristica;
      }
    }
    
    setProductData((prev) => ({ ...prev, fichas_tecnicas: updated }));
  };

  const handleRemoveFicha = (index) => {
    const updated = [...(productData.fichas_tecnicas || [])];
    updated.splice(index, 1);
    setProductData((prev) => ({ ...prev, fichas_tecnicas: updated }));
  };

  const handleAddFicha = () => {
    setProductData((prev) => ({
      ...prev,
      fichas_tecnicas: [
        ...(prev.fichas_tecnicas || []),
        { id_caracteristica: '', valor: '' },
      ],
    }));
  };

  const handleResetFicha = (index) => {
    const updated = [...(productData.fichas_tecnicas || [])];
    updated[index] = { 
      id_caracteristica: '', 
      valor: updated[index].valor || '' // Mantener el valor si ya se ingresó
    };
    // Asegurar que se elimine la nuevaCaracteristica si existe
    delete updated[index].nuevaCaracteristica;
    setProductData((prev) => ({ ...prev, fichas_tecnicas: updated }));
  };

  // ✅ Crear característica si el usuario selecciona "Otro"
  const createNewFeature = async (name) => {
    try {
      const newFeature = await featuresService.createFeature({ nombre: name });
      setAllFeatures((prev) => [...prev, newFeature]);
      return newFeature.id_caracteristica;
    } catch (error) {
      console.error('Error al crear la característica:', error);
      alert('No se pudo crear la nueva característica');
      return null;
    }
  };

  // ✅ Fotos
  const handleRemoveFoto = (index) => {
    const updatedFotos = [...(productData.fotos || [])];
    updatedFotos.splice(index, 1);
    setProductData((prev) => ({ ...prev, fotos: updatedFotos }));
  };

  const handleAddFotos = (e) => {
    const files = Array.from(e.target.files).slice(
      0,
      4 - (productData.fotos?.length || 0)
    );
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((images) => {
      setProductData((prev) => ({
        ...prev,
        fotos: [...(prev.fotos || []), ...images],
      }));
    });
  };

  // ✅ Guardar producto (crea la característica si hay "Otro")
  const handleSubmit = async (e) => {
    e.preventDefault();
    validateDuplicate();
    if (errors.duplicate || (productData.garantia && productData.garantia < 12)) return;

    let fichasProcesadas = [];

    for (const ficha of productData.fichas_tecnicas || []) {
      let idCaracteristica = ficha.id_caracteristica;

      if (idCaracteristica === "otro" && ficha.nuevaCaracteristica) {
        // 1. Crear la nueva característica en el backend
        try {
          const newFeature = await featuresService.createFeature({ nombre: ficha.nuevaCaracteristica });
          idCaracteristica = newFeature.id_caracteristica;
        } catch (error) {
          console.error("Error al crear característica:", error);
          continue;
        }
      }
      
      // 2. Procesar y convertir a número el ID si es válido
      const numericId = Number(idCaracteristica);
      
      // Reforzamos la validación para asegurar que se envía un número entero positivo (ID)
      if (idCaracteristica && idCaracteristica !== "otro" && !isNaN(numericId) && numericId > 0) {
        fichasProcesadas.push({
          id_caracteristica: numericId, // Usamos el valor numérico validado
          valor: ficha.valor
        });
      }
    }

    const updatedProduct = {
      ...productData,
      // Conversiones a número para el cuerpo principal
      id_categoria: Number(productData.id_categoria),
      precio: Number(productData.precio),
      // stock: NO se incluye - se maneja desde ventas/proyectos por seguridad
      garantia: Number(productData.garantia),
      codigo_barra: productData.codigo_barra?.trim() || null,
      fichas_tecnicas: fichasProcesadas, // Array de IDs numéricos
      estado: !!productData.estado,
      // Asegurar que fotos sea un array válido
      fotos: Array.isArray(productData.fotos) ? productData.fotos : []
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto custom-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">Editar Producto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
          >
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ———————————————————————
                INFORMACIÓN PRINCIPAL
          ——————————————————————— */}
          <FormSection title="Información Principal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <FormLabel htmlFor="nombre">* Nombre:</FormLabel>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={productData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputBaseStyle}
                  required
                />
                {errors.duplicate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.duplicate}
                  </p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <FormLabel htmlFor="modelo">* Modelo:</FormLabel>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={productData.modelo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputBaseStyle}
                  required
                />
              </div>

              {/* Categoría */}
              <div>
                <FormLabel htmlFor="id_categoria">* Categoría:</FormLabel>
                <select
                  id="id_categoria"
                  name="id_categoria"
                  value={productData.id_categoria}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                >
                  <option value="" disabled>
                    Seleccione una categoría
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.id_categoria}
                      value={cat.id_categoria}
                    >
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unidad */}
              <div>
                <FormLabel htmlFor="unidad_medida">* Unidad:</FormLabel>
                <select
                  id="unidad_medida"
                  name="unidad_medida"
                  value={productData.unidad_medida}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                >
                  <option value="">Seleccione la unidad:</option>
                  <option value="unidad">Unidad</option>
                  <option value="metros">Metros</option>
                  <option value="tramo 2 metros">Tramo 2 metros</option>
                  <option value="tramo 3 metros">Tramo 3 metros</option>
                  <option value="paquetes">Paquetes</option>
                  <option value="kit">Kit</option>
                </select>
              </div>

              {/* Precio */}
              <div>
                <FormLabel htmlFor="precio">* Precio:</FormLabel>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={productData.precio}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                />
              </div>

              {/* Stock - Solo lectura por seguridad */}
              <div>
                <FormLabel htmlFor="stock">Cantidad (Stock):</FormLabel>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={productData.stock}
                  className={`${inputBaseStyle} bg-gray-100 cursor-not-allowed`}
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  El stock no puede ser editado
                </p>
              </div>

              {/* Garantía */}
              <div>
                <FormLabel htmlFor="garantia">* Garantía (meses):</FormLabel>
                <input
                  type="number"
                  id="garantia"
                  name="garantia"
                  value={productData.garantia}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                />
                {productData.garantia && productData.garantia < 12 && (
                  <p className="text-red-500 text-sm mt-2">
                    La garantía debe ser de al menos 12 meses.
                  </p>
                )}
              </div>

              {/* Código de barra */}
              <div>
                <FormLabel htmlFor="codigo_barra">Código de barra:</FormLabel>
                <input
                  type="text"
                  id="codigo_barra"
                  name="codigo_barra"
                  value={productData.codigo_barra}
                  onChange={handleChange}
                  placeholder="N/A"
                  className={inputBaseStyle}
                />
              </div>
            </div>
          </FormSection>

          {/* ———————————————————————
                FICHAS TÉCNICAS
          ——————————————————————— */}
          <FormSection title="Fichas Técnicas">
            {(productData.fichas_tecnicas || []).map((ficha, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start mb-2"
              >
                <div>
                  <FormLabel htmlFor={`caracteristica_input_${index}`}>
                    * Característica:
                  </FormLabel>

                  {ficha.id_caracteristica === 'otro' ? (
                    // 💥 Reemplaza el selector con el input de texto 💥
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`caracteristica_input_${index}`}
                        placeholder="Ingrese la nueva característica"
                        value={ficha.nuevaCaracteristica || ""}
                        onChange={(e) => handleFichaChange(index, 'nuevaCaracteristica', e.target.value)}
                        className={inputBaseStyle}
                        required
                      />
                      {/* Botón para volver al selector */}
                      <button
                        type="button"
                        onClick={() => handleResetFicha(index)}
                        className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-700 transition border rounded-lg bg-white shadow-sm"
                        title="Volver a seleccionar"
                      >
                        <FaReply size={14} />
                      </button>
                    </div>
                  ) : (
                    // Muestra el selector normal
                    <div className="relative">
                      <select
                        id={`caracteristica_input_${index}`}
                        name={`id_caracteristica_${index}`}
                        value={ficha.id_caracteristica}
                        onChange={(e) => handleFichaChange(index, 'id_caracteristica', e.target.value)}
                        className={`${inputBaseStyle} appearance-none pr-10 text-gray-500`}
                        required
                      >
                        <option value="">Seleccione una característica</option>
                        {Array.isArray(allFeatures) && allFeatures.map((feat) => (
                          <option key={feat.id_caracteristica} value={feat.id_caracteristica}>
                            {feat.nombre}
                          </option>
                        ))}
                        <option value="otro">Otro (Crear nueva)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 top-0 mt-2">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <FormLabel htmlFor={`valor_${index}`}>* Valor:</FormLabel>
                  <input
                    type="text"
                    id={`valor_${index}`}
                    name={`valor_${index}`}
                    value={ficha.valor}
                    onChange={(e) =>
                      handleFichaChange(index, 'valor', e.target.value)
                    }
                    className={inputBaseStyle}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFicha(index)}
                  className="text-gray-400 hover:text-red-600 transition self-center pt-8"
                  title="Eliminar ficha técnica"
                >
                  <FaTrash />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddFicha}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg"
            >
              <FaPlus className="text-white" size={12} /> Agregar ficha técnica
            </button>
          </FormSection>

          {/* ———————————————————————
                FOTOS DEL PRODUCTO
          ——————————————————————— */}
          <FormSection title="Fotos del Producto">
            <div className="flex gap-3 flex-wrap">
              {productData.fotos?.map((foto, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-lg border border-gray-300"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveFoto(index)}
                    className="absolute -top-1.5 -right-1.5 bg-gray-700/70 hover:bg-gray-300 text-gray-600 hover:text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition z-10"
                    title="Eliminar imagen"
                  >
                    <span className="text-xs text-white leading-none">
                      <FaTimes />
                    </span>
                  </button>
                  <img
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              ))}

              {(productData.fotos?.length || 0) < 4 && (
                <>
                  <label
                    htmlFor="editar-fotos"
                    className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100"
                  >
                    <FaPlus />
                    <span className="text-xs">Agregar</span>
                  </label>
                  <input
                    type="file"
                    id="editar-fotos"
                    accept="image/*"
                    multiple
                    onChange={handleAddFotos}
                    className="hidden"
                  />
                </>
              )}
            </div>
          </FormSection>

          {/* ———————————————————————
                ESTADO DEL PRODUCTO
          ——————————————————————— */}
          <FormSection title="Estado del Producto">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 font-medium">Activo:</span>
              <ToggleSwitch
                checked={productData.estado}
                onChange={() =>
                  setProductData((prev) => ({ ...prev, estado: !prev.estado }))
                }
              />
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
              disabled={productData.garantia && productData.garantia < 12}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;