// src/dashboard/pages/work_scheduling/WorkSchedulingPage.jsx
import React, { useState, useRef } from 'react';
import { mockEmployees, mockShifts } from './data/workScheduling.data';
import WorkSchedulingSidebar from './components/WorkSchedulingSidebar';
import WorkSchedulingCalendar from './components/WorkSchedulingCalendar';
import WorkShiftModal from './components/WorkShiftModal';

const WorkSchedulingPage = () => {
  const [employees] = useState(mockEmployees);
  const [events, setEvents] = useState(mockShifts);
  const [filter, setFilter] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState(employees.map(e => e.id));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState(null);
  const calendarRef = useRef();

  // Filtra eventos por empleados seleccionados
  const filteredEvents = events.filter(ev => selectedEmployees.includes(ev.extendedProps.employeeId));

  // Abrir modal para crear
  const handleCreate = () => {
    setModalMode('create');
    setModalData(null);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (eventInfo) => {
    setModalMode('edit');
    setModalData({
      ...eventInfo.event.extendedProps,
      id: eventInfo.event.id,
      title: eventInfo.event.title,
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
      rrule: eventInfo.event._def?.recurrenceRule || eventInfo.event._def?.rrule || eventInfo.event._def?.extendedProps?.rrule || eventInfo.event._def?.rruleSet || eventInfo.event._def?.rruleString || eventInfo.event._def?.rrule,
      employeeId: eventInfo.event.extendedProps.employeeId,
      role: eventInfo.event.extendedProps.role,
    });
    setShowModal(true);
  };

  // Guardar (crear o editar)
  const handleSave = (shift) => {
    setEvents(prev => {
      const exists = prev.find(ev => ev.id === shift.id);
      if (exists) {
        // Editar
        return prev.map(ev => ev.id === shift.id ? shift : ev);
      } else {
        // Crear
        return [...prev, shift];
      }
    });
    setShowModal(false);
  };

  // Eliminar
  const handleDelete = () => {
    if (modalData?.id) {
      setEvents(prev => prev.filter(ev => ev.id !== modalData.id));
    }
    setShowModal(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <WorkSchedulingSidebar
        employees={employees}
        filter={filter}
        setFilter={setFilter}
        selected={selectedEmployees}
        setSelected={setSelectedEmployees}
        onCreate={handleCreate}
      />
      <WorkSchedulingCalendar
        events={filteredEvents}
        calendarRef={calendarRef}
        onSelect={handleCreate}
        onEventClick={handleEdit}
        onDatesSet={() => {}}
        onExport={() => {}}
      />
      <WorkShiftModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        employees={employees}
        initialData={modalData}
        mode={modalMode}
      />
    </div>
  );
};

export default WorkSchedulingPage;