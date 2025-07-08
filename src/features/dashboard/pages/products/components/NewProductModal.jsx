import React, { useState } from 'react';
import { FaTimes, FaTrash, FaPlus, FaCamera } from 'react-icons/fa';

const FormSection = ({ title, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';
const inputHiddenStyle = 'absolute opacity-0 w-0 h-0';

const normalizeText = (text) => text?.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const NewProductModal = ({ isOpen, onClose, onSave, categories, existingProducts }) => {
    const initialState = {
        fotos: [], nombre: '', modelo: '', categoria: '', unidad: '',
        precio: '', stock: '', garantia: '', codigoBarra: '', especificaciones_tecnicas: [], estado: true,
    };

    const [productData, setProductData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [fotoActual, setFotoActual] = useState(0);


    const validateDuplicate = () => {
        const nombreNorm = normalizeText(productData.nombre);
        const modeloNorm = normalizeText(productData.modelo);
        const isDuplicate = existingProducts?.some(
            (prod) => normalizeText(prod.nombre) === nombreNorm && normalizeText(prod.modelo) === modeloNorm
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
        setProductData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductData((prev) => ({ ...prev, foto: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        if (name === 'nombre' || name === 'modelo') {
            validateDuplicate();
        }
    };


    const handleAddEspecification = () => {
        setProductData((prev) => ({
            ...prev,
            especificaciones_tecnicas: [...prev.especificaciones_tecnicas, { concepto: '', valor: '' }],
        }));
    };

    const handleEspecificationChange = (index, field, value) => {
        const updated = [...productData.especificaciones_tecnicas];
        updated[index][field] = value;
        setProductData((prev) => ({ ...prev, especificaciones_tecnicas: updated }));
    };

    const handleRemoveEspecification = (index) => {
        const updated = [...productData.especificaciones_tecnicas];
        updated.splice(index, 1);
        setProductData((prev) => ({ ...prev, especificaciones_tecnicas: updated }));
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    validateDuplicate();
    if (errors.duplicate || (productData.garantia && productData.garantia < 12)) return;

    const codigoFinal = productData.codigoBarra?.trim() || "N/A";

    const nuevoProducto = {
        ...productData,
        codigoBarra: codigoFinal,
        id: Date.now(),
        categoria: Number(productData.categoria),
    };

    onSave(nuevoProducto);
    setProductData(initialState);
    setErrors({});
    onClose();
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Crear Producto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <FormSection title="Fotos del Producto">
                        <div className="flex gap-3 flex-wrap">
                            {productData.fotos.map((foto, index) => (
                                <div
                                    key={index}
                                    className="relative w-24 h-24 rounded-lg border border-gray-300"
                                >
                                    {/* Botón de eliminar en esquina superior izquierda */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedFotos = [...productData.fotos];
                                            updatedFotos.splice(index, 1);
                                            setProductData((prev) => ({ ...prev, fotos: updatedFotos }));
                                        }}
                                        className="absolute -top-1.5 -right-1.5 bg-gray-700/70 hover:bg-gray-300 text-gray-600 hover:text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition z-10"
                                        title="Eliminar imagen"
                                    >
                                        <span className="text-xs text-white leading-none"><FaTimes /></span>
                                    </button>

                                    <img
                                        src={foto}
                                        alt={`Foto ${index + 1}`}
                                        className="object-cover w-full h-full rounded-lg"
                                    />
                                </div>
                            ))}

                            {productData.fotos.length < 3 && (
                                <>
                                    <label
                                        htmlFor="fotos"
                                        className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100"
                                    >
                                        <FaPlus />
                                        <span className="text-xs">Agregar</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="fotos"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files).slice(0, 3 - productData.fotos.length);
                                            const readers = files.map((file) => {
                                                return new Promise((resolve) => {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => resolve(reader.result);
                                                    reader.readAsDataURL(file);
                                                });
                                            });

                                            Promise.all(readers).then((images) => {
                                                setProductData((prev) => ({
                                                    ...prev,
                                                    fotos: [...prev.fotos, ...images],
                                                }));
                                            });
                                        }}
                                        className="hidden"
                                    />
                                </>
                            )}
                        </div>
                    </FormSection>

                    <FormSection title="Información Principal">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel htmlFor="nombre">* Nombre:</FormLabel>
                                <input type="text" id="nombre" name="nombre" value={productData.nombre} onChange={handleChange} onBlur={handleBlur} className={inputBaseStyle} required />
                                {errors.duplicate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.duplicate}</p>
                                )}
                            </div>
                            <div>
                                <FormLabel htmlFor="modelo">* Modelo:</FormLabel>
                                <input type="text" id="modelo" name="modelo" value={productData.modelo} onChange={handleChange} onBlur={handleBlur} className={inputBaseStyle} required />
                            </div>
                            <div className="relative">
                                <FormLabel htmlFor="categoria">* Categoría:</FormLabel>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={productData.categoria}
                                    onChange={handleChange}
                                    className={`${inputBaseStyle} appearance-none pr-10 text-gray-500`}
                                    required
                                >
                                    <option value="">Seleccione la categoría</option>
                                    <option value="seguridad">Seguridad</option>
                                    
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="relative">
                                <FormLabel htmlFor="unidad">* Unidad:</FormLabel>
                                <select
                                    id="unidad"
                                    name="unidad"
                                    value={productData.unidad}
                                    onChange={handleChange}
                                    className={`${inputBaseStyle} appearance-none pr-10 text-gray-500`}
                                    required
                                >
                                    <option value="">Seleccione la unidad</option>
                                    <option value="Unidad">Unidad</option>
                                    <option value="Metros">Metros</option>
                                    <option value="Tramo 2 metros">Tramo 2 metros</option>
                                    <option value="Tramo 3 metros">Tramo 3 metros</option>
                                    <option value="Paquetes">Paquetes</option>
                                    <option value="Kit">Kit</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <FormLabel htmlFor="precio">* Precio:</FormLabel>
                                <input type="number" id="precio" name="precio" value={productData.precio} onChange={handleChange} className={inputBaseStyle} required />
                            </div>
                            <div>
                                <FormLabel htmlFor="stock">* Cantidad:</FormLabel>
                                <input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} className={inputBaseStyle} required />
                            </div>
                            <div>
                                <FormLabel htmlFor="garantia">* Garantía (meses):</FormLabel>
                                <input type="number" id="garantia" name="garantia" value={productData.garantia} onChange={handleChange} className={inputBaseStyle} required />
                                {productData.garantia && productData.garantia < 12 && (
                                    <p className="text-red-500 text-sm mt-2">La garantía debe ser de al menos 12 meses.</p>
                                )}
                            </div>
                            <div>
                                <FormLabel htmlFor="codigoBarra">Código de barra:</FormLabel>
                                <input type="text" id="codigoBarra" name="codigoBarra" value={productData.codigoBarra} onChange={handleChange} placeholder="N/A" className={inputBaseStyle} />
                            </div>
                        </div>
                    </FormSection>


                    <FormSection title="Especificaciones Técnicas">
                        {productData.especificaciones_tecnicas.map((esp, index) => (
                            <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center mb-2">

                                {/* Selector de conceptos estándar */}
                                {esp.concepto === 'otro' ? (
                                    <input
                                        type="text"
                                        placeholder="Nuevo concepto"
                                        value={esp.valor_custom || ''}
                                        onChange={(e) => handleEspecificationChange(index, 'valor_custom', e.target.value)}
                                        className={inputBaseStyle}
                                        required
                                    />
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={esp.concepto}
                                            onChange={(e) => handleEspecificationChange(index, 'concepto', e.target.value)}
                                            className={`${inputBaseStyle} appearance-none pr-10 text-gray-500`}
                                            required
                                        >
                                            <option value="">Seleccione concepto</option>
                                            <option value="Color">Color</option>
                                            <option value="Material">Material</option>
                                            <option value="Peso">Peso</option>
                                            <option value="Tamaño">Tamaño</option>
                                            <option value="otro">Otro...</option>
                                        </select>

                                        {/* Icono de flecha */}
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
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

                                {/* Valor */}
                                <input
                                    type="text"
                                    placeholder="Valor"
                                    value={esp.valor}
                                    onChange={(e) => handleEspecificationChange(index, 'valor', e.target.value)}
                                    className={inputBaseStyle}
                                    required
                                />

                                {/* Eliminar */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEspecification(index)}
                                    className="text-gray-400 hover:text-red-600 transition"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddEspecification}
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg  shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaPlus className="text-white" size={12} />
                            Agregar especificación
                        </button>
                    </FormSection>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105" disabled={productData.garantia && productData.garantia < 12}>Guardar</button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default NewProductModal;