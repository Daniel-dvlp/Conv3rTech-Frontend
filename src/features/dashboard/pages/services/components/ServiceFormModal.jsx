import React, { useState, useRef } from 'react';

const ServiceFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    duracion: '',
    descripcion: '',
    imagen: null,
    horas: '',
    minutos: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef();

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

  const handleDurationChange = (type, value) => {
    const horas = type === 'horas' ? value : formData.horas || '0';
    const minutos = type === 'minutos' ? value : formData.minutos || '0';

    setFormData((prev) => ({
      ...prev,
      [type]: value,
      duracion: `${horas}h ${minutos}m`,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      nombre: '',
      categoria: '',
      precio: '',
      duracion: '',
      descripcion: '',
      imagen: null,
      horas: '',
      minutos: '',
    });
    setPreviewImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-center">Agregar un nuevo servicio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Imagen del servicio */}
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
            />

            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mb-2 px-4 py-2 bg-[#FFB800] text-black font-semibold rounded hover:bg-[#e0a500] transition"
            >
              📁 Elegir imagen
            </button>

            {formData.imagen && (
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

          {/* Campos de texto */}
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del servicio"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            name="categoria"
            placeholder="Categoría"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={formData.precio}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          {/* Duración aproximada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración aproximada</label>
            <div className="flex gap-2">
              <select
                value={formData.horas}
                onChange={(e) => handleDurationChange('horas', e.target.value)}
                className="w-1/2 border rounded px-3 py-2"
              >
                <option value="">Horas</option>
                {[...Array(6)].map((_, i) => (
                  <option key={i} value={i}>
                    {i} hora{i !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <select
                value={formData.minutos}
                onChange={(e) => handleDurationChange('minutos', e.target.value)}
                className="w-1/2 border rounded px-3 py-2"
              >
                <option value="0">Minutos</option>
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="20">20 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
              </select>
            </div>
          </div>

          <textarea
            name="descripcion"
            placeholder="Descripción del servicio"
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
              className="px-4 py-2 bg-[#FFB800] text-black rounded hover:bg-[#e0a500]"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
