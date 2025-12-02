import React, { useState, useRef, useEffect } from 'react';
import LaborSchedulingSidebar from './components/laborSchedulingSidebar';
import LaborSchedulingCalendar from './components/laborSchedulingCalendar';
import LaborSchedulingShiftModal from './components/laborSchedulingShiftModal';
import UserAssignmentModal from './components/UserAssignmentModal';
import { showToast } from '../../../../shared/utils/alertas';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import laborSchedulingService from '../../../../services/laborSchedulingService';
import usersService from '../../../../services/usersService';

// Lista de usuarios vacía inicialmente (no hay programaciones creadas aún)
// Los usuarios disponibles son del módulo de usuarios, la lista se llena con eventos
const LaborSchedulingPage = () => {
  const [userList, setUserList] = useState([]); // Lista se llena dinámicamente
  const [allUsers, setAllUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState(null);
  const calendarRef = useRef();

  // Assignment modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [showEventContextMenu, setShowEventContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedEventForMenu, setSelectedEventForMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Changed from selectedUsers array to single selectedUser
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  const { hasPrivilege } = useAuth();

  // Cargar eventos desde Google Calendar
  const loadEvents = async () => {
    try {
      setLoading(true);
      const filters = {
        from: dateRange.start,
        to: dateRange.end,
      };
      const allEvents = await laborSchedulingService.getAllSchedules(filters);

      setEvents(allEvents || []);

      // Cargar usuarios si no están cargados
      if (allUsers.length === 0) {
        try {
          const users = await usersService.getAllUsers();
          setAllUsers(users);
        } catch (error) {
          console.error('Error loading users:', error);
        }
      }

      // Poblar lista de usuarios (solo usuarios con programaciones)
      const usersWithSchedules = new Set(allEvents.map(event => event.extendedProps?.userId).filter(Boolean));
      const usersWithSchedulesList = allUsers
        .filter(user => usersWithSchedules.has(user.id_usuario))
        .map(user => ({
          id: user.id_usuario,
          name: `${user.nombre} ${user.apellido}`,
          documento: user.documento,
        }));
      setUserList(usersWithSchedulesList);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      // Si el backend no está disponible, no mostrar error al usuario en desarrollo
      if (!error.message.includes('Network Error')) {
        showToast('Error al cargar programaciones', 'error');
      }
    } finally {
      setLoading(false);
    }
  };


  // Cargar eventos al montar y cuando cambie el rango de fechas
  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  // Si no hay usuario seleccionado, mostrar todos los eventos
  // Si hay usuario seleccionado, mostrar solo sus eventos
  const filteredEvents = selectedUser
    ? events.filter(ev => ev.extendedProps?.userId === selectedUser)
    : events;

  // Abrir modal para crear
  const handleCreate = (dateInfo) => {
    if (!hasPrivilege('programacion_laboral', 'Crear')) {
      showToast('No tienes privilegio para crear programaciones', 'error');
      return;
    }
    setModalMode('create');
    setModalData(dateInfo ? { start: dateInfo.startStr, end: dateInfo.endStr } : null);
    setShowModal(true);
  };


  // Guardar (crear o editar) - ahora usa Google Calendar
  const handleSave = async (payload, actionType) => {
    try {
      setLoading(true);
      if (actionType === 'update') {
        if (!hasPrivilege('programacion_laboral', 'Editar')) {
          showToast('No tienes privilegio para editar programaciones', 'error');
          return;
        }
        // Actualizar evento existente
        const { eventId, ...updateData } = payload;
        await laborSchedulingService.updateSchedule(eventId, updateData);
        showToast('Programación actualizada exitosamente', 'success');
      } else if (actionType === 'bulk') {
        if (!hasPrivilege('programacion_laboral', 'Crear')) {
          showToast('No tienes privilegio para crear programaciones', 'error');
          return;
        }
        // Crear para múltiples usuarios
        await laborSchedulingService.bulkCreateSchedule(payload);
        showToast(`Programación creada para ${payload.userIds.length} usuario(s) exitosamente`, 'success');
      } else {
        if (!hasPrivilege('programacion_laboral', 'Crear')) {
          showToast('No tienes privilegio para crear programaciones', 'error');
          return;
        }
        // Crear para un solo usuario
        await laborSchedulingService.createSchedule(payload);
        showToast('Programación creada exitosamente', 'success');
      }
      // Recargar eventos
      await loadEvents();
      setShowModal(false);
    } catch (error) {
      console.error('Error guardando programación:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar programación';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async (eventId) => {
    try {
      setLoading(true);
      if (!hasPrivilege('programacion_laboral', 'Eliminar')) {
        showToast('No tienes privilegio para eliminar programaciones', 'error');
        return;
      }
      await laborSchedulingService.deleteSchedule(eventId);
      showToast('Programación eliminada exitosamente', 'success');
      // Recargar eventos
      await loadEvents();
      setShowModal(false);
    } catch (error) {
      console.error('Error eliminando programación:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar programación';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop handler - actualizar en Google Calendar
  const handleEventDrop = async (info) => {
    try {
      if (!hasPrivilege('programacion_laboral', 'Editar')) {
        showToast('No tienes privilegio para editar programaciones', 'error');
        // Recargar para revertir cambios visuales
        await loadEvents();
        return;
      }
      const { event } = info;
      const eventId = event.id;
      const updateData = {
        startDateTime: event.start.toISOString(),
        endDateTime: event.end.toISOString(),
        usuarioId: event.extendedProps?.userId,
      };
      await laborSchedulingService.updateSchedule(eventId, updateData);
      // Recargar eventos
      await loadEvents();
      showToast('Programación actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error actualizando programación:', error);
      showToast('Error al actualizar programación', 'error');
      // Recargar para revertir cambios visuales
      await loadEvents();
    }
  };

  // Handler para cuando cambian las fechas del calendario
  const handleDatesSet = (arg) => {
    setDateRange({
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
  };


  // Assignment modal handlers
  const handleAssignEmployees = (instance) => {
    setSelectedInstance(instance);
    setShowAssignmentModal(true);
  };

  const handleSaveAssignments = async () => {
    setShowAssignmentModal(false);
  };

  // Context menu handlers
  const handleViewEventDetails = () => {
    if (selectedEventForMenu) {
      setModalMode('view');
      setModalData(selectedEventForMenu);
      setShowModal(true);
    }
    setShowEventContextMenu(false);
  };

  const handleEditEvent = () => {
    if (selectedEventForMenu) {
      if (!hasPrivilege('programacion_laboral', 'Editar')) {
        showToast('No tienes privilegio para editar programaciones', 'error');
        setShowEventContextMenu(false);
        return;
      }
      setModalMode('edit');
      setModalData(selectedEventForMenu);
      setShowModal(true);
    }
    setShowEventContextMenu(false);
  };

  const handleCloseContextMenu = () => {
    setShowEventContextMenu(false);
    setSelectedEventForMenu(null);
  };

  // Event click handler for shift instances
  const handleEventClick = (eventInfo) => {
    eventInfo.jsEvent.preventDefault();
    const event = eventInfo.event;

    // For month, week, and day views, show context menu with options
    if (eventInfo.view.type === 'dayGridMonth' || eventInfo.view.type === 'timeGridWeek' || eventInfo.view.type === 'timeGridDay') {
      setSelectedEventForMenu({
        ...event.extendedProps,
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        userId: event.extendedProps.userId,
        role: event.extendedProps.role,
        documento: event.extendedProps.documento,
      });
      setContextMenuPosition({
        x: eventInfo.jsEvent.clientX,
        y: eventInfo.jsEvent.clientY
      });
      setShowEventContextMenu(true);
      return;
    }

    // For other cases, handle directly
    if (event.extendedProps.type === 'shift-instance') {
      handleAssignEmployees(event.extendedProps.instance);
    } else {
      // Legacy event handling
      setModalMode('edit');
      setModalData({
        ...event.extendedProps,
        id: event.id,
        title: event.title,
        start: event.startStr,
        end: event.endStr,
        userId: event.extendedProps.userId,
        role: event.extendedProps.role,
        documento: event.extendedProps.documento,
      });
      setShowModal(true);
    }
  };


  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      <div className="flex-1 flex min-h-0">
        {/* Calendario - AHORA A LA IZQUIERDA */}
        <div className="flex-1 flex flex-col">
          {loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <div className="text-yellow-600 font-bold">Cargando...</div>
            </div>
          )}
          <LaborSchedulingCalendar
            events={filteredEvents}
            calendarRef={calendarRef}
            onSelect={handleCreate}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
            onDatesSet={handleDatesSet}
          />
        </div>
        {/* Sidebar - AHORA A LA DERECHA */}
        <div className="w-72 min-w-[220px] max-w-xs border-l border-yellow-100 bg-white/70">
          <LaborSchedulingSidebar
            users={userList}
            filter={filter}
            setFilter={setFilter}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            onCreate={handleCreate}
          />
        </div>
      </div>
      {/* Modal de turnos */}
      <LaborSchedulingShiftModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        users={userList}
        initialData={modalData}
        mode={modalMode}
      />


      {/* Modal de asignación de usuarios */}
      <UserAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onSave={handleSaveAssignments}
        shiftInstance={selectedInstance}
        users={allUsers}
      />

      {/* Context Menu for Events */}
      {showEventContextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 min-w-[150px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleViewEventDetails}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            👁️ Ver Detalles
          </button>
          {hasPrivilege('programacion_laboral', 'Editar') && (
          <button
            onClick={handleEditEvent}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            ✏️ Editar
          </button>
          )}
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleCloseContextMenu}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-500"
          >
            ❌ Cancelar
          </button>
        </div>
      )}

      {/* Overlay to close context menu */}
      {showEventContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

export default LaborSchedulingPage;
