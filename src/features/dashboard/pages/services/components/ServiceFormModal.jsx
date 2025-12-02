import React, { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaTimes, FaPlus } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { serviceCategoryService } from '../../services_category/services/serviceCategoryService.js';
<<<<<<< HEAD
import { showSuccess } from '../../../../../shared/utils/alerts';
import cloudinaryService from '../../../../../services/cloudinaryService';
import { toast } from 'react-hot-toast';
=======
import cloudinaryService from '../../../../../services/cloudinaryService';
import { toast } from 'react-hot-toast';

// Componentes auxiliares estandarizados
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
    {required && <span className="text-red-500">* </span>}
    {children}
  </label>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className={`${checked ? 'bg-green-500' : 'bg-gray-300'
      } relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none`}
  >
    <span
      className={`${checked ? 'translate-x-5' : 'translate-x-1'
        } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300`}
    />
  </Switch>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';
>>>>>>> origin/dev

const ServiceFormModal = ({ isOpen, onClose, onSubmit, servicio, esEdicion }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: '',
    precio: '',
    descripcion: '',
    url_imagen: '',
    horas: '',
    minutos: '',
    estado: true,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
<<<<<<< HEAD
=======
  const [uploadProgress, setUploadProgress] = useState(0);
>>>>>>> origin/dev
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await serviceCategoryService.getAllCategories();
      const categoriesData = response?.data || response || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (esEdicion && servicio) {
      const categoriaId = servicio.id_categoria_servicio ||
        (servicio.categoria?.id || servicio.categoria?.id_categoria_servicio) ||
        (categories.find(cat => cat.nombre === servicio.categoria?.nombre || cat.nombre === servicio.categoria)?.id);

      let horas = '';
      let minutos = '';
      if (servicio.duracion) {
        const horasMatch = servicio.duracion.match(/(\d+)h/);
        if (horasMatch) horas = horasMatch[1];

        const minutosMatch = servicio.duracion.match(/(\d+)m/);
        if (minutosMatch) minutos = minutosMatch[1];
      }

      setFormData({
        nombre: servicio.nombre || '',
        categoriaId: categoriaId || '',
        precio: servicio.precio || '',
        descripcion: servicio.descripcion || '',
        url_imagen: servicio.url_imagen || '',
        horas: horas,
        minutos: minutos,
        id: servicio.id_servicio || servicio.id,
        estado: (servicio.estado || 'activo').toLowerCase() === 'activo',
      });

      if (servicio.url_imagen) {
        setPreviewImage(servicio.url_imagen);
      }
    } else {
      setFormData({
        nombre: '',
        categoriaId: '',
        precio: '',
        descripcion: '',
        url_imagen: '',
        horas: '',
        minutos: '',
        estado: true,
      });
      setPreviewImage(null);
    }
    setErrors({});
  }, [esEdicion, servicio, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
<<<<<<< HEAD
    if (file) {
      try {
        setUploading(true);
        // Subir a Cloudinary
        const cloudinaryUrl = await cloudinaryService.uploadImage(file, 'services');
        setFormData((prev) => ({ ...prev, url_imagen: cloudinaryUrl }));
        setPreviewImage(cloudinaryUrl);
        toast.success('Imagen subida exitosamente');
      } catch (error) {
        toast.error(error.message || 'Error al subir la imagen');
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false);
      }
=======
    if (!file) return;

    const validation = cloudinaryService.validateImages([file]);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, imagen: validation.errors.join('. ') }));
      toast.error(validation.errors.join('. '));
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const cloudinaryUrl = await cloudinaryService.uploadSingleImage(file, 'services');

      clearInterval(progressInterval);
      setUploadProgress(100);

      setFormData((prev) => ({ ...prev, url_imagen: cloudinaryUrl }));
      setPreviewImage(cloudinaryUrl);

      // Limpiar error de imagen si existe
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.imagen;
        return newErrors;
      });

      toast.success('Imagen subida exitosamente');
    } catch (error) {
      const errorMsg = error.message || 'Error al subir la imagen';
      setErrors(prev => ({ ...prev, imagen: errorMsg }));
      toast.error(errorMsg);
      console.error('Error uploading image:', error);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.url_imagen && formData.url_imagen.includes('res.cloudinary.com')) {
      try {
        await cloudinaryService.deleteImage(formData.url_imagen);
        console.log('✅ Imagen eliminada de Cloudinary');
      } catch (error) {
        console.error('❌ Error al eliminar imagen:', error);
      }
    }

    setFormData((prev) => ({ ...prev, url_imagen: '' }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
>>>>>>> origin/dev
    }
  };

  const handleDurationChange = (type, value) => {
    setFormData((prev) => ({ ...prev, [type]: value }));
  };

  const formatDuration = (horas, minutos) => {
    if (!horas && (!minutos || minutos === '0' || minutos === '')) return '';
    const h = horas && horas !== '' && horas !== '0' ? `${horas}h` : '';
    const m = minutos && minutos !== '0' && minutos !== '' ? `${minutos}m` : '';
    if (h && m) return `${h} ${m}`;
    return h || m;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Limpiar errores previos
    setErrors({});

    const duracionFormateada = formatDuration(formData.horas, formData.minutos);

    const datosAEnviar = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: formData.precio,
      estado: formData.estado ? 'activo' : 'inactivo',
      id_categoria_servicio: parseInt(formData.categoriaId),
      categoriaId: parseInt(formData.categoriaId),
      url_imagen: formData.url_imagen || 'https://placehold.co/400x300/png?text=Sin+Imagen',
      duracion: duracionFormateada,
    };

    if (esEdicion) {
      datosAEnviar.id = formData.id;
      datosAEnviar.id_servicio = formData.id;
    }

    setLoading(true);
    try {
      await onSubmit(datosAEnviar);
    } catch (error) {
      const errorMessage = error?.response?.data?.message ||
        error?.response?.data?.errors?.[0]?.msg ||
        error?.message ||
        'Ocurrió un error al guardar el servicio';
      setErrors({ servidor: errorMessage });

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
<<<<<<< HEAD
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-center">
          {esEdicion ? 'Editar servicio' : 'Agregar un nuevo servicio'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagen */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Inserta la imagen del servicio
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className={`mb-2 px-4 py-2 font-semibold rounded transition ${
                uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFB800] text-black hover:bg-[#e0a500]'
              }`}
            >
              {uploading ? '⏳ Subiendo...' : '📁 Elegir imagen'}
            </button>

            {uploading && (
              <p className="text-sm text-blue-600 mb-2">Subiendo imagen a Cloudinary...</p>
            )}

            {formData.imagen && <p className="text-sm text-gray-600 mb-2">{formData.imagen.name}</p>}

            {previewImage && (
              <img
                src={previewImage}
                alt="Vista previa"
                className="mt-2 rounded-md w-full h-48 object-cover border"
              />
            )}
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del servicio"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              name="categoriaId"
              value={formData.categoriaId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seleccione una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.id_categoria_servicio} value={cat.id || cat.id_categoria_servicio}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={formData.precio}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
            <div className="flex gap-2">
              <select
                value={formData.horas}
                onChange={(e) => handleDurationChange('horas', e.target.value)}
                className="w-1/2 border rounded px-3 py-2"
              >
                <option value="">Horas</option>
                {[...Array(5)].map((_, i) => {
                  const horas = i + 1; // Comienza desde 1 hora
                  return (
                    <option key={horas} value={horas}>
                      {horas} {horas === 1 ? 'hora' : 'horas'}
                    </option>
                  );
                })}
              </select>
              <select
                value={formData.minutos}
                onChange={(e) => handleDurationChange('minutos', e.target.value)}
                className="w-1/2 border rounded px-3 py-2"
              >
                <option value="">Minutos</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
              </select>
=======
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-y-auto custom-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-3xl font-bold text-gray-800">
            {esEdicion ? 'Editar Servicio' : 'Crear Servicio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
            disabled={uploading || loading}
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
>>>>>>> origin/dev
            </div>
          )}

<<<<<<< HEAD
          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              placeholder="Descripción del servicio"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 resize-none"
              rows={3}
              required
            ></textarea>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
=======
          {/* Sección de Imagen */}
          <FormSection title="Imagen">
            <div className="flex flex-col items-start">
              {/* Preview de la imagen */}
              {previewImage ? (
                <div className="relative inline-block mb-3">
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="w-50 h-50 object-cover rounded-lg border border-gray-300"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -left-1.5 bg-gray-700/70 hover:bg-gray-300 text-gray-600 hover:text-gray-800 rounded-full w-5 h-5 flex items-center justify-center shadow-sm transition z-10"
                    title="Eliminar imagen"
                    disabled={uploading}
                  >
                    <span className="text-xs text-white leading-none">
                      <FaTimes />
                    </span>
                  </button>
                </div>
              ) : null}

              {/* Estado de carga */}
              {uploading && (
                <div className="w-50 h-50 mb-3 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50">
                  <FaSpinner className="animate-spin text-conv3r-gold text-2xl" />
                  <span className="text-sm text-gray-600 text-center">
                    Subiendo imagen... {uploadProgress}%
                  </span>
                  <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-conv3r-gold h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botón para seleccionar imagen */}
              {!previewImage && !uploading && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="imagen-upload"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-50 h-40 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <FaPlus className="text-3xl pt-2" />
                    <span className="text-sm font-medium">Seleccionar imagen</span>
                    <span className="text-xs text-gray-400 pb-2">JPG, PNG o WEBP (máx. 5MB)</span>
                  </label>
                </>
              )}

              {/* Mensaje de error de imagen */}
              {errors.imagen && (
                <p className="text-red-500 text-sm mt-2">{errors.imagen}</p>
              )}

              {/* Información */}
              {previewImage && (
                <div className="w-full text-left">
                  <p className="text-xs text-gray-500 mt-2">
                    Las imágenes se optimizan automáticamente para mejor rendimiento
                  </p>
                </div>
              )}
            </div>
          </FormSection>

          {/* Información del Servicio */}
          <FormSection title="Información del Servicio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="md:col-span-2">
                <FormLabel htmlFor="nombre" required>Nombre:</FormLabel>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del servicio"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${errors.nombre ? 'border-red-500' : ''}`}
                  required
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <FormLabel htmlFor="categoriaId" required>Categoría:</FormLabel>
                <div className="relative">
                  <select
                    id="categoriaId"
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleChange}
                    className={`${inputBaseStyle} appearance-none pr-10 ${errors.categoriaId ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat.id_categoria_servicio} value={cat.id || cat.id_categoria_servicio}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.categoriaId && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <FormLabel htmlFor="precio" required>Precio:</FormLabel>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  placeholder="0.00"
                  value={formData.precio}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${errors.precio ? 'border-red-500' : ''}`}
                  step="0.01"
                  min="0"
                  required
                />
                {errors.precio && (
                  <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
                )}
              </div>

              {/* Duración */}
              <div className="md:col-span-2">
                <FormLabel>Duración:</FormLabel>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={formData.horas}
                      onChange={(e) => handleDurationChange('horas', e.target.value)}
                      className={`${inputBaseStyle} appearance-none pr-10`}
                    >
                      <option value="">Horas:</option>
                      {[...Array(5)].map((_, i) => {
                        const horas = i + 1;
                        return (
                          <option key={horas} value={horas}>
                            {horas} {horas === 1 ? 'hora' : 'horas'}
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative flex-1">
                    <select
                      value={formData.minutos}
                      onChange={(e) => handleDurationChange('minutos', e.target.value)}
                      className={`${inputBaseStyle} appearance-none pr-10`}
                    >
                      <option value="">Minutos:</option>
                      <option value="10">10 min</option>
                      <option value="15">15 min</option>
                      <option value="20">20 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                {(formData.horas || formData.minutos) && (
                  <p className="text-sm text-gray-500 mt-1">
                    Duración: {formatDuration(formData.horas, formData.minutos)}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <FormLabel htmlFor="descripcion" required>Descripción:</FormLabel>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Descripción del servicio"
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={`${inputBaseStyle} resize-none ${errors.descripcion ? 'border-red-500' : ''}`}
                  rows={3}
                  required
                ></textarea>
                {errors.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                )}
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <FormLabel required className="m-0">Estado:</FormLabel>

                  <ToggleSwitch
                    checked={formData.estado}
                    onChange={(checked) =>
                      setFormData((prev) => ({ ...prev, estado: checked }))
                    }
                  />
                </div>
              </div>

            </div>
          </FormSection>
>>>>>>> origin/dev

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              disabled={uploading || loading}
            >
              {(uploading || loading) && <FaSpinner className="animate-spin" />}
              {uploading ? 'Subiendo...' : loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;