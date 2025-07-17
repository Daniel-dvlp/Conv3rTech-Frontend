import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrash, FaPlus } from 'react-icons/fa';
import { Switch } from '@headlessui/react';

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
const normalizeText = (text) => text?.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const ToggleSwitch = ({ checked, onChange }) => (
    <Switch
        checked={checked}
        onChange={onChange}
        className={`${checked ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none`}
    >
        <span className={`${checked ? 'translate-x-5' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300`} />
    </Switch>
);

const ProductEditModal = ({ isOpen, onClose, onSave, productToEdit, categories, existingProducts }) => {
    const [productData, setProductData] = useState(null);
    const [errors, setErrors] = useState({});

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
                prod.id !== productData.id &&
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
        setProductData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        if (name === 'nombre' || name === 'modelo') {
            validateDuplicate();
        }
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

        const FinalCode = productData.codigoBarra?.trim() || "N/A";
        onSave({
            ...productData,
            precio: Number(productData.precio),
            stock: Number(productData.stock),
            garantia: Number(productData.garantia),
            codigoBarra: FinalCode,
            categoria: Number(productData.categoria),
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Editar Producto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <FormSection title="Información Principal">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel htmlFor="nombre">* Nombre:</FormLabel>
                                <input type="text" id="nombre" name="nombre" value={productData.nombre} onChange={handleChange} onBlur={handleBlur} className={inputBaseStyle} required />
                                {errors.duplicate && <p className="text-red-500 text-sm mt-1">{errors.duplicate}</p>}
                            </div>
                            <div>
                                <FormLabel htmlFor="modelo">* Modelo:</FormLabel>
                                <input type="text" id="modelo" name="modelo" value={productData.modelo} onChange={handleChange} onBlur={handleBlur} className={inputBaseStyle} required />
                            </div>
                            <div>
                                <FormLabel htmlFor="categoria">* Categoría:</FormLabel>
                                <select id="categoria" name="categoria" value={productData.categoria} onChange={handleChange} className={inputBaseStyle} required>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <FormLabel htmlFor="unidad">* Unidad:</FormLabel>
                                <select id="unidad" name="unidad" value={productData.unidad} onChange={handleChange} className={inputBaseStyle} required>
                                    <option value="Unidad">Unidad</option>
                                    <option value="Metros">Metros</option>
                                    <option value="Tramo 2 metros">Tramo 2 metros</option>
                                    <option value="Tramo 3 metros">Tramo 3 metros</option>
                                    <option value="Paquetes">Paquetes</option>
                                    <option value="Kit">Kit</option>
                                </select>
                            </div>
                            <div><FormLabel htmlFor="precio">* Precio:</FormLabel><input type="number" id="precio" name="precio" value={productData.precio} onChange={handleChange} className={inputBaseStyle} required /></div>
                            <div><FormLabel htmlFor="stock">* Cantidad:</FormLabel><input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} className={inputBaseStyle} required /></div>
                            <div>
                                <FormLabel htmlFor="garantia">* Garantía (meses):</FormLabel>
                                <input type="number" id="garantia" name="garantia" value={productData.garantia} onChange={handleChange} className={inputBaseStyle} required />
                                {productData.garantia && productData.garantia < 12 && <p className="text-red-500 text-sm mt-2">La garantía debe ser de al menos 12 meses.</p>}
                            </div>
                            <div><FormLabel htmlFor="codigoBarra">Código de barra:</FormLabel><input type="text" id="codigoBarra" name="codigoBarra" value={productData.codigoBarra} onChange={handleChange} placeholder="N/A" className={inputBaseStyle} /></div>
                        </div>
                    </FormSection>


                    <FormSection title="Especificaciones Técnicas">
                        {productData.especificaciones_tecnicas.map((esp, index) => (
                            <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center mb-2">
                                <input type="text" placeholder="Concepto" value={esp.concepto} onChange={(e) => handleEspecificationChange(index, 'concepto', e.target.value)} className={inputBaseStyle} required />
                                <input type="text" placeholder="Valor" value={esp.valor} onChange={(e) => handleEspecificationChange(index, 'valor', e.target.value)} className={inputBaseStyle} required />
                                <button type="button" onClick={() => handleRemoveEspecification(index)} className="text-gray-400 hover:text-red-600 transition"><FaTrash /></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => setProductData((prev) => ({
                            ...prev,
                            especificaciones_tecnicas: [...prev.especificaciones_tecnicas, { concepto: '', valor: '' }]
                        }))} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg">
                            <FaPlus className="text-white" size={12} /> Agregar especificación
                        </button>
                    </FormSection>
                    <FormSection title="Fotos del Producto">
                        <div className="flex gap-3 flex-wrap">
                            {productData.fotos?.map((foto, index) => (
                                <div
                                    key={index}
                                    className="relative w-24 h-24 rounded-lg border border-gray-300"
                                >
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

                            {productData.fotos?.length < 4 && (
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
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files).slice(0, 4 - productData.fotos.length);
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

                    <FormSection title="Estado del Producto">
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-700 font-medium">Activo:</span>
                            <ToggleSwitch
                                checked={productData.estado}
                                onChange={() => setProductData((prev) => ({ ...prev, estado: !prev.estado }))}
                            />
                        </div>
                    </FormSection>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105" disabled={productData.garantia && productData.garantia < 12}>Guardar cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditModal;
