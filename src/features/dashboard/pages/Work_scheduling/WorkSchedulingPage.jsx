import React, { useState, useRef, useEffect } from 'react';
import WorkSchedulingSidebar from './components/WorkSchedulingSidebar';
import WorkSchedulingCalendar from './WorkSchedulingCalendar';
import WorkShiftModal from './components/WorkShiftModal';
import EmployeeListPopover from './components/EmployeeListPopover';
import EmployeeDetailModal from './components/EmployeeDetailModal';
import { showToast } from '../../../../shared/utils/alertas';
import { mockUsuarios } from '../users/data/User_data';

// Utiliza los usuarios como empleados
const employeeColors = ['#FFB300', '#4ECDC4', '#45B7D1', '#FF6F61', '#8E44AD', '#16A085', '#E67E22'];
const employees = mockUsuarios.map((u, idx) => ({
  id: u.id,
  name: `${u.nombre} ${u.apellido}`,
  role: u.rol,
  documento: u.documento,
  color: employeeColors[idx % employeeColors.length],
  email: u.email,
  celular: u.celular,
  status: u.status
}));
const mockShifts = [
  {
    id: 'shift-1',
    title: 'Ana García',
    start: '2025-07-07T09:00:00',
    end: '2025-07-07T17:00:00',
    backgroundColor: '#FFB300',
    borderColor: '#FFB300',
    extendedProps: { employeeId: 1, role: 'Técnico', documento: '123456' }
  },
  {
    id: 'shift-2',
    title: 'Luis Martínez',
    start: '2025-07-07T14:00:00',
    end: '2025-07-07T22:00:00',
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
    extendedProps: { employeeId: 2, role: 'Técnico', documento: '654321' }
  },
  {
    id: 'shift-3',
    title: 'María López',
    start: '2025-07-08T08:00:00',
    end: '2025-07-08T16:00:00',
    backgroundColor: '#45B7D1',
    borderColor: '#45B7D1',
    extendedProps: { employeeId: 3, role: 'Administrador', documento: '789012' }
  }
];

const WorkSchedulingPage = () => {
  const [employeeList] = useState(employees);
  const [events, setEvents] = useState(mockShifts);
  const [filter, setFilter] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState(employeeList.map(e => e.id));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState(null);
  const [employeePopover, setEmployeePopover] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const calendarRef = useRef();

  // Filtra eventos por empleados seleccionados
  const filteredEvents = events.filter(ev => selectedEmployees.includes(ev.extendedProps.employeeId));

  // Helper to check overlap
  function isOverlap(newShift, allEvents) {
    return allEvents.some(ev =>
      ev.extendedProps.employeeId === newShift.extendedProps.employeeId &&
      ((new Date(newShift.start) < new Date(ev.end)) && (new Date(newShift.end) > new Date(ev.start)))
    );
  }

  // Abrir modal para crear
  const handleCreate = (dateInfo) => {
    setModalMode('create');
    setModalData(dateInfo ? { start: dateInfo.startStr, end: dateInfo.endStr } : null);
    setShowModal(true);
  };

  // Abrir modal para editar/eliminar
  const handleEdit = (eventInfo) => {
    setModalMode('edit');
    setModalData({
      ...eventInfo.event.extendedProps,
      id: eventInfo.event.id,
      title: eventInfo.event.title,
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
      employeeId: eventInfo.event.extendedProps.employeeId,
      role: eventInfo.event.extendedProps.role,
      documento: eventInfo.event.extendedProps.documento,
    });
    setShowModal(true);
  };

  // Guardar (crear o editar)
  const handleSave = (shift) => {
    if (modalMode === 'edit') {
      // Prevent overlap on edit
      const otherEvents = events.filter(ev => ev.id !== shift.id);
      if (isOverlap(shift, otherEvents)) {
        showToast('El turno se solapa con otro turno existente para este empleado.', 'warning');
        return;
      }
      setEvents(prev => prev.map(ev => ev.id === shift.id ? shift : ev));
      showToast('Turno actualizado exitosamente', 'success');
    } else {
      // Recurrence logic
      if (shift.extendedProps && shift.extendedProps.recurrence && shift.extendedProps.recurrence.frequency) {
        const { frequency, days, until } = shift.extendedProps.recurrence;
        const startDate = new Date(shift.start);
        const endDate = new Date(shift.end);
        const eventsToAdd = [];
        const dayNames = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
        let count = 0;
        let current = new Date(startDate);
        let maxDate = until ? new Date(until) : new Date(startDate);
        if (!until) maxDate.setDate(maxDate.getDate() + 27); // 4 weeks if not set
        // For daily recurrence
        if (frequency === 'daily') {
          while (current <= maxDate) {
            const newStart = new Date(current);
            const newEnd = new Date(newStart.getTime() + (endDate - startDate));
            const newEvent = {
              ...shift,
              id: `shift-${Date.now()}-${count}`,
              start: newStart.toISOString().slice(0,16),
              end: newEnd.toISOString().slice(0,16),
              extendedProps: { ...shift.extendedProps, recurrence: undefined }
            };
            if (isOverlap(newEvent, events.concat(eventsToAdd))) {
              showToast('Uno o más turnos recurrentes se solapan con turnos existentes para este empleado.', 'warning');
              return;
            }
            eventsToAdd.push(newEvent);
            current.setDate(current.getDate() + 1);
            count++;
          }
        } else if (frequency === 'weekly') {
          // For weekly, add for each selected day until maxDate
          let weekStart = new Date(startDate);
          while (weekStart <= maxDate) {
            for (let i = 0; i < 7; i++) {
              const dayIdx = (weekStart.getDay() + i) % 7;
              const dayName = dayNames[dayIdx];
              const thisDay = new Date(weekStart);
              thisDay.setDate(weekStart.getDate() + i);
              if (days.includes(dayName) && thisDay >= startDate && thisDay <= maxDate) {
                const newStart = new Date(thisDay);
                const newEnd = new Date(newStart.getTime() + (endDate - startDate));
                const newEvent = {
                  ...shift,
                  id: `shift-${Date.now()}-${count}`,
                  start: newStart.toISOString().slice(0,16),
                  end: newEnd.toISOString().slice(0,16),
                  extendedProps: { ...shift.extendedProps, recurrence: undefined }
                };
                if (isOverlap(newEvent, events.concat(eventsToAdd))) {
                  showToast('Uno o más turnos recurrentes se solapan con turnos existentes para este empleado.', 'warning');
                  return;
                }
                eventsToAdd.push(newEvent);
                count++;
              }
            }
            weekStart.setDate(weekStart.getDate() + 7);
          }
        }
        setEvents(prev => [...prev, ...eventsToAdd]);
        showToast('Turnos recurrentes creados exitosamente', 'success');
      } else {
        if (isOverlap(shift, events)) {
          showToast('El turno se solapa con otro turno existente para este empleado.', 'warning');
          return;
        }
        setEvents(prev => [...prev, shift]);
        showToast('Turno creado exitosamente', 'success');
      }
    }
    setShowModal(false);
  };

  // Eliminar
  const handleDelete = (shiftId) => {
    setEvents(prev => prev.filter(ev => ev.id !== shiftId));
    showToast('Turno eliminado exitosamente', 'success');
    setShowModal(false);
  };

  // Drag & Drop handler
  const handleEventDrop = (info) => {
    const { event } = info;
    setEvents(prev => prev.map(ev =>
      ev.id === event.id
        ? {
            ...ev,
            start: event.startStr,
            end: event.endStr
          }
        : ev
    ));
  };

  // Popover de empleados (al hacer click en badge +N)
  const handleShowEmployeePopover = (empleados, anchor) => {
    setEmployeePopover({ empleados, anchor });
  };

  // Modal de detalle de empleado
  const handleShowEmployeeDetail = (empleado) => {
    setEmployeeDetail(empleado);
    setEmployeePopover(null);
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-72 min-w-[220px] max-w-xs border-r border-yellow-100 bg-white/70">
          <WorkSchedulingSidebar
            employees={employeeList}
            filter={filter}
            setFilter={setFilter}
            selected={selectedEmployees}
            setSelected={setSelectedEmployees}
            onCreate={handleCreate}
          />
        </div>
        {/* Calendario */}
        <div className="flex-1 flex flex-col">
          <WorkSchedulingCalendar
            events={filteredEvents}
            calendarRef={calendarRef}
            onSelect={handleCreate}
            onEventClick={handleEdit}
            employees={employeeList}
            onShowEmployeePopover={handleShowEmployeePopover}
            onEventDrop={handleEventDrop}
          />
        </div>
      </div>
      {/* Modal de turnos */}
      <WorkShiftModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        employees={employeeList}
        initialData={modalData}
        mode={modalMode}
      />
      {/* Popover de empleados */}
      {employeePopover && (
        <EmployeeListPopover
          empleados={employeePopover.empleados}
          anchor={employeePopover.anchor}
          onSelect={handleShowEmployeeDetail}
          onClose={() => setEmployeePopover(null)}
        />
      )}
      {/* Modal de detalle de empleado */}
      {employeeDetail && (
        <EmployeeDetailModal
          empleado={employeeDetail}
          onClose={() => setEmployeeDetail(null)}
        />
      )}
    </div>
  );
};

export default WorkSchedulingPage;