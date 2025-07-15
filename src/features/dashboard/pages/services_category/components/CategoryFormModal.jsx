import React, { useState, useEffect, useRef } from 'react';
import { showSuccess } from '../../../../../shared/utils/alerts';

const CategoryFormModal = ({ isOpen, onClose, onSubmit, categoria, esEdicion }) => {
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    descripcion: '',
    imagen: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef();

  // Cargar datos si es edición
  useEffect(() => {
    if (categoria && esEdicion) {
      setFormData({
        id: categoria.id,
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        imagen: categoria.imagen || null,
      });

      // Si es una imagen tipo File, genera preview
      if (categoria.imagen instanceof File) {
        setPreviewImage(URL.createObjectURL(categoria.imagen));
      } else if (typeof categoria.imagen === 'string') {
        setPreviewImage(categoria.imagen);
      } else {
        setPreviewImage(null);
      }
    } else {
      // Reset si no es edición
      setFormData({ id: null, nombre: '', descripcion: '', imagen: null });
      setPreviewImage(null);
    }
  }, [categoria, esEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ id: null, nombre: '', descripcion: '', imagen: null });
    setPreviewImage(null);
    showSuccess(esEdicion ? 'Categoría actualizada correctamente' : 'Categoría guardada correctamente');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
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
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mb-2 px-4 py-2 bg-[#FFF2CC] text-[#8A6D00] font-semibold rounded hover:bg-[#FFE28C] transition"
            >
              📁 Elegir imagen
            </button>
            {formData.imagen && typeof formData.imagen === 'object' && (
              <p className="text-sm text-gray-600 mb-2">{formData.imagen.name}</p>
            )}
            {previewImage && (
              <img
                src={previewImage}
                alt="Vista previa"
                className="mt-2 rounded-md w-full h-48 object-cover border"
              />
            )}
          </div>

          {/* Nombre y descripción */}
          <input
            type="text"
            name="nombre"
            placeholder="Nombre de la categoría"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          <textarea
            name="descripcion"
            placeholder="Descripción de la categoría"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
            required
          ></textarea>

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
