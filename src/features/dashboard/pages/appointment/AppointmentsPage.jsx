import React, { useState, useRef, useEffect } from "react";
import AppointmentsCalendar from "./components/AppointmentsCalendar";
import AppointmentsSidebar from "./components/AppointmentsSidebar";
import AppointmentModal from "./components/AppointmentModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import Swal from "sweetalert2";
import { toast } from 'react-hot-toast';
import appointmentsService from "./services/appointmentsService";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New states for layout
  const [filter, setFilter] = useState('');
  const [activeDate, setActiveDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    loadAppointments();
  }, []);

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
          telefono,
          servicio,
          direccion,
          encargado,
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

  // Filter appointments for sidebar or calendar if needed
  const filteredAppointments = filter 
    ? appointments.filter(appt => appt.title.toLowerCase().includes(filter.toLowerCase()))
    : appointments;

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      <div className="flex-1 flex min-h-0 relative">
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col">
          <AppointmentsCalendar
            events={filteredAppointments}
            calendarRef={calendarRef}
            onSelect={handleDateSelect}
            onEventClick={handleEventClick}
            onDatesSet={handleDatesSet}
          />
        </div>

        {/* Sidebar */}
        <div className="w-72 min-w-[220px] max-w-xs border-l border-yellow-100 bg-white/70">
          <AppointmentsSidebar
            activeDate={activeDate}
            onDateSelect={handleSidebarDateSelect}
            onCreate={() => {
                setIsModalOpen(true);
                setIsEditMode(false);
                setSelectedDate(new Date().toISOString());
            }}
            filter={filter}
            setFilter={setFilter}
            appointments={appointments} // Pass all to show in list if needed
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
