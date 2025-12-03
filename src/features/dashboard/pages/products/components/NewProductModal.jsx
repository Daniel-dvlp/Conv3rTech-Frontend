import React, { useState } from 'react';
import { FaTimes, FaTrash, FaPlus, FaReply, FaSpinner } from 'react-icons/fa';
import { featuresService } from '../services/productsService';
import cloudinaryService from '../../../../../services/cloudinaryService';

// Componentes funcionales auxiliares
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

const NewProductModal = ({ isOpen, onClose, onSave, categories, existingProducts, features }) => {
    const initialState = {
        fotos: [],
        nombre: '',
        modelo: '',
        id_categoria: '',
        unidad_medida: '',
        precio: '',
        stock: '',
        garantia: '',
        codigo_barra: '',
        fichas_tecnicas: [],
        estado: true,
    };

    const [productData, setProductData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        // Limpiar errores del servidor cuando el usuario modifica campos
        if (newErrors.servidor) delete newErrors.servidor;
        
        switch (name) {
            case 'nombre':
                if (!value?.trim()) {
                    newErrors.nombre = 'El nombre es obligatorio';
                } else if (value.trim().length < 3) {
                    newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
                } else {
                    delete newErrors.nombre;
                }
                break;
            case 'modelo':
                if (!value?.trim()) {
                    newErrors.modelo = 'El modelo es obligatorio';
                } else if (value.trim().length < 2) {
                    newErrors.modelo = 'El modelo debe tener al menos 2 caracteres';
                } else {
                    delete newErrors.modelo;
                }
                break;
            case 'id_categoria':
                if (!value) {
                    newErrors.id_categoria = 'Selecciona una categoría';
                } else {
                    delete newErrors.id_categoria;
                }
                break;
            case 'unidad_medida':
                if (!value) {
                    newErrors.unidad_medida = 'Selecciona una unidad de medida';
                } else {
                    delete newErrors.unidad_medida;
                }
                break;
            case 'precio':
                // Parsear precio formateado para validación
                const precioLimpioVal = value ? parsePrecio(value) : '';
                const precioNumericoVal = precioLimpioVal ? parseFloat(precioLimpioVal) : 0;
                if (!value || precioNumericoVal <= 0 || isNaN(precioNumericoVal)) {
                    newErrors.precio = 'Ingresa un precio válido mayor a 0';
                } else {
                    delete newErrors.precio;
                }
                break;
            case 'stock':
                if (value === '' || value === null || value === undefined) {
                    newErrors.stock = 'Ingresa una cantidad';
                } else if (Number(value) < 0) {
                    newErrors.stock = 'La cantidad no puede ser negativa';
                } else {
                    delete newErrors.stock;
                }
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

    const handleKeyDown = (e) => {
      // Prevenir entrada de 'e', 'E', '+', '-' en campos numéricos
      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
        e.preventDefault();
      }
    };

    // Función para formatear número a formato con puntos y comas
    const formatPrecio = (value) => {
      if (!value || value === '') return '';
      // Si ya está formateado, retornarlo
      if (typeof value === 'string' && value.includes('.')) {
        return value;
      }
      // Convertir número a string y formatear
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(numValue)) return '';
      
      const parts = numValue.toString().split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1] || '';
      
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return decimalPart ? `${formattedInteger},${decimalPart.substring(0, 2)}` : formattedInteger;
    };

    // Función para parsear precio formateado a número
    const parsePrecio = (formattedValue) => {
      if (!formattedValue || formattedValue === '') return '';
      // Quitar puntos y cambiar coma por punto
      const cleanValue = formattedValue.replace(/\./g, '').replace(',', '.');
      return cleanValue;
    };

    const handlePrecioChange = (e) => {
      // 1. Obtener el valor limpio (sin símbolos ni puntos, solo números y comas)
      let rawValue = e.target.value.replace(/[^0-9,]/g, '');

      // 2. Evitar múltiples comas: solo permitir la primera
      const parts = rawValue.split(',');
      if (parts.length > 2) {
        rawValue = parts[0] + ',' + parts.slice(1).join('');
      }

      if (rawValue === '') {
        setProductData((prev) => ({
          ...prev,
          precio: '',
        }));
        validateField('precio', '');
        return;
      }

      // 3. Separar enteros y decimales
      const partsFinal = rawValue.split(',');
      let integerPart = partsFinal[0];
      // Limitar decimales a 2 dígitos
      const decimalPart = partsFinal.length > 1 ? ',' + partsFinal[1].substring(0, 2) : '';

      // 4. Formatear la parte entera con puntos
      // Eliminar ceros a la izquierda si no es solo "0"
      if (integerPart.length > 1 && integerPart.startsWith('0')) {
        integerPart = integerPart.replace(/^0+/, '');
      }
      if (integerPart === '') integerPart = '0';

      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const formattedValue = formattedInteger + decimalPart;

      setProductData((prev) => ({
        ...prev,
        precio: formattedValue,
      }));

      // Validar con el valor parseado
      const parsedValue = parsePrecio(formattedValue);
      validateField('precio', parsedValue);
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      
      // Si es precio, usar el handler especial
      if (name === 'precio') {
        handlePrecioChange(e);
        return;
      }
      
      const finalValue = type === 'checkbox' ? checked : value;
      setProductData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
      validateField(name, finalValue);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        if (name === 'nombre' || name === 'modelo') {
            validateDuplicate();
        }
    };

    // Fichas técnicas
    const handleAddFicha = () => {
        setProductData((prev) => ({
            ...prev,
            fichas_tecnicas: [...(prev.fichas_tecnicas || []), { id_caracteristica: '', valor: '' }],
        }));
    };

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
    
    // Función para volver al selector
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

    const handleRemoveFicha = (index) => {
        const updated = [...(productData.fichas_tecnicas || [])];
        updated.splice(index, 1);
        setProductData((prev) => ({ ...prev, fichas_tecnicas: updated }));
    };

    // Fotos con Cloudinary
    const handleRemoveFoto = (index) => {
        const updatedFotos = [...(productData.fotos || [])];
        updatedFotos.splice(index, 1);
        setProductData((prev) => ({ ...prev, fotos: updatedFotos }));
    };

    const handleAddFotos = async (e) => {
        const files = Array.from(e.target.files).slice(0, 4 - (productData.fotos?.length || 0));
        
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
            // Subir imágenes a Cloudinary a través del backend
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
            // Limpiar el input
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Limpiar errores previos del servidor
        setErrors(prev => {
            const newErrs = { ...prev };
            delete newErrs.servidor;
            return newErrs;
        });

        // Validar todos los campos obligatorios
        const errs = {};
        if (!productData.nombre?.trim()) {
            errs.nombre = 'El nombre es obligatorio';
        } else if (productData.nombre.trim().length < 3) {
            errs.nombre = 'El nombre debe tener al menos 3 caracteres';
        }
        
        if (!productData.modelo?.trim()) {
            errs.modelo = 'El modelo es obligatorio';
        } else if (productData.modelo.trim().length < 2) {
            errs.modelo = 'El modelo debe tener al menos 2 caracteres';
        }
        
        if (!productData.id_categoria) {
            errs.id_categoria = 'Selecciona una categoría';
        }
        
        if (!productData.unidad_medida) {
            errs.unidad_medida = 'Selecciona una unidad de medida';
        }
        
        // Parsear precio formateado para validación
        const precioLimpio = productData.precio ? parsePrecio(productData.precio) : '';
        const precioNumerico = precioLimpio ? parseFloat(precioLimpio) : 0;
        if (!productData.precio || precioNumerico <= 0 || isNaN(precioNumerico)) {
            errs.precio = 'Ingresa un precio válido mayor a 0';
        }
        
        if (productData.stock === '' || productData.stock === null || productData.stock === undefined) {
            errs.stock = 'Ingresa una cantidad';
        } else if (Number(productData.stock) < 0) {
            errs.stock = 'La cantidad no puede ser negativa';
        }
        
        if (!productData.garantia || ![6, 12, 24, 36].includes(Number(productData.garantia))) {
            errs.garantia = 'Selecciona una garantía válida (6, 12, 24 o 36 meses)';
        }

        // Validar duplicados solo si nombre y modelo están completos
        if (productData.nombre?.trim() && productData.modelo?.trim()) {
            const nombreNorm = normalizeText(productData.nombre);
            const modeloNorm = normalizeText(productData.modelo);
            const isDuplicate = existingProducts?.some(
                (prod) => normalizeText(prod.nombre) === nombreNorm && normalizeText(prod.modelo) === modeloNorm
            );
            
            if (isDuplicate) {
                errs.duplicate = 'Ya existe un producto con este nombre y modelo';
            }
        }

        // Si hay errores, mostrarlos y NO continuar
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            
            // Hacer scroll al primer error después de que se actualice el DOM
            setTimeout(() => {
                const firstErrorField = document.querySelector('.border-red-500');
                if (firstErrorField) {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    // Si no hay campo con borde rojo, buscar el primer mensaje de error
                    const firstErrorMsg = document.querySelector('.text-red-500');
                    if (firstErrorMsg) {
                        firstErrorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 100);
            
            // NO continuar - el formulario NO se enviará
            return;
        }

        // Si llegamos aquí, no hay errores de validación
        setLoading(true);

        try {
            let fichasProcesadas = [];

            for (const ficha of productData.fichas_tecnicas) {
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

            // Parsear precio formateado a número
            const precioLimpio = productData.precio ? parsePrecio(productData.precio) : '';
            const precioNumerico = precioLimpio ? parseFloat(precioLimpio) : 0;

            const newProduct = {
                ...productData,
                // Conversiones a número para el cuerpo principal
                id_categoria: Number(productData.id_categoria),
                precio: precioNumerico,
                stock: Number(productData.stock),
                garantia: Number(productData.garantia),
                codigo_barra: productData.codigo_barra?.trim() || 'n/a',
                fichas_tecnicas: fichasProcesadas, // Array de IDs numéricos
                estado: !!productData.estado,
                // Asegurar que fotos sea un array válido
                fotos: Array.isArray(productData.fotos) ? productData.fotos : []
            };

            await onSave(newProduct);
            // Si onSave no lanza error, el modal se cerrará desde el componente padre
            setProductData(initialState);
            setErrors({});
        } catch (error) {
            // Manejar errores del servidor
            const errorMessage = error?.response?.data?.message || 
                                error?.response?.data?.errors?.[0]?.msg || 
                                error?.message || 
                                'Ocurrió un error al crear el producto';
            setErrors(prev => ({
                ...prev,
                servidor: errorMessage
            }));
            
            // Hacer scroll al error del servidor
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


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Crear Producto</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
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
                                        <span className="text-xs text-white leading-none"><FaTimes /></span>
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
                                        htmlFor="fotos"
                                        className="w-24 h-24 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors"
                                    >
                                        <FaPlus />
                                        <span className="text-xs">Agregar</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="fotos"
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

                    <FormSection title="Información Principal">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel htmlFor="nombre"><span className="text-red-500">*</span> Nombre:</FormLabel>
                                <input type="text" id="nombre" name="nombre" value={productData.nombre} onChange={handleChange} onBlur={handleBlur} className={`${inputBaseStyle} ${errors.nombre ? 'border-red-500' : ''}`}  />
                                {errors.nombre && (
                                    <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                                )}
                                {errors.duplicate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.duplicate}</p>
                                )}
                            </div>
                            <div>
                                <FormLabel htmlFor="modelo"><span className="text-red-500">*</span> Modelo:</FormLabel>
                                <input type="text" id="modelo" name="modelo" value={productData.modelo} onChange={handleChange} onBlur={handleBlur} className={`${inputBaseStyle} ${errors.modelo ? 'border-red-500' : ''}`}  />
                                {errors.modelo && (
                                    <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>
                                )}
                            </div>
                            <div className="relative">
                                <FormLabel htmlFor="id_categoria"><span className="text-red-500">*</span> Categoría:</FormLabel>
                                <select
                                    id="id_categoria"
                                    name="id_categoria"
                                    value={productData.id_categoria}
                                    onChange={handleChange}
                                    className={`${inputBaseStyle} appearance-none pr-10 text-gray-500 ${errors.id_categoria ? 'border-red-500' : ''}`}
                                    
                                >
                                    <option value="" disabled>Seleccione una categoría</option>
                                    {categories?.length > 0 ? (
                                        categories.map((cat) => (
                                            <option key={cat.id_categoria} value={cat.id_categoria}>
                                                {cat.nombre}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No hay categorías</option>
                                    )}
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
                                {errors.id_categoria && (
                                    <p className="text-red-500 text-sm mt-1">{errors.id_categoria}</p>
                                )}
                            </div>

                            <div className="relative">
                                <FormLabel htmlFor="unidad_medida"><span className="text-red-500">*</span> Unidad:</FormLabel>
                                <select
                                    id="unidad_medida"
                                    name="unidad_medida"
                                    value={productData.unidad_medida}
                                    onChange={handleChange}
                                    className={`${inputBaseStyle} appearance-none pr-10 text-gray-500 ${errors.unidad_medida ? 'border-red-500' : ''}`}
                                    
                                >
                                    <option value="">Seleccione la unidad:</option>
                                    <option value="unidad">Unidad</option>
                                    <option value="metros">Metros</option>
                                    <option value="tramo 2 metros">Tramo 2 metros</option>
                                    <option value="tramo 3 metros">Tramo 3 metros</option>
                                    <option value="paquetes">Paquetes</option>
                                    <option value="kit">Kit</option>
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
                                {errors.unidad_medida && (
                                    <p className="text-red-500 text-sm mt-1">{errors.unidad_medida}</p>
                                )}
                            </div>
                            <div>
                                <FormLabel htmlFor="precio"><span className="text-red-500">*</span> Precio:</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-sm">$</span>
                                    <input 
                                        type="text" 
                                        id="precio" 
                                        name="precio" 
                                        value={productData.precio} 
                                        onChange={handlePrecioChange} 
                                        onKeyDown={handleKeyDown} 
                                        className={`${inputBaseStyle} pl-6 ${errors.precio ? 'border-red-500' : ''}`}
                                        placeholder="0,00"
                                    />
                                </div>
                                {errors.precio && (
                                    <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
                                )}
                            </div>
                            <div>
                                <FormLabel htmlFor="stock"><span className="text-red-500">*</span> Cantidad:</FormLabel>
                                <input type="number" id="stock" name="stock" value={productData.stock} onChange={handleChange} onKeyDown={handleKeyDown} className={`${inputBaseStyle} ${errors.stock ? 'border-red-500' : ''}`}  />
                                {errors.stock && (
                                    <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                                )}
                            </div>
                            <div className="relative">
                                <FormLabel htmlFor="garantia"><span className="text-red-500">*</span> Garantía (meses):</FormLabel>
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
                            <div>
                                <FormLabel htmlFor="codigo_barra">Código de barra:</FormLabel>
                                <input type="text" id="codigo_barra" name="codigo_barra" value={productData.codigo_barra} onChange={handleChange} placeholder="N/A" className={inputBaseStyle} />
                            </div>
                        </div>
                    </FormSection>

                    {/* SECCIÓN DE FICHAS TÉCNICAS (CORREGIDA) */}
                    <FormSection title="Fichas Técnicas">
                        {(productData.fichas_tecnicas || []).map((ficha, index) => (
                            <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start mb-2">
                                {/* Bloque de Característica (Selector o Input) */}
                                <div>
                                    <FormLabel htmlFor={`caracteristica_input_${index}`}><span className="text-red-500">*</span> Característica:</FormLabel>
                                    
                                    {ficha.id_caracteristica === "otro" ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id={`caracteristica_input_${index}`}
                                                placeholder="Ingrese la nueva característica"
                                                value={ficha.nuevaCaracteristica || ""}
                                                onChange={(e) => handleFichaChange(index, 'nuevaCaracteristica', e.target.value)}
                                                className={inputBaseStyle}
                                                
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
                                                
                                            >
                                                <option value="">Seleccione una característica</option>
                                                {Array.isArray(features) && features.map((feat) => (
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
                                
                                {/* Bloque de Valor */}
                                <div>
                                    <FormLabel htmlFor={`valor_${index}`}><span className="text-red-500">*</span> Valor:</FormLabel>
                                    <input
                                        type="text"
                                        id={`valor_${index}`}
                                        name={`valor_${index}`}
                                        value={ficha.valor}
                                        onChange={(e) => handleFichaChange(index, 'valor', e.target.value)}
                                        className={inputBaseStyle}
                                        
                                    />
                                </div>
                                
                                {/* Botón de eliminar */}
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
                            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg  shadow-sm hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FaPlus className="text-white" size={12} />
                            Agregar ficha técnica
                        </button>
                    </FormSection>

                    {/* Botones de acción */}
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
                            {uploadingImages ? 'Subiendo imágenes...' : loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
};

export default NewProductModal;