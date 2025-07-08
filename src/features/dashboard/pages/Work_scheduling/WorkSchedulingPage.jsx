import React, { useState, useRef, useEffect } from 'react';
import { FaCalendarAlt, FaUsers, FaClock, FaDownload, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import WorkSchedulingSidebar from './components/WorkSchedulingSidebar';
import WorkSchedulingCalendar from './components/WorkSchedulingCalendar';
import WorkShiftModal from './components/WorkShiftModal';

// Mock data - En tu aplicación real, esto vendría de una API
const mockEmployees = [
  { id: 1, name: 'Ana García', role: 'Cajera', color: '#FF6B6B' },
  { id: 2, name: 'Luis Martínez', role: 'Vendedor', color: '#4ECDC4' },
  { id: 3, name: 'María López', role: 'Supervisora', color: '#45B7D1' },
  { id: 4, name: 'Carlos Ruiz', role: 'Almacenista', color: '#96CEB4' },
  { id: 5, name: 'Isabel Torres', role: 'Cajera', color: '#FFEAA7' },
  { id: 6, name: 'Pedro Sánchez', role: 'Vendedor', color: '#DDA0DD' },
];

const mockShifts = [
  {
    id: 'shift-1',
    title: 'Ana García',
    start: '2025-07-07T09:00:00',
    end: '2025-07-07T17:00:00',
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
    extendedProps: { employeeId: 1, role: 'Cajera' }
  },
  {
    id: 'shift-2',
    title: 'Luis Martínez',
    start: '2025-07-07T14:00:00',
    end: '2025-07-07T22:00:00',
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
    extendedProps: { employeeId: 2, role: 'Vendedor' }
  },
  {
    id: 'shift-3',
    title: 'María López',
    start: '2025-07-08T08:00:00',
    end: '2025-07-08T16:00:00',
    backgroundColor: '#45B7D1',
    borderColor: '#45B7D1',
    extendedProps: { employeeId: 3, role: 'Supervisora' }
  }
];

const WorkSchedulingPage = () => {
  const [employees] = useState(mockEmployees);
  const [events, setEvents] = useState(mockShifts);
  const [filter, setFilter] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState(employees.map(e => e.id));
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const calendarRef = useRef();

  // Estadísticas calculadas
  const totalShifts = events.length;
  const activeEmployees = selectedEmployees.length;
  const todayShifts = events.filter(event => {
    const eventDate = new Date(event.start).toDateString();
    const today = new Date().toDateString();
    return eventDate === today && selectedEmployees.includes(event.extendedProps.employeeId);
  }).length;

  // Filtra eventos por empleados seleccionados
  const filteredEvents = events.filter(ev => selectedEmployees.includes(ev.extendedProps.employeeId));

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setModalMode('create');
    setModalData(null);
    setShowModal(true);
  };

  // Abrir modal para editar o eliminar
  const handleEdit = (eventInfo) => {
    if (eventInfo.delete) {
      // Eliminar directamente
      handleDelete(eventInfo.event.id);
      return;
    }
    
    setModalMode('edit');
    setModalData({
      ...eventInfo.event.extendedProps,
      id: eventInfo.event.id,
      title: eventInfo.event.title,
      start: eventInfo.event.startStr,
      end: eventInfo.event.endStr,
      rrule: eventInfo.event._def?.recurringDef?.typeData?.rruleSet || 
             eventInfo.event._def?.recurringDef?.typeData?.rrule || 
             eventInfo.event.extendedProps?.rrule,
      employeeId: eventInfo.event.extendedProps.employeeId,
      role: eventInfo.event.extendedProps.role,
    });
    setShowModal(true);
  };

  // Guardar (crear o editar)
  const handleSave = async (shift) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setEvents(prev => {
        const exists = prev.find(ev => ev.id === shift.id);
        if (exists) {
          // Editar
          showNotification('Turno actualizado exitosamente');
          return prev.map(ev => ev.id === shift.id ? shift : ev);
        } else {
          // Crear
          showNotification('Turno creado exitosamente');
          return [...prev, shift];
        }
      });
      setShowModal(false);
    } catch (error) {
      showNotification('Error al guardar el turno', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async (shiftId) => {
    if (!shiftId) {
      shiftId = modalData?.id;
    }
    
    if (shiftId) {
      setLoading(true);
      try {
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setEvents(prev => prev.filter(ev => ev.id !== shiftId));
        showNotification('Turno eliminado exitosamente');
        setShowModal(false);
      } catch (error) {
        showNotification('Error al eliminar el turno', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Exportar calendario
  const handleExport = async () => {
    setLoading(true);
    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 1500));
      showNotification('Calendario exportado exitosamente');
    } catch (error) {
      showNotification('Error al exportar el calendario', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      {/* Header Compacto */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-orange-200/40 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-lg shadow-md">
              <FaCalendarAlt className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Programación Laboral</h1>
              <p className="text-gray-600 text-xs">Gestión de horarios y turnos</p>
            </div>
          </div>
          
          {/* Stats Compactos */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{totalShifts}</div>
              <div className="text-xs text-gray-500">Turnos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{activeEmployees}</div>
              <div className="text-xs text-gray-500">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{todayShifts}</div>
              <div className="text-xs text-gray-500">Hoy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar Compacto */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}`}>
          <WorkSchedulingSidebar
            employees={employees}
            filter={filter}
            setFilter={setFilter}
            selected={selectedEmployees}
            setSelected={setSelectedEmployees}
            onCreate={handleCreate}
          />
        </div>

        {/* Calendario */}
        <div className="flex-1 flex flex-col">
          {/* Header del Calendario */}
          <div className="bg-white/60 backdrop-blur-sm border-b border-orange-200/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg bg-white/70 hover:bg-white/90 transition-all"
                >
                  <FaUsers className="text-gray-600 text-sm" />
                </button>
                <div className="flex items-center gap-2">
                  <FaClock className="text-orange-500 text-sm" />
                  <span className="font-medium text-gray-700 text-sm">Calendario</span>
                </div>
              </div>
              
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? <FaSpinner className="animate-spin text-xs" /> : <FaDownload className="text-xs" />}
                Exportar
              </button>
            </div>
          </div>

          {/* Calendario */}
          <div className="flex-1 overflow-hidden">
            <WorkSchedulingCalendar
              events={filteredEvents}
              calendarRef={calendarRef}
              onSelect={handleCreate}
              onEventClick={handleEdit}
              onDatesSet={() => {}}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      <WorkShiftModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        employees={employees}
        initialData={modalData}
        mode={modalMode}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3">
            <FaSpinner className="animate-spin text-orange-500 text-xl" />
            <span className="font-medium text-gray-700">Procesando...</span>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg backdrop-blur-sm border transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100/90 border-green-300 text-green-800' 
            : 'bg-red-100/90 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <FaCheckCircle className="text-lg" />
            ) : (
              <FaExclamationTriangle className="text-lg" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSchedulingPage;