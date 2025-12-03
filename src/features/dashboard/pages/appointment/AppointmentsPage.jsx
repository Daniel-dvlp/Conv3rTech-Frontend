import React, { useState } from "react";
import CalendarView from "./components/CalendarView";
import AppointmentModal from "./components/AppointmentModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import mockAppointments from "./data/mockAppointments";
import { toast } from 'react-hot-toast';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState(mockAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    const appointment = {
      ...info.event.extendedProps,
      id: info.event.id || info.event.extendedProps.id,
    };
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const addAppointment = (appointmentData) => {
    const fecha = new Date(appointmentData.fechaHora);
    const isoDate = fecha.toISOString();

    const citaDuplicada = appointments.some(
      (cita) =>
        cita.id !== appointmentData.id &&
        new Date(cita.start).toISOString() === isoDate
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

    if (isEditMode) {
      const updated = appointments.map((appt) =>
        appt.id === appointmentData.id
          ? {
              ...appt,
              title: appointmentData.cliente,
              start: isoDate,
              extendedProps: {
                ...appointmentData,
                fechaHora: isoDate,
                id: appointmentData.id,
              },
            }
          : appt
      );
      setAppointments(updated);
      
    } else {
      const newId = uuidv4();
      const newAppointment = {
        id: newId,
        title: appointmentData.cliente,
        start: isoDate,
        extendedProps: {
          ...appointmentData,
          fechaHora: isoDate,
          id: newId,
        },
      };
      setAppointments((prev) => [...prev, newAppointment]);
    }
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
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
      setAppointments((prev) =>
        prev.filter((cita) => cita.id !== selectedAppointment.id)
      );
      setShowDetailsModal(false);
      toast.success("Cita eliminada correctamente");
    }
  };

  return (
    <div className="p-4 md:p-6 w-full h-full overflow-x-hidden">
      <div className="relative flex items-center justify-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#00012A] text-center">
          Citas
        </h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditMode(false);
          }}
          className="absolute right-0 bg-yellow-400 hover:bg-yellow-500 text-[#00012A] font-semibold py-2 px-4 rounded-lg shadow transition"
        >
          + Asignar cita
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto max-w-full">
        <div className="min-w-[700px]">
          <CalendarView
            events={appointments}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
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
