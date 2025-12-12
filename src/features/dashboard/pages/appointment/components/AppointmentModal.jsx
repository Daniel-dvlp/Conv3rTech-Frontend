import React, { useState, useEffect } from "react";
import { showSuccess, showError } from '../../../../../shared/utils/alerts';
import clientsService from '../../../../../services/clientsService';
import usersService from '../../../../../services/usersService';
import servicesService from '../../../../../services/servicesService';
import laborSchedulingService from '../../../../../services/laborSchedulingService';
import { FaTimes, FaCheck } from 'react-icons/fa';

// Reusable components for styling (matching NewScheduleModal)
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 mb-4">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ children }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const AppointmentModal = ({ isOpen, onClose, onSave, selectedDate, initialData, existingAppointments }) => {
  const [formData, setFormData] = useState({
    clienteId: "",
    direccionId: "",
    direccion: "",
    usuarioId: "",
    servicioId: "",
    fecha: "", // Separate Date
    horaInicio: "", // Separate Time
    horaFin: "", // Separate Time
  });

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Only technicians
  const [servicios, setServicios] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeConstraints, setTimeConstraints] = useState({ min: "00:00", max: "23:59" });

  useEffect(() => {
    if (isOpen) {
      loadData();
      
      if (initialData) {
        // Edit mode
        const start = initialData.start ? new Date(initialData.start) : null;
        const end = initialData.end ? new Date(initialData.end) : null;
        
        const pad = n => String(n).padStart(2, '0');
        const fecha = start ? `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}` : "";
        const horaInicio = start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : "";
        const horaFin = end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : "";

        setFormData({
            id: initialData.id,
            clienteId: initialData.extendedProps?.clienteId || initialData.clienteId,
            direccionId: initialData.extendedProps?.direccionId || initialData.direccionId || "",
            direccion: initialData.extendedProps?.direccion || initialData.direccion || "",
            usuarioId: initialData.extendedProps?.usuarioId || initialData.usuarioId,
            servicioId: initialData.extendedProps?.servicioId || initialData.servicioId,
            fecha,
            horaInicio,
            horaFin,
        });
      } else {
        // Create mode
        const defaultDate = selectedDate 
            ? new Date(selectedDate)
            : new Date();
        
        const pad = n => String(n).padStart(2, '0');
        const fecha = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth()+1)}-${pad(defaultDate.getDate())}`;
        
        // Default time: next full hour
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        const horaInicio = `${pad(nextHour.getHours())}:${pad(nextHour.getMinutes())}`;
        
        const endHour = new Date(nextHour);
        endHour.setHours(endHour.getHours() + 1);
        const horaFin = `${pad(endHour.getHours())}:${pad(endHour.getMinutes())}`;

        setFormData({
          clienteId: "",
          direccionId: "",
          direccion: "",
          usuarioId: "",
          servicioId: "",
          fecha,
          horaInicio,
          horaFin,
        });
      }
    }
  }, [isOpen, initialData, selectedDate]);

  // Load clients, users, services
  const loadData = async () => {
    try {
        setLoading(true);
        const [clientsRes, usersRes, servicesRes, schedulesRes] = await Promise.all([
            clientsService.getAllClients(),
            usersService.getAllUsers(),
            servicesService.getAllServices(),
            laborSchedulingService.getAllSchedules()
        ]);

        // Filter active clients
        const clientsData = Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes || []);
        // Check for boolean true (MySQL/Sequelize default for boolean) or 'Activo' string just in case
        setClientes(clientsData.filter(c => c.estado_cliente === true || c.estado_cliente === 1 || c.estado_cliente === 'Activo'));

        // Filter technicians (role 2 or 3) and active
        const usersData = Array.isArray(usersRes) ? usersRes : (usersRes.data || usersRes.users || []);
        setUsuarios(usersData.filter(u => 
            (u.id_rol === 2 || u.id_rol === 3 || (u.rol && typeof u.rol === 'string' && u.rol.toLowerCase().includes('tecnico'))) &&
            u.estado_usuario === 'Activo'
        ));

        // Services
        setServicios(Array.isArray(servicesRes) ? servicesRes : (servicesRes.data || []));

        // Schedules
        let schedulesData = Array.isArray(schedulesRes) ? schedulesRes : (schedulesRes.data || []);
        // Ensure dias is an object (parse if string)
        schedulesData = schedulesData.map(s => {
             if (s.dias && typeof s.dias === 'string') {
                 try {
                     return { ...s, dias: JSON.parse(s.dias) };
                 } catch (e) {
                     console.error("Error parsing schedule dias", e);
                     return s;
                 }
             }
             return s;
        });
        setSchedules(schedulesData);

    } catch (error) {
        console.error("Error loading form data", error);
    } finally {
        setLoading(false);
    }
  };

  // Load addresses when client changes
  useEffect(() => {
    if (formData.clienteId) {
       const client = clientes.find(c => String(c.id_cliente) === String(formData.clienteId));
       // Check for AddressClients (backend alias) or direcciones (if transformed)
       const clientAddresses = client?.AddressClients || client?.direcciones || [];
       
       if (clientAddresses.length > 0) {
           setDirecciones(clientAddresses);
       } else {
           // Fallback fetch if not present (though backend should include it now)
           clientsService.getClientById(formData.clienteId).then(res => {
               const data = res.data || res;
               const addresses = data.AddressClients || data.direcciones || [];
               setDirecciones(addresses);
           }).catch(() => setDirecciones([]));
       }
    } else {
        setDirecciones([]);
    }
  }, [formData.clienteId, clientes]);

  // Update time constraints based on schedule
  useEffect(() => {
    if (formData.usuarioId && formData.fecha) {
        // Create date object correctly handling timezone/local time
        const parts = formData.fecha.split('-');
        const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);

        const technicianSchedule = schedules.find(s => 
            String(s.usuarioId) === String(formData.usuarioId) && 
            s.estado === 'Activa'
        );

        if (technicianSchedule) {
            const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const dayName = daysMap[selectedDate.getDay()];
            const daySchedule = technicianSchedule.dias?.[dayName];

            if (daySchedule && daySchedule.length > 0) {
                // Find earliest start and latest end
                let min = "23:59";
                let max = "00:00";
                
                daySchedule.forEach(slot => {
                    if (slot.horaInicio < min) min = slot.horaInicio;
                    if (slot.horaFin > max) max = slot.horaFin;
                });
                
                setTimeConstraints({ min, max });
                return;
            }
        }
    }
    // Default or fallback (reset if no schedule found or incomplete data)
    setTimeConstraints({ min: "00:00", max: "23:59" });
  }, [formData.usuarioId, formData.fecha, schedules]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'usuarioId' && value) {
        // Validar disponibilidad del técnico (programación activa)
        const hasActiveSchedule = schedules.some(s => 
            String(s.usuarioId) === String(value) && 
            s.estado === 'Activa'
        );

        if (!hasActiveSchedule) {
            showError('El usuario seleccionado no cuenta con una programación activa.');
            setFormData((prev) => ({ ...prev, usuarioId: "" }));
            return;
        }
    }

    // --- VALIDACIÓN ESTRICTA DE FECHA ---
    if (name === 'fecha') {
        if (!formData.usuarioId) {
            showError('Seleccione primero un técnico para validar disponibilidad.');
            return; // No actualiza el estado, efectivamente "bloquea" el cambio
        }

        const selectedDate = new Date(value + 'T00:00:00'); // Asegurar hora local
        const technicianSchedule = schedules.find(s => 
            String(s.usuarioId) === String(formData.usuarioId) && 
            s.estado === 'Activa'
        );

        if (!technicianSchedule) {
             showError('El técnico no tiene programación activa.');
             return;
        }

        // 1. Validar Rango General
        const scheduleStart = new Date(technicianSchedule.fechaInicio + 'T00:00:00');
        const scheduleEnd = new Date(technicianSchedule.fechaFin + 'T23:59:59');
        
        // Normalizar para comparar solo fechas
        selectedDate.setHours(0,0,0,0);
        scheduleStart.setHours(0,0,0,0);
        scheduleEnd.setHours(0,0,0,0);

        if (selectedDate < scheduleStart || selectedDate > scheduleEnd) {
            showError(`Fecha fuera de rango. Disponible: ${technicianSchedule.fechaInicio} al ${technicianSchedule.fechaFin}`);
            return; // Rechaza el cambio
        }

        // 2. Validar Días Específicos (Lunes, Martes...)
        const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const dayName = daysMap[selectedDate.getDay()];
        const daySchedule = technicianSchedule.dias?.[dayName];

        if (!daySchedule || daySchedule.length === 0) {
            showError(`El técnico NO trabaja los ${dayName}s.`);
            return; // Rechaza el cambio
        }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.usuarioId && formData.fecha && formData.horaInicio && formData.horaFin) {
        const fechaHora = `${formData.fecha}T${formData.horaInicio}`;
        const fechaHoraFin = `${formData.fecha}T${formData.horaFin}`;
        
        const start = new Date(fechaHora);
        const end = new Date(fechaHoraFin);
        const now = new Date();
        
        // Reconstruir formData compatible con el padre
        const payload = {
            ...formData,
            fechaHora,
            fechaHoraFin
        };

        // 1. Validar Futuro (+1h)
        const oneHourFuture = new Date(now.getTime() + 60 * 60 * 1000);
        if (start < oneHourFuture) {
            showError('La cita debe programarse con al menos 1 hora de anticipación.');
            return;
        }

        // 2. Validar Hora dentro del Turno
        const technicianSchedule = schedules.find(s => 
            String(s.usuarioId) === String(formData.usuarioId) && 
            s.estado === 'Activa'
        );
        
        const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const dayName = daysMap[start.getDay()];
        const daySchedule = technicianSchedule.dias?.[dayName];

        const fitsInShift = daySchedule.some(shift => {
            return formData.horaInicio >= shift.horaInicio && formData.horaFin <= shift.horaFin;
        });

        if (!fitsInShift) {
             const turnosStr = daySchedule.map(s => `${s.horaInicio}-${s.horaFin}`).join(', ');
             showError(`Hora fuera de turno. Horario ${dayName}: ${turnosStr}`);
             return;
        }

        // 3. Validar Conflictos (mismo día)
        const technicianAppointments = (existingAppointments || []).filter(appt => {
            const apptTechId = appt.usuarioId || appt.extendedProps?.usuarioId;
            const isSameTech = String(apptTechId) === String(formData.usuarioId);
            const isCurrent = initialData && String(appt.id) === String(initialData.id);
            return isSameTech && !isCurrent;
        });

        const hasConflict = technicianAppointments.some(appt => {
            const apptStart = new Date(appt.start || appt.fechaHora);
            const apptEnd = new Date(appt.end || appt.fechaHoraFin);
            
            // Margen de 1 hora
            const existingStartMinusBuffer = new Date(apptStart.getTime() - 60 * 60 * 1000);
            const existingEndPlusBuffer = new Date(apptEnd.getTime() + 60 * 60 * 1000);
            
            return (start < existingEndPlusBuffer) && (end > existingStartMinusBuffer);
        });

        if (hasConflict) {
            showError('Conflicto de horario: Margen de 1 hora requerido.');
            return;
        }

        onSave(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
                {initialData ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                <FaTimes size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
            <form id="appointmentForm" onSubmit={handleSubmit} className="space-y-6">
                
                <FormSection title="Información del Servicio">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FormLabel>Cliente <span className="text-red-500">*</span></FormLabel>
                            <select
                                name="clienteId"
                                value={formData.clienteId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Selecciona cliente</option>
                                {clientes.map((c) => (
                                    <option key={c.id_cliente} value={c.id_cliente}>
                                        {[c.nombre, c.apellido].filter(Boolean).join(' ')} - {c.documento}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <FormLabel>Servicio <span className="text-red-500">*</span></FormLabel>
                            <select
                                name="servicioId"
                                value={formData.servicioId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Selecciona servicio</option>
                                {servicios.map((s) => (
                                    <option key={s.id_servicio} value={s.id_servicio}>
                                        {s.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <FormLabel>Dirección (Guardada)</FormLabel>
                             <select
                                name="direccionId"
                                value={formData.direccionId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Selecciona dirección (opcional)</option>
                                {direcciones.map((d) => (
                                    <option key={d.id_direccion} value={d.id_direccion}>
                                        {d.nombre_direccion ? `${d.nombre_direccion} - ${d.direccion}` : d.direccion}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                             <FormLabel>Otra Dirección</FormLabel>
                             <input
                                type="text"
                                name="direccion"
                                placeholder="Especifique si es diferente..."
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Programación y Asignación">
                    <div>
                        <FormLabel>Técnico Encargado <span className="text-red-500">*</span></FormLabel>
                        <select
                            name="usuarioId"
                            value={formData.usuarioId}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Selecciona técnico</option>
                            {usuarios.map((u) => (
                                <option key={u.id_usuario ?? u.id} value={u.id_usuario ?? u.id}>
                                    {[u.nombre, u.apellido].filter(Boolean).join(' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <FormLabel>Fecha <span className="text-red-500">*</span></FormLabel>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().slice(0, 10)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <FormLabel>Hora Inicio <span className="text-red-500">*</span></FormLabel>
                            <input
                                type="time"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleChange}
                                required
                                min={timeConstraints.min}
                                max={timeConstraints.max}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <FormLabel>Hora Fin <span className="text-red-500">*</span></FormLabel>
                            <input
                                type="time"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleChange}
                                required
                                min={formData.horaInicio || timeConstraints.min}
                                max={timeConstraints.max}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </FormSection>

            </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
                Cancelar
            </button>
            <button
                type="submit"
                form="appointmentForm"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
                <FaCheck /> Guardar Cita
            </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
