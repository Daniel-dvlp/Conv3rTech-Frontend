import React, { useState, useRef, useEffect } from "react";
import AppointmentsCalendar from "./components/AppointmentsCalendar";
import AppointmentsSidebar from "./components/AppointmentsSidebar";
import AppointmentModal from "./components/AppointmentModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import Swal from "sweetalert2";
import { toast } from 'react-hot-toast';
import appointmentsService from "./services/appointmentsService";
import usersService from "../../../../services/usersService";
import { useAuth } from "../../../../shared/contexts/AuthContext";

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [visibleUserIds, setVisibleUserIds] = useState(new Set());
  
  // New states for layout
  const [filter, setFilter] = useState('');
  const [activeDate, setActiveDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    loadAppointments();
    loadTechnicians();
  }, []);

  // Verificar si es Coordinador o Admin (Roles 1 y 2)
  // Nota: Basado en LaborSchedulingSidebar, Admin=1, Coordinador=2, Técnico=3
  const isCoordinadorOrAdmin = user?.id_rol === 1 || user?.id_rol === 2 || user?.rol?.toLowerCase().includes('coordinador') || user?.rol?.toLowerCase().includes('admin');

  // Verificar si es Técnico (rol 2 o 3)
  const isTecnico = user?.id_rol === 2 || user?.id_rol === 3 || user?.rol?.toLowerCase().includes('tecnico');

  // Load Technicians (for sidebar)
  const loadTechnicians = async () => {
      try {
          let allUsers = [];
          
          if (isTecnico) {
             // If technician, only load self to avoid 403 error
             const myProfile = await usersService.getMyProfile();
             allUsers = [myProfile];
          } else {
             const response = await usersService.getAllUsers();
             allUsers = Array.isArray(response) ? response : (response.data || response.users || []);
          }
          
          const techs = allUsers.filter(u => 
             (u.id_rol === 2 || u.id_rol === 3 || (u.rol && typeof u.rol === 'string' && u.rol.toLowerCase().includes('tecnico'))) &&
             u.estado_usuario === 'Activo'
          ).map(u => ({
              id: u.id_usuario ?? u.id,
              nombre: u.nombre,
              apellido: u.apellido,
              documento: u.documento
          }));
          
          setTechnicians(techs);
          
          if (isTecnico) {
             const myId = user.id_usuario ?? user.id;
             setVisibleUserIds(new Set([Number(myId)]));
          } else {
             setVisibleUserIds(new Set(techs.map(t => t.id)));
          }
      } catch (error) {
          console.error("Error loading technicians", error);
      }
  };

  const toggleUser = (userId) => {
      setVisibleUserIds(prev => {
          const next = new Set(prev);
          if (next.has(userId)) next.delete(userId);
          else next.add(userId);
          return next;
      });
  };

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsService.getAll();
      const formattedEvents = data.map((appt) => {
        const id = appt.id_cita || appt.id;
        const clientNombre = appt?.cliente?.nombre || appt.cliente;
        const clientApellido = appt?.cliente?.apellido || '';
        const cliente = [clientNombre, clientApellido].filter(Boolean).join(' ').trim();
        const telefono = appt?.cliente?.telefono || appt.telefono || '';
        const servicio = appt?.servicio?.nombre || appt.servicio || '';
        const direccion = appt?.direccion_cliente?.direccion || appt.direccion || '';
        const encargadoNombre = appt?.trabajador?.nombre || appt.encargado || '';
        const encargadoApellido = appt?.trabajador?.apellido || '';
        const encargado = [encargadoNombre, encargadoApellido].filter(Boolean).join(' ').trim();
        const fecha = appt.fecha || null;
        const horaInicio = appt.hora_inicio || null;
        const horaFin = appt.hora_fin || null;
        const startISO = fecha && horaInicio ? `${fecha}T${horaInicio}` : appt.fechaHora || appt.start || null;
        const endISO = fecha && horaFin ? `${fecha}T${horaFin}` : appt.end || null;

        const ui = {
          id,
          cliente,
          clienteId: appt.id_cliente, // Add ID
          telefono,
          servicio,
          servicioId: appt.id_servicio, // Add ID
          direccion,
          direccionId: appt.id_direccion, // Add ID
          encargado,
          usuarioId: appt.id_usuario, // Add ID
          fechaHora: startISO,
          end: endISO,
        };

        return {
          id: String(id),
          title: cliente || servicio || 'Cita',
          start: startISO,
          end: endISO || undefined,
          backgroundColor: '#3B82F6',
          extendedProps: ui,
        };
      });

      setAppointments(formattedEvents);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Error al cargar las citas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (arg) => {
    // arg can be from dateClick (has dateStr) or select (has startStr)
    const dateStr = arg.dateStr || arg.startStr;
    
    const selectedStart = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedStart < today) {
       toast.error('No se pueden crear citas en fechas pasadas');
       return;
    }

    setSelectedDate(dateStr);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    const appointment = {
      ...info.event.extendedProps,
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      // If needed, we can use original data from extendedProps
    };
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    const { id } = event;
    const newStart = event.start;
    const newEnd = event.end;
    
    // Preparar payload para actualización
    // Usamos los datos originales extendidos, actualizando solo fecha y hora
    const originalData = event.extendedProps;
    
    // Formato requerido por el backend
    const pad = (n) => String(n).padStart(2, '0');
    const fecha = newStart.toISOString().slice(0, 10);
    const hora_inicio = `${pad(newStart.getHours())}:${pad(newStart.getMinutes())}:00`;
    const hora_fin = newEnd 
      ? `${pad(newEnd.getHours())}:${pad(newEnd.getMinutes())}:00` 
      : `${pad(newStart.getHours() + 1)}:${pad(newStart.getMinutes())}:00`; // Default 1 hora si no hay fin

    try {
      setIsLoading(true);
      const payload = {
        id_cliente: originalData.clienteId,
        id_usuario: originalData.usuarioId,
        id_servicio: originalData.servicioId,
        fecha,
        hora_inicio,
        hora_fin,
        id_direccion: originalData.direccionId || null,
      };
      
      await appointmentsService.update(id, payload);
      toast.success("Cita movida correctamente");
      
      // Actualizar estado local sin recargar todo si es posible, pero para seguridad recargamos
      // await loadAppointments(); 
    } catch (error) {
       info.revert(); // Revertir si falla
       console.error("Error moving appointment:", error);
       toast.error("Error al mover la cita: " + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const addAppointment = async (appointmentData) => {
    const startDate = new Date(appointmentData.fechaHora);
    const endDate = new Date(appointmentData.fechaHoraFin);
    const newStartISO = startDate.toISOString();

    const citaDuplicada = appointments.some(
      (cita) =>
        String(cita.id) !== String(appointmentData.id) &&
        new Date(cita.start).toISOString() === newStartISO
    );

    if (citaDuplicada) {
      Swal.fire({
        icon: "error",
        title: "Conflicto de horario",
        text: "Ya existe una cita en esa fecha y hora. Por favor, elige otro momento.",
        confirmButtonColor: "#FACC15",
      });
      return;
    }

    try {
      setIsLoading(true);
      const fecha = startDate.toISOString().slice(0, 10);
      const pad = (n) => String(n).padStart(2, '0');
      const hora_inicio = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}:00`;
      const hora_fin = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;
      const payload = {
        id_cliente: appointmentData.clienteId,
        id_usuario: appointmentData.usuarioId,
        id_servicio: appointmentData.servicioId,
        fecha,
        hora_inicio,
        hora_fin,
        id_direccion: appointmentData.direccionId || null,
        direccion: appointmentData.direccion || undefined,
      };
      if (isEditMode && appointmentData.id) {
        await appointmentsService.update(appointmentData.id, payload);
        toast.success("Cita actualizada correctamente");
      } else {
        await appointmentsService.create(payload);
        toast.success("Cita creada correctamente");
      }
      
      await loadAppointments(); // Reload from server
      setIsModalOpen(false);
      setSelectedAppointment(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast.error("Error al guardar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    // Ensure we pass the correct date string format to the modal
    // The modal expects 'YYYY-MM-DDTHH:mm' for datetime-local input usually
    // But here we pass ISO string and let modal handle it (it slices it)
    setSelectedDate(selectedAppointment.fechaHora);
    setIsModalOpen(true);
    setShowDetailsModal(false);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FACC15",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        await appointmentsService.delete(selectedAppointment.id);
        setShowDetailsModal(false);
        toast.success("Cita eliminada correctamente");
        await loadAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast.error("Error al eliminar la cita");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Sync Calendar with Sidebar Mini Calendar
  const handleSidebarDateSelect = (date) => {
    const api = calendarRef.current?.getApi();
    if (api) {
      api.gotoDate(date);
      setActiveDate(date);
    }
  };

  const handleDatesSet = (arg) => {
    // Update active date when calendar view changes (e.g. next/prev month)
    const centerDate = new Date(arg.view.currentStart);
    centerDate.setDate(centerDate.getDate() + 7); // Approx center for month view
    setActiveDate(centerDate);
  };

  const filteredAppointments = appointments.filter(appt => {
     const meta = appt.extendedProps || {};
     // If user is Technician, only show their own appointments
     if (isTecnico) {
       return Number(meta.usuarioId) === Number(user.id_usuario ?? user.id);
     }
     // Filter by visibility of technicians
     if (!visibleUserIds.has(Number(meta.usuarioId))) return false;
     return true;
  });

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AppointmentsSidebar
        activeDate={activeDate}
        onDateSelect={(date) => {
          setActiveDate(date);
          const calendarApi = calendarRef.current?.getApi();
          if (calendarApi) calendarApi.gotoDate(date);
        }}
        onCreate={() => {
          setIsEditMode(false);
          setSelectedDate(activeDate);
          setIsModalOpen(true);
        }}
        filter={filter}
        setFilter={setFilter}
        users={technicians}
        visibleUserIds={visibleUserIds}
        toggleUser={toggleUser}
        appointments={appointments}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 p-4 overflow-hidden relative">
           {isLoading && (
              <div className="absolute inset-0 z-50 bg-white/50 flex justify-center items-center backdrop-blur-sm">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
           )}
          <AppointmentsCalendar
            calendarRef={calendarRef}
            events={filteredAppointments}
            onSelect={(info) => {
              setIsEditMode(false);
              setSelectedDate(info.startStr);
              setIsModalOpen(true);
            }}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onDatesSet={(arg) => setActiveDate(arg.view.currentStart)}
          />
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
        }}
        onSave={addAppointment}
        selectedDate={selectedDate}
        initialData={isEditMode ? selectedAppointment : null}
        existingAppointments={appointments}
      />

      <AppointmentDetailModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        appointment={selectedAppointment}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AppointmentsPage;
