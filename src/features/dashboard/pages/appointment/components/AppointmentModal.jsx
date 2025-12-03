import React, { useState, useEffect } from "react";
import clientsService from "../../../../../services/clientsService";
import { serviceService } from "../../services/services/serviceService";
import usersService from "../../../../../services/usersService";
import laborSchedulingService from "../../../../../services/laborSchedulingService";
import { getDayOfWeek } from "../utils/AppointmentHelpers";
import { toast } from 'react-hot-toast';

const AppointmentModal = ({ isOpen, onClose, onSave, selectedDate, initialData }) => {
  const [formData, setFormData] = useState({
    id_cliente: "",
    id_usuario: "",
    id_servicio: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    direccion: "",
    observaciones: ""
  });

  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [workingHours, setWorkingHours] = useState(null);

  // Estados para selectores de hora
  const [horaInicio, setHoraInicio] = useState({ hora: "", minuto: "" });
  const [horaFin, setHoraFin] = useState({ hora: "", minuto: "" });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const [inicioHora, inicioMin] = (initialData.hora_inicio || "").split(":");
        const [finHora, finMin] = (initialData.hora_fin || "").split(":");
        
        setFormData({
          id_cliente: String(initialData.id_cliente || ""),
          id_usuario: String(initialData.id_usuario || ""),
          id_servicio: String(initialData.id_servicio || ""),
          fecha: initialData.fecha || "",
          hora_inicio: initialData.hora_inicio || "",
          hora_fin: initialData.hora_fin || "",
          direccion: initialData.direccion || "",
          observaciones: initialData.observaciones || ""
        });
        
        setHoraInicio({ hora: inicioHora || "", minuto: inicioMin || "" });
        setHoraFin({ hora: finHora || "", minuto: finMin || "" });
      } else {
        setFormData({
          id_cliente: "",
          id_usuario: "",
          id_servicio: "",
          fecha: selectedDate || "",
          hora_inicio: "",
          hora_fin: "",
          direccion: "",
          observaciones: ""
        });
        setHoraInicio({ hora: "", minuto: "" });
        setHoraFin({ hora: "", minuto: "" });
      }
    }
  }, [isOpen, selectedDate, initialData]);

  useEffect(() => {
    if (formData.id_usuario && formData.fecha) {
      loadWorkingHours(formData.id_usuario, formData.fecha);
    } else {
      setWorkingHours(null);
    }
  }, [formData.id_usuario, formData.fecha]);

  // Actualizar hora_inicio cuando cambian los selectores
  useEffect(() => {
    if (horaInicio.hora && horaInicio.minuto) {
      const timeString = `${horaInicio.hora}:${horaInicio.minuto}`;
      setFormData(prev => ({ ...prev, hora_inicio: timeString }));
    }
  }, [horaInicio]);

  // Actualizar hora_fin cuando cambian los selectores
  useEffect(() => {
    if (horaFin.hora && horaFin.minuto) {
      const timeString = `${horaFin.hora}:${horaFin.minuto}`;
      setFormData(prev => ({ ...prev, hora_fin: timeString }));
    }
  }, [horaFin]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [clientesData, serviciosResponse, usuariosData] = await Promise.all([
        clientsService.getAllClients(),
        serviceService.getAllServices(),
        usersService.getAllUsers()
      ]);

      const clientesActivos = clientesData.filter(c => c.estado_cliente);
      setClientes(clientesActivos);

      const serviciosData = serviciosResponse?.data || serviciosResponse || [];
      const serviciosActivos = serviciosData.filter(s => s.estado === 'activo');
      setServicios(serviciosActivos);

      setTrabajadores(usuariosData);
    } catch (error) {
      toast.error("Error al cargar los datos");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadWorkingHours = async (usuarioId, fecha) => {
    try {
      const programaciones = await laborSchedulingService.getProgramaciones({ usuarioId });
      
      if (programaciones && programaciones.length > 0) {
        const programacionActiva = programaciones
          .filter(p => p.estado === 'Activa' && p.fecha_inicio <= fecha)
          .sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))[0];

        if (programacionActiva) {
          const diaSemana = getDayOfWeek(fecha);
          const bloquesDelDia = programacionActiva.dias[diaSemana];
          
          if (bloquesDelDia && bloquesDelDia.length > 0) {
            setWorkingHours(bloquesDelDia);
          } else {
            setWorkingHours(null);
          }
        } else {
          setWorkingHours(null);
        }
      } else {
        setWorkingHours(null);
      }
    } catch (error) {
      console.error("Error al cargar horario laboral:", error);
      setWorkingHours(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "id_cliente") {
      const cliente = clientes.find(c => c.id_cliente === parseInt(value));
      setSelectedCliente(cliente);
    }

    if (name === "id_servicio") {
      const servicio = servicios.find(s => s.id_servicio === parseInt(value));
      setSelectedServicio(servicio);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📋 Datos del formulario:", formData);

    // Validación mejorada
    const camposFaltantes = [];
    if (!formData.id_cliente) camposFaltantes.push("Cliente");
    if (!formData.id_usuario) camposFaltantes.push("Encargado");
    if (!formData.id_servicio) camposFaltantes.push("Servicio");
    if (!formData.fecha) camposFaltantes.push("Fecha");
    if (!formData.hora_inicio) camposFaltantes.push("Hora de inicio");
    if (!formData.hora_fin) camposFaltantes.push("Hora de fin");
    if (!formData.direccion || formData.direccion.trim() === "") camposFaltantes.push("Dirección");

    if (camposFaltantes.length > 0) {
      toast.error(`Faltan los siguientes campos: ${camposFaltantes.join(", ")}`);
      console.log("❌ Campos faltantes:", camposFaltantes);
      return;
    }

    try {
      console.log("✅ Enviando datos:", formData);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("❌ Error al guardar:", error);
    }
  };

  if (!isOpen) return null;

  // Generar opciones de hora (0-23)
  const horas = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  
  // Generar opciones de minutos (0, 15, 30, 45)
  const minutos = ['00', '15', '30', '45'];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6 text-center text-[#00012A]">
          {initialData ? "Editar cita" : "Asignar cita"}
        </h3>

        {loadingData ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="id_cliente"
                value={formData.id_cliente}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id_cliente} value={cliente.id_cliente}>
                    {cliente.nombre} {cliente.apellido} - {cliente.documento}
                  </option>
                ))}
              </select>
              {selectedCliente && (
                <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-blue-900 text-lg">
                        {selectedCliente.nombre} {selectedCliente.apellido}
                      </p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium">{selectedCliente.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">{selectedCliente.correo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Servicio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Servicio <span className="text-red-500">*</span>
              </label>
              <select
                name="id_servicio"
                value={formData.id_servicio}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              >
                <option value="">Seleccione un servicio</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id_servicio} value={servicio.id_servicio}>
                    {servicio.nombre} {servicio.duracion ? `(${servicio.duracion})` : ''}
                  </option>
                ))}
              </select>
              {selectedServicio && (
                <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-500 rounded-full p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-purple-900 text-lg">{selectedServicio.nombre}</p>
                      <p className="text-purple-700 text-sm mt-1">{selectedServicio.descripcion}</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-green-700">${new Intl.NumberFormat('es-CO').format(selectedServicio.precio)}</span>
                        </div>
                        {selectedServicio.duracion && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-bold text-blue-700">{selectedServicio.duracion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Encargado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Encargado <span className="text-red-500">*</span>
              </label>
              <select
                name="id_usuario"
                value={formData.id_usuario}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              >
                <option value="">Seleccione un encargado</option>
                {trabajadores.map((trabajador) => (
                  <option key={trabajador.id_usuario} value={trabajador.id_usuario}>
                    {trabajador.nombre} {trabajador.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              />
            </div>

            {/* Horario laboral info */}
            {workingHours && workingHours.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 rounded-full p-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 mb-2">✅ Horario laboral del encargado:</p>
                    <div className="flex flex-wrap gap-2">
                      {workingHours.map((bloque, index) => (
                        <span key={index} className="bg-white text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm">
                          {bloque.horaInicio} - {bloque.horaFin}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selectores de Hora MEJORADOS */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-bold text-yellow-900">Horario de la Cita</h4>
              </div>
              
              {/* Hora de Inicio */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">HORA INICIO</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hora</label>
                    <select
                      value={horaInicio.hora}
                      onChange={(e) => setHoraInicio(prev => ({ ...prev, hora: e.target.value }))}
                      required
                      className="w-full p-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                    >
                      <option value="">HH</option>
                      {horas.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minutos</label>
                    <select
                      value={horaInicio.minuto}
                      onChange={(e) => setHoraInicio(prev => ({ ...prev, minuto: e.target.value }))}
                      required
                      className="w-full p-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white"
                    >
                      <option value="">MM</option>
                      {minutos.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Hora de Fin */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">HORA FIN</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hora</label>
                    <select
                      value={horaFin.hora}
                      onChange={(e) => setHoraFin(prev => ({ ...prev, hora: e.target.value }))}
                      required
                      className="w-full p-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                    >
                      <option value="">HH</option>
                      {horas.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minutos</label>
                    <select
                      value={horaFin.minuto}
                      onChange={(e) => setHoraFin(prev => ({ ...prev, minuto: e.target.value }))}
                      required
                      className="w-full p-3 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white"
                    >
                      <option value="">MM</option>
                      {minutos.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vista previa de la hora seleccionada */}
              {formData.hora_inicio && formData.hora_fin && (
                <div className="mt-4 bg-white border-2 border-yellow-400 rounded-lg p-3">
                  <p className="text-center text-lg font-bold text-gray-800">
                    📅 Cita programada: <span className="text-green-600">{formData.hora_inicio}</span> - <span className="text-red-600">{formData.hora_fin}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="direccion"
                placeholder="Dirección donde se realizará el servicio"
                value={formData.direccion}
                onChange={handleChange}
                required
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                name="observaciones"
                placeholder="Notas adicionales sobre la cita"
                value={formData.observaciones}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#00012A] font-bold px-8 py-3 rounded-xl transition shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Guardar Cita
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
