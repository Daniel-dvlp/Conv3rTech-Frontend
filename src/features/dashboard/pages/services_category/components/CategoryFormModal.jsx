import React, { useState, useEffect, useRef } from 'react';
import { showSuccess } from '../../../../../shared/utils/alerts';
import cloudinaryService from '../../../../../services/cloudinaryService';
import { toast } from 'react-hot-toast';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, categoria, esEdicion }) => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    url_imagen: '',
    estado: 'Activo',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const descripcionRef = useRef(null);

  // Cargar datos si es edición
  useEffect(() => {
    if (categoria && esEdicion) {
      setFormData({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        url_imagen: categoria.url_imagen || '',
        estado: categoria.estado || 'Activo',
      });

      if (categoria.url_imagen) {
        setPreviewImage(categoria.url_imagen);
      }
    } else {
      setFormData({
        id: null,
        nombre: '',
        descripcion: '',
        url_imagen: '',
        estado: 'Activo',
      });
      setPreviewImage(null);
    }
  }, [categoria, esEdicion]);

  // Ajustar altura del textarea automáticamente
  useEffect(() => {
    if (descripcionRef.current) {
      descripcionRef.current.style.height = 'auto';
      descripcionRef.current.style.height = `${descripcionRef.current.scrollHeight}px`;
    }
  }, [formData.descripcion, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Autoajustar altura del textarea de descripción
    if (name === 'descripcion' && descripcionRef.current) {
      descripcionRef.current.style.height = 'auto';
      descripcionRef.current.style.height = `${descripcionRef.current.scrollHeight}px`;
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        // Subir a Cloudinary
        const cloudinaryUrl = await cloudinaryService.uploadImage(file, 'service-categories');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) return;
    if (!formData.descripcion || formData.descripcion.trim().length < 10) return;
    try {
      await onSubmit(formData);
      // Limpiar el formulario después de enviar exitosamente
      setFormData({ id: null, nombre: '', descripcion: '', url_imagen: '', estado: 'Activo' });
      setPreviewImage(null);
      // NO cerrar aquí - dejar que el padre lo maneje
    } catch (error) {
      // El componente padre maneja los mensajes de error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-center">
          {esEdicion ? 'Editar categoría' : 'Agregar nueva categoría'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Imagen de la categoría */}
          <div className="flex flex-col items-center">
            <label className="text-sm font-medium text-gray-700 mb-2">Imagen de la categoría</label>
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
                  : 'bg-[#FFF2CC] text-[#8A6D00] hover:bg-[#FFE28C]'
              }`}
            >
              {uploading ? '⏳ Subiendo...' : '📁 Elegir imagen'}
            </button>
            {uploading && (
              <p className="text-sm text-blue-600 mb-2">Subiendo imagen a Cloudinary...</p>
            )}
            {previewImage && (
              <img
                src={previewImage}
                alt="Vista previa"
                className="mt-2 rounded-md w-full h-48 object-cover border"
              />
            )}
          </div>

          {/* Nombre */}
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Nombre de la categoría
            </label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre de la categoría"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          {/* En el futuro se subirá a Cloudinary; por ahora es opcional */}

          {/* Descripción */}
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Descripción
            </label>
          <div className="border border-gray-200 rounded-xl p-3 shadow-sm">
            <textarea
              ref={descripcionRef}
              name="descripcion"
              placeholder="Descripción de la categoría"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full text-gray-600 text-sm mt-1 border-none outline-none resize-none overflow-hidden bg-transparent"
              style={{ minHeight: '60px' }}
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
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
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
              className="px-4 py-2 bg-[#FFB800] text-black rounded hover:bg-[#e0a500] transition"
            >
              {esEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
