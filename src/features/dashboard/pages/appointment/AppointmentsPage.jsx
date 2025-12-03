import React, { useState, useEffect } from "react";
import CalendarView from "./components/CalendarView";
import AppointmentModal from "./components/AppointmentModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import Swal from "sweetalert2";
import { useAppointments } from "./hooks/useAppointments";

const AppointmentsPage = () => {
  const {
    appointments,
    loading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppointments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Cargar citas al montar el componente
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsEditMode(false);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    const appointment = {
      ...info.event.extendedProps,
      id: info.event.id || info.event.extendedProps.id_cita,
    };
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (isEditMode && selectedAppointment) {
        await updateAppointment(selectedAppointment.id_cita, appointmentData);
      } else {
        await createAppointment(appointmentData);
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
      setIsEditMode(false);
    
    } catch (error) {
      // El error ya se maneja en el hook con toast, pero logueamos detalle para debug
      console.error('Error al guardar cita:', error.response?.data || error.message);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setSelectedDate(selectedAppointment.fecha);
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
        await deleteAppointment(selectedAppointment.id_cita);
        setShowDetailsModal(false);
        setSelectedAppointment(null);
      } catch (error) {
        // El error ya se maneja en el hook con toast
        console.error('Error al eliminar cita:', error);
      }
    }
  };

  // Calcular estadísticas
  const stats = {
    total: appointments.length,
    pendientes: appointments.filter(a => a.extendedProps?.estado === 'Pendiente').length,
    confirmadas: appointments.filter(a => a.extendedProps?.estado === 'Confirmada').length,
    completadas: appointments.filter(a => a.extendedProps?.estado === 'Completada').length,
  };

  return (
    <div className="p-4 md:p-6 w-full h-full flex flex-col gap-4">
      {/* Header con título y botón */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#00012A]">
            Gestión de Citas
          </h2>
          <p className="text-gray-600 mt-1">
            Administra y programa las citas de tus clientes
          </p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditMode(false);
            setSelectedAppointment(null);
            setSelectedDate(null);
          }}
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#00012A] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cita
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="flex items-center justify-between rounded-lg p-2 bg-white border border-gray-200">
          <div className="flex flex-col">
            <p className="text-gray-900 tracking-tight text-xl font-bold">{stats.total}</p>
            <span className="text-gray-500 text-xs font-medium">Total Citas</span>
          </div>
          <div className="h-8 w-8 rounded-md flex items-center justify-center bg-blue-50">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg p-2 bg-white border border-gray-200">
          <div className="flex flex-col">
            <p className="text-gray-900 tracking-tight text-xl font-bold">{stats.pendientes}</p>
            <span className="text-gray-500 text-xs font-medium">Pendientes</span>
          </div>
          <div className="h-8 w-8 rounded-md flex items-center justify-center bg-yellow-50">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg p-2 bg-white border border-gray-200">
          <div className="flex flex-col">
            <p className="text-gray-900 tracking-tight text-xl font-bold">{stats.confirmadas}</p>
            <span className="text-gray-500 text-xs font-medium">Confirmadas</span>
          </div>
          <div className="h-8 w-8 rounded-md flex items-center justify-center bg-green-50">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg p-2 bg-white border border-gray-200">
          <div className="flex flex-col">
            <p className="text-gray-900 tracking-tight text-xl font-bold">{stats.completadas}</p>
            <span className="text-gray-500 text-xs font-medium">Completadas</span>
          </div>
          <div className="h-8 w-8 rounded-md flex items-center justify-center bg-purple-50">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando citas...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
          <CalendarView
            events={appointments}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedAppointment(null);
        }}
        onSave={handleSaveAppointment}
        selectedDate={selectedDate}
        initialData={isEditMode ? selectedAppointment : null}
      />

      <AppointmentDetailModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AppointmentsPage;
