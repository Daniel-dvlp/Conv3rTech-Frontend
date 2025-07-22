import React, { useState, useEffect, useRef } from 'react';
import MockCategories from "../../services_category/data/ServicesCategory_data";
import { showSuccess } from '../../../../../shared/utils/alerts';

const ServiceFormModal = ({ isOpen, onClose, onSubmit, servicio, esEdicion }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: '',
    precio: '',
    duracion: '',
    descripcion: '',
    imagen: null,
    horas: '',
    minutos: '',
    estado: 'activo',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef();

  useEffect(() => {
    setCategories(MockCategories);
  }, []);

  useEffect(() => {
    if (esEdicion && servicio) {
      const [horas = '', minutos = ''] = servicio.duracion
        ?.match(/(\d+)h\s*(\d+)?m?/)?.slice(1) || [];

      const categoriaEncontrada = MockCategories.find(cat => cat.nombre === servicio.categoria);

      setFormData({
        nombre: servicio.nombre || '',
        categoriaId: categoriaEncontrada?.id || '',
        precio: servicio.precio || '',
        duracion: servicio.duracion || '',
        descripcion: servicio.descripcion || '',
        imagen: null,
        horas,
        minutos,
        id: servicio.id,
        estado: servicio.estado || 'activo',
      });

      if (servicio.imagen) {
        setPreviewImage(servicio.imagen);
      }
    } else {
      setFormData({
        nombre: '',
        categoriaId: '',
        precio: '',
        duracion: '',
        descripcion: '',
        imagen: null,
        horas: '',
        minutos: '',
        estado: 'activo',
      });
      setPreviewImage(null);
    }
  }, [esEdicion, servicio]);

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

    const categoriaSeleccionada = categories.find(cat => cat.id === parseInt(formData.categoriaId));
    const datosAEnviar = {
      ...formData,
      id: formData.id || Date.now(),
      categoria: categoriaSeleccionada ? categoriaSeleccionada.nombre : '',
    };

    onSubmit(datosAEnviar);
    showSuccess(`Servicio ${esEdicion ? 'actualizado' : 'creado'} correctamente`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
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
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mb-2 px-4 py-2 bg-[#FFB800] text-black font-semibold rounded hover:bg-[#e0a500] transition"
            >
              📁 Elegir imagen
            </button>

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
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del servicio"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          {/* Categoría */}
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Seleccione una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>

          {/* Precio */}
          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={formData.precio}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración aproximada
            </label>
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

          {/* Descripción */}
          <textarea
            name="descripcion"
            placeholder="Descripción del servicio"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
            required
          ></textarea>

          {/* Estado */}
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
