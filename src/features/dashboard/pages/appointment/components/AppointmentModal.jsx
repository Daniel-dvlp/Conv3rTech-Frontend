import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { showSuccess } from '../../../../../shared/utils/alerts';

const AppointmentModal = ({ isOpen, onClose, onSave, selectedDate, initialData }) => {
  const [formData, setFormData] = useState({
    cliente: "",
    telefono: "",
    servicio: "",
    direccion: "",
    fechaHora: "",
    encargado: "",
    id: null,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          fechaHora: initialData.fechaHora?.substring(0, 16) || "", // formato para input datetime-local
        });
      } else {
        setFormData({
          cliente: "",
          telefono: "",
          servicio: "",
          direccion: "",
          fechaHora: selectedDate || "",
          encargado: "",
          id: null,
        });
      }
    }
  }, [isOpen, selectedDate, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
      onSave(formData);
      showSuccess('Cita guardada correctamente');
      onClose();
    
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
        <h3 className="text-2xl font-bold mb-6 text-center text-[#00012A]">
          {initialData ? "Editar cita" : "Asignar cita"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="cliente"
            placeholder="Nombre del cliente"
            value={formData.cliente}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono del cliente"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            name="servicio"
            placeholder="Servicio a realizar"
            value={formData.servicio}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección del servicio"
            value={formData.direccion}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="datetime-local"
            name="fechaHora"
            value={formData.fechaHora}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="text"
            name="encargado"
            placeholder="Encargado"
            value={formData.encargado}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-[#00012A] px-4 py-2 rounded-xl hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-yellow-400 text-[#00012A] font-semibold px-4 py-2 rounded-xl hover:bg-yellow-500 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
