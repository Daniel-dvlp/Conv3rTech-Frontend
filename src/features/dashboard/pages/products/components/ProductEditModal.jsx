import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaPlus, FaReply, FaSpinner } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { featuresService } from '../services/productsService';
import cloudinaryService from '../../../../../services/cloudinaryService';

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
  text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    // Limpiar errores del servidor cuando el usuario modifica campos
    if (newErrors.servidor) delete newErrors.servidor;
    
    switch (name) {
      case 'nombre':
        if (!value?.trim()) newErrors.nombre = 'El nombre es obligatorio';
        else delete newErrors.nombre;
        break;
      case 'modelo':
        if (!value?.trim()) newErrors.modelo = 'El modelo es obligatorio';
        else delete newErrors.modelo;
        break;
      case 'id_categoria':
        if (!value) newErrors.id_categoria = 'Selecciona una categoría';
        else delete newErrors.id_categoria;
        break;
      case 'unidad_medida':
        if (!value) newErrors.unidad_medida = 'Selecciona una unidad de medida';
        else delete newErrors.unidad_medida;
        break;
      case 'precio':
        if (!value || value <= 0) newErrors.precio = 'Ingresa un precio válido mayor a 0';
        else delete newErrors.precio;
        break;
      case 'garantia':
        if (!value || ![6, 12, 24, 36].includes(Number(value))) {
          newErrors.garantia = 'Selecciona una garantía válida (6, 12, 24 o 36 meses)';
        } else {
          delete newErrors.garantia;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

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

  const handleKeyDown = (e) => {
    // Prevenir entrada de 'e', 'E', '+', '-' en campos numéricos
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // No permitir cambios en stock por seguridad
    if (name === 'stock') {
      return;
    }

    setProductData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
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
        updated[index].nuevaCaracteristica = updated[index].nuevaCaracteristica || '';
      } else {
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
      valor: updated[index].valor || ''
    };
    delete updated[index].nuevaCaracteristica;
    setProductData((prev) => ({ ...prev, fichas_tecnicas: updated }));
  };

  // ✅ Fotos con Cloudinary (CORREGIDO)
  const handleRemoveFoto = async (index) => {
    const updatedFotos = [...(productData.fotos || [])];
    const fotoToRemove = updatedFotos[index];
    
    // Si la foto está en Cloudinary (contiene res.cloudinary.com), intentar eliminarla
    if (fotoToRemove && fotoToRemove.includes('res.cloudinary.com')) {
      try {
        await cloudinaryService.deleteImage(fotoToRemove);
        console.log('Imagen eliminada de Cloudinary');
      } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
        // Continuar aunque falle la eliminación
      }
    }
    
    updatedFotos.splice(index, 1);
    setProductData((prev) => ({ ...prev, fotos: updatedFotos }));
  };

  const handleAddFotos = async (e) => {
    const files = Array.from(e.target.files).slice(
      0,
      4 - (productData.fotos?.length || 0)
    );
    
    if (files.length === 0) return;

    // Validar archivos
    const validation = cloudinaryService.validateImages(files);
    if (!validation.valid) {
      setErrors(prev => ({
        ...prev,
        imageUpload: validation.errors.join('. ')
      }));
      return;
    }

    setUploadingImages(true);
    setUploadProgress(0);

    try {
      // Subir imágenes a Cloudinary
      const uploadedUrls = await cloudinaryService.uploadMultipleImages(files, 'products');
      
      setProductData((prev) => ({
        ...prev,
        fotos: [...(prev.fotos || []), ...uploadedUrls],
      }));

      setUploadProgress(100);
      
      // Limpiar error si existe
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imageUpload;
        return newErrors;
      });
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      setErrors(prev => ({
        ...prev,
        imageUpload: error.message || 'Error al subir las imágenes. Inténtalo de nuevo.'
      }));
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // ✅ Guardar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpiar errores del servidor
    setErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs.servidor;
      return newErrs;
    });

    // Validar duplicados
    validateDuplicate();
    
    // Validar garantía
    if (productData.garantia && ![6, 12, 24, 36].includes(Number(productData.garantia))) {
      setErrors(prev => ({
        ...prev,
        garantia: 'Selecciona una garantía válida (6, 12, 24 o 36 meses)'
      }));
      return;
    }
    
    // Si hay errores, no continuar
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    setLoading(true);

    try {
      let fichasProcesadas = [];

      for (const ficha of productData.fichas_tecnicas || []) {
        let idCaracteristica = ficha.id_caracteristica;

        if (idCaracteristica === "otro" && ficha.nuevaCaracteristica) {
          try {
            const newFeature = await featuresService.createFeature({ 
              nombre: ficha.nuevaCaracteristica 
            });
            idCaracteristica = newFeature.id_caracteristica;
          } catch (error) {
            console.error("Error al crear característica:", error);
            continue;
          }
        }
        
        const numericId = Number(idCaracteristica);
        
        if (idCaracteristica && idCaracteristica !== "otro" && !isNaN(numericId) && numericId > 0) {
          fichasProcesadas.push({
            id_caracteristica: numericId,
            valor: ficha.valor
          });
        }
      }

      const updatedProduct = {
        ...productData,
        id_categoria: Number(productData.id_categoria),
        precio: Number(productData.precio),
        garantia: Number(productData.garantia),
        codigo_barra: productData.codigo_barra?.trim() || null,
        fichas_tecnicas: fichasProcesadas,
        estado: !!productData.estado,
        fotos: Array.isArray(productData.fotos) ? productData.fotos : []
      };

      await onSave(updatedProduct);
      onClose();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.errors?.[0]?.msg || 
                          error?.message || 
                          'Ocurrió un error al actualizar el producto';
      setErrors(prev => ({
        ...prev,
        servidor: errorMessage
      }));
      
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error-servidor]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
          {/* Mensaje de error del servidor */}
          {errors.servidor && (
            <div 
              data-error-servidor
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{errors.servidor}</p>
                </div>
              </div>
            </div>
          )}

          {/* ——————————————————————————————
                INFORMACIÓN PRINCIPAL
          —————————————————————————————— */}
          <FormSection title="Información Principal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <FormLabel htmlFor="nombre"><span className="text-red-500">*</span> Nombre:</FormLabel>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={productData.nombre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.nombre ? 'border-red-500' : ''}`}
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
                {errors.duplicate && (
                  <p className="text-red-500 text-sm mt-1">{errors.duplicate}</p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <FormLabel htmlFor="modelo"><span className="text-red-500">*</span> Modelo:</FormLabel>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={productData.modelo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputBaseStyle} ${errors.modelo ? 'border-red-500' : ''}`}
                />
                {errors.modelo && (
                  <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <FormLabel htmlFor="id_categoria"><span className="text-red-500">*</span> Categoría:</FormLabel>
                <select
                  id="id_categoria"
                  name="id_categoria"
                  value={productData.id_categoria}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${errors.id_categoria ? 'border-red-500' : ''}`}
                >
                  <option value="" disabled>Seleccione una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id_categoria} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {errors.id_categoria && (
                  <p className="text-red-500 text-sm mt-1">{errors.id_categoria}</p>
                )}
              </div>

              {/* Unidad */}
              <div>
                <FormLabel htmlFor="unidad_medida"><span className="text-red-500">*</span> Unidad:</FormLabel>
                <select
                  id="unidad_medida"
                  name="unidad_medida"
                  value={productData.unidad_medida}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${errors.unidad_medida ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccione la unidad:</option>
                  <option value="unidad">Unidad</option>
                  <option value="metros">Metros</option>
                  <option value="tramo 2 metros">Tramo 2 metros</option>
                  <option value="tramo 3 metros">Tramo 3 metros</option>
                  <option value="paquetes">Paquetes</option>
                  <option value="kit">Kit</option>
                </select>
                {errors.unidad_medida && (
                  <p className="text-red-500 text-sm mt-1">{errors.unidad_medida}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <FormLabel htmlFor="precio"><span className="text-red-500">*</span> Precio:</FormLabel>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={productData.precio}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${inputBaseStyle} ${errors.precio ? 'border-red-500' : ''}`}
                />
                {errors.precio && (
                  <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
                )}
              </div>

              {/* Stock - Solo lectura */}
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
                  El stock no puede ser editado manualmente
                </p>
              </div>

              {/* Garantía */}
              <div className="relative">
                <FormLabel htmlFor="garantia"><span className="text-red-500">*</span> Garantía:</FormLabel>
                <select
                  id="garantia"
                  name="garantia"
                  value={productData.garantia}
                  onChange={handleChange}
                  className={`${inputBaseStyle} appearance-none pr-10 text-gray-500 ${errors.garantia ? 'border-red-500' : ''}`}
                >
                  <option value="">Seleccione la garantía:</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
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
                {errors.garantia && (
                  <p className="text-red-500 text-sm mt-1">{errors.garantia}</p>
                )}
              </div>

              {/* Código de barra */}
              <div>
                <FormLabel htmlFor="codigo_barra">Código de barra:</FormLabel>
                <input
                  type="text"
                  id="codigo_barra"
                  name="codigo_barra"
                  value={productData.codigo_barra || ''}
                  onChange={handleChange}
                  placeholder="N/A"
                  className={inputBaseStyle}
                />
              </div>
            </div>
          </FormSection>

          {/* ——————————————————————————————
                FICHAS TÉCNICAS
          —————————————————————————————— */}
          <FormSection title="Fichas Técnicas">
            {(productData.fichas_tecnicas || []).map((ficha, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start mb-2"
              >
                <div>
                  <FormLabel htmlFor={`caracteristica_input_${index}`}>
                    <span className="text-red-500">*</span> Característica:
                  </FormLabel>

                  {ficha.id_caracteristica === 'otro' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id={`caracteristica_input_${index}`}
                        placeholder="Ingrese la nueva característica"
                        value={ficha.nuevaCaracteristica || ""}
                        onChange={(e) => handleFichaChange(index, 'nuevaCaracteristica', e.target.value)}
                        className={inputBaseStyle}
                      />
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
                    <div className="relative">
                      <select
                        id={`caracteristica_input_${index}`}
                        value={ficha.id_caracteristica}
                        onChange={(e) => handleFichaChange(index, 'id_caracteristica', e.target.value)}
                        className={`${inputBaseStyle} appearance-none pr-10 text-gray-500`}
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
                  <FormLabel htmlFor={`valor_${index}`}><span className="text-red-500">*</span> Valor:</FormLabel>
                  <input
                    type="text"
                    id={`valor_${index}`}
                    value={ficha.valor}
                    onChange={(e) => handleFichaChange(index, 'valor', e.target.value)}
                    className={inputBaseStyle}
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
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaPlus className="text-white" size={12} />
              Agregar ficha técnica
            </button>
          </FormSection>

          {/* ——————————————————————————————
                FOTOS DEL PRODUCTO
          —————————————————————————————— */}
          <FormSection title="Fotos del Producto">
            <div className="flex gap-3 flex-wrap">
              {(productData.fotos || []).map((foto, index) => (
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
                    loading="lazy"
                  />
                </div>
              ))}

              {/* Estado de carga */}
              {uploadingImages && (
                <div className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-conv3r-gold rounded-lg bg-conv3r-gold/10">
                  <FaSpinner className="animate-spin text-conv3r-gold" />
                  <span className="text-xs text-conv3r-gold font-medium">
                    {uploadProgress}%
                  </span>
                </div>
              )}

              {(productData.fotos?.length || 0) < 4 && !uploadingImages && (
                <>
                  <label
                    htmlFor="editar-fotos"
                    className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
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
                    disabled={uploadingImages}
                  />
                </>
              )}
            </div>
            
            {/* Mensaje de error de subida */}
            {errors.imageUpload && (
              <p className="text-red-500 text-sm mt-2">{errors.imageUpload}</p>
            )}
            
            {/* Información sobre optimización */}
            <p className="text-xs text-gray-500 mt-2">
              Las imágenes se optimizan automáticamente para mejor rendimiento
            </p>
          </FormSection>

          {/* ——————————————————————————————
                ESTADO DEL PRODUCTO
          —————————————————————————————— */}
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
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploadingImages || loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              disabled={uploadingImages || loading}
            >
              {(uploadingImages || loading) && <FaSpinner className="animate-spin" />}
              {uploadingImages ? 'Subiendo imágenes...' : loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;