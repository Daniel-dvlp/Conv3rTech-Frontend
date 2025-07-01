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

const inputBaseStyle = 'block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500';
const inputHiddenStyle = 'absolute opacity-0 w-0 h-0';

const normalizeText = (text) => text?.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const NewProductModal = ({ isOpen, onClose, onSave, categories, existingProducts }) => {
    const initialState = {
        foto: '', nombre: '', modelo: '', categoria: '', unidad: '',
        precio: '', stock: '', garantia: '', codigos: [], especificaciones_tecnicas: [], estado: true,
    };

    const [productData, setProductData] = useState(initialState);
    const [errors, setErrors] = useState({});

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

    const handleAddCode = () => {
        setProductData((prev) => ({ ...prev, codigos: [...prev.codigos, { codigo: '' }] }));
    };

    const handleCodeChange = (index, value) => {
        const updated = [...productData.codigos];
        updated[index].codigo = value;
        setProductData((prev) => ({ ...prev, codigos: updated }));
    };

    const handleRemoveCode = (index) => {
        const updated = [...productData.codigos];
        updated.splice(index, 1);
        setProductData((prev) => ({ ...prev, codigos: updated }));
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
        onSave({ ...productData, id: Date.now(), categoria: Number(productData.categoria) });
        setProductData(initialState);
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Crear Producto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <FormSection title="Foto del Producto">
                        <label htmlFor="foto" className="cursor-pointer flex justify-center">
                            <div className="h-24 w-24 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden">
                                {productData.foto ? (
                                    <img
                                        src={productData.foto}
                                        alt="Vista previa"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FaCamera className="text-gray-400 text-2xl" />
                                )}
                            </div>
                            <input type="file" id="foto" accept="image/*" onChange={handleImageChange} className="absolute opacity-0 w-0 h-0" />
                        </label>
                    </FormSection>

                    <FormSection title="Información Principal">
                        <div><FormLabel htmlFor="nombre">*Nombre:</FormLabel><input type="text" id="nombre" name="nombre" value={productData.nombre} onChange={handleChange} onBlur={handleBlur} className={inputBaseStyle} required /></div>
                        <div><FormLabel htmlFor="modelo">*Modelo:</FormLabel><input type="text" id="modelo" name="modelo" value={productData.modelo} onChange={handleChange} onBlur={handleBlur} className={inputBaseStyle} required /></div>
                        {errors.duplicate && <p className="text-red-500 text-sm -mt-4">{errors.duplicate}</p>}
                        <div><FormLabel htmlFor="categoria">*Categoría:</FormLabel><select id="categoria" name="categoria" value={productData.categoria} onChange={handleChange} className={inputBaseStyle} required><option value="">Seleccione la categoría</option>{categories?.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}</select></div>
                        <div><FormLabel htmlFor="unidad">*Unidad de medida:</FormLabel><select id="unidad" name="unidad" value={productData.unidad} onChange={handleChange} className={inputBaseStyle} required><option value="">Seleccione la unidad</option><option value="unidad">Unidad</option><option value="metro">Metro</option></select></div>
                        <div><FormLabel htmlFor="precio">*Precio:</FormLabel><input type="number" id="precio" name="precio" value={productData.precio} onChange={handleChange} className={inputBaseStyle} required /></div>
                        <div><FormLabel htmlFor="stock">*Cantidad:</FormLabel><input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} className={inputBaseStyle} required /></div>
                        <div>
                            <FormLabel htmlFor="garantia">Garantía (meses):</FormLabel>
                            <input type="number" id="garantia" name="garantia" value={productData.garantia} onChange={handleChange} className={inputBaseStyle} required />
                            {productData.garantia && productData.garantia < 12 && (
                                <p className="text-red-500 text-sm mt-2">La garantía debe ser de al menos 12 meses.</p>
                            )}
                        </div>
                    </FormSection>

                    <FormSection title="Códigos de Barras">
                        {productData.codigos.map((c, index) => (
                            <div key={index} className="flex gap-2 items-center mb-2">
                                <input type="text" value={c.codigo} onChange={(e) => handleCodeChange(index, e.target.value)} className={inputBaseStyle} required />
                                <button type="button" onClick={() => handleRemoveCode(index)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddCode} className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors"><FaPlus size={12} /> Agregar código</button>
                    </FormSection>

                    <FormSection title="Especificaciones Técnicas">
                        {productData.especificaciones_tecnicas.map((esp, index) => (
                            <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center mb-2">
                                <input type="text" placeholder="Concepto" value={esp.concepto} onChange={(e) => handleEspecificationChange(index, 'concepto', e.target.value)} className={inputBaseStyle} required />
                                <input type="text" placeholder="Valor" value={esp.valor} onChange={(e) => handleEspecificationChange(index, 'valor', e.target.value)} className={inputBaseStyle} required />
                                <button type="button" onClick={() => handleRemoveEspecification(index)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddEspecification} className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors"><FaPlus size={12} /> Agregar especificación</button>
                    </FormSection>

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-transform hover:scale-105" disabled={productData.garantia && productData.garantia < 12}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProductModal;