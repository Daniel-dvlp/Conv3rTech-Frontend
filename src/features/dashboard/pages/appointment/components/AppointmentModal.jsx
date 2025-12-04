import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { showSuccess } from '../../../../../shared/utils/alerts';
import clientsService from '../../../../../services/clientsService';
import usersService from '../../../../../services/usersService';
import servicesService from '../../../../../services/servicesService';

const AppointmentModal = ({ isOpen, onClose, onSave, selectedDate, initialData }) => {
  const [formData, setFormData] = useState({
    clienteId: null,
    usuarioId: null,
    servicioId: null,
    direccionId: null,
    direccion: "",
    fechaHora: "",
    fechaHoraFin: "",
    id: null,
  });
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [direcciones, setDirecciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cl, us, se] = await Promise.all([
          clientsService.getAllClients(),
          usersService.getAllUsers(),
          servicesService.getAllServices(),
        ]);
        setClientes(Array.isArray(cl) ? cl : cl?.data || []);
        setUsuarios(Array.isArray(us) ? us : us?.data || []);
        setServicios(Array.isArray(se) ? se : se?.data || []);
      } catch {}
    };
    if (isOpen) {
      fetchData();
      if (initialData) {
        setFormData({
          clienteId: initialData.id_cliente ?? null,
          usuarioId: initialData.id_usuario ?? null,
          servicioId: initialData.id_servicio ?? null,
          direccionId: initialData.id_direccion ?? null,
          direccion: initialData.direccion || "",
          fechaHora: initialData.fechaHora?.substring(0, 16) || "",
          fechaHoraFin: initialData.end ? String(initialData.end).substring(0, 16) : "",
          id: initialData.id ?? null,
        });
        const clienteSel = initialData.clienteData || null;
        const dirs = clienteSel?.AddressClients || [];
        setDirecciones(dirs);
      } else {
        const now = selectedDate || "";
        const endDefault = now ? new Date(now) : null;
        const endStr = endDefault ? new Date(endDefault.getTime() + 60 * 60 * 1000).toISOString().substring(0, 16) : "";
        setFormData({
          clienteId: null,
          usuarioId: null,
          servicioId: null,
          direccionId: null,
          direccion: "",
          fechaHora: now,
          fechaHoraFin: endStr,
          id: null,
        });
        setDirecciones([]);
      }
    }
  }, [isOpen, selectedDate, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'clienteId') {
      const clienteObj = clientes.find(c => String(c.id_cliente) === String(value));
      const dirs = clienteObj?.AddressClients || [];
      setDirecciones(dirs);
    }
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
          <select
            name="clienteId"
            value={formData.clienteId ?? ''}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Selecciona cliente</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {[c.nombre, c.apellido].filter(Boolean).join(' ')}
              </option>
            ))}
          </select>
          <select
            name="direccionId"
            value={formData.direccionId ?? ''}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Selecciona dirección (opcional)</option>
            {direcciones.map((d) => (
              <option key={d.id_direccion} value={d.id_direccion}>
                {d.nombre_direccion ? `${d.nombre_direccion} - ${d.direccion}` : d.direccion}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="direccion"
            placeholder="Dirección del servicio"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <select
            name="servicioId"
            value={formData.servicioId ?? ''}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Selecciona servicio</option>
            {servicios.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre}
              </option>
            ))}
          </select>
          <select
            name="usuarioId"
            value={formData.usuarioId ?? ''}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">Selecciona técnico</option>
            {usuarios.map((u) => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {[u.nombre, u.apellido].filter(Boolean).join(' ')}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            name="fechaHora"
            value={formData.fechaHora}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="datetime-local"
            name="fechaHoraFin"
            value={formData.fechaHoraFin}
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
