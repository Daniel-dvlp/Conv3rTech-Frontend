import React, { useState, useEffect, useRef } from 'react';
import { Switch } from '@headlessui/react';
import { serviceCategoryService } from '../../services_category/services/serviceCategoryService.js';
import { showSuccess } from '../../../../../shared/utils/alerts';
import cloudinaryService from '../../../../../services/cloudinaryService';
import { toast } from 'react-hot-toast';

const ToggleSwitch = ({ checked, onChange }) => (
  <Switch
    checked={checked}
    onChange={onChange}
    className={`${checked ? 'bg-green-500' : 'bg-gray-300'}
      relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 focus:outline-none`}
  >
    <span
      className={`${checked ? 'translate-x-5' : 'translate-x-1'}
        inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300`}
    />
  </Switch>
);

const ServiceFormModal = ({ isOpen, onClose, onSubmit, servicio, esEdicion }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: '',
    precio: '',
    descripcion: '',
    imagen: null,
    horas: '',
    minutos: '',
    estado: 'activo',
    url_imagen: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
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
      // Usar id_categoria_servicio del backend o buscar por nombre
      const categoriaId = servicio.id_categoria_servicio || 
        (servicio.categoria?.id || servicio.categoria?.id_categoria_servicio) ||
        (categories.find(cat => cat.nombre === servicio.categoria?.nombre || cat.nombre === servicio.categoria)?.id);

      // Parsear duración si existe (formato "1h 30m", "2h" o "45m")
      let horas = '';
      let minutos = '';
      if (servicio.duracion) {
        // Buscar horas: "1h" o "1h 30m"
        const horasMatch = servicio.duracion.match(/(\d+)h/);
        if (horasMatch) {
          horas = horasMatch[1];
        }
        // Buscar minutos: "30m" o "1h 30m" o solo "45m"
        const minutosMatch = servicio.duracion.match(/(\d+)m/);
        if (minutosMatch) {
          minutos = minutosMatch[1];
        }
      }

      setFormData({
        nombre: servicio.nombre || '',
        categoriaId: categoriaId || '',
        precio: servicio.precio || '',
        descripcion: servicio.descripcion || '',
        imagen: servicio.url_imagen || null,
        horas: horas,
        minutos: minutos,
        id: servicio.id_servicio || servicio.id,
        estado: (servicio.estado || 'activo').toLowerCase(),
        url_imagen: servicio.url_imagen || '',
      });

      if (servicio.url_imagen || servicio.imagen) {
        setPreviewImage(servicio.url_imagen || servicio.imagen);
      }
    } else {
      setFormData({
        nombre: '',
        categoriaId: '',
        precio: '',
        descripcion: '',
        imagen: null,
        horas: '',
        minutos: '',
        estado: 'activo',
        url_imagen: '',
      });
      setPreviewImage(null);
    }
  }, [esEdicion, servicio, categories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
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
    }
  };

  const handleDurationChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));
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

    const duracionFormateada = formatDuration(formData.horas, formData.minutos);

    const datosAEnviar = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: formData.precio,
      estado: formData.estado,
      id_categoria_servicio: parseInt(formData.categoriaId),
      categoriaId: parseInt(formData.categoriaId),
      url_imagen: formData.url_imagen || (typeof formData.imagen === 'string' ? formData.imagen : ''),
      duracion: duracionFormateada,
    };

    if (esEdicion) {
      datosAEnviar.id = formData.id;
      datosAEnviar.id_servicio = formData.id;
    }

    try {
      await onSubmit(datosAEnviar);
    } catch (error) {
      // El componente padre maneja los mensajes de error
    }
  };

  if (!isOpen) return null;

  return (
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
            </div>
            {(formData.horas || formData.minutos) && (
              <p className="text-sm text-gray-500 mt-1">
                Duración: {formatDuration(formData.horas, formData.minutos)}
              </p>
            )}
          </div>

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

          {/* Estado con Switch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 font-medium">
                {formData.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
              <ToggleSwitch
                checked={formData.estado === 'activo'}
                onChange={() => setFormData(prev => ({ 
                  ...prev, 
                  estado: prev.estado === 'activo' ? 'inactivo' : 'activo' 
                }))}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FFB800] text-black rounded hover:bg-[#e0a500]"
            >
              {esEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
