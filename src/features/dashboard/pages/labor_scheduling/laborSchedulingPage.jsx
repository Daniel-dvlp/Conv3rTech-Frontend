import React, { useEffect, useMemo, useRef, useState } from 'react';
import LaborSchedulingSidebar from './components/LaborSchedulingSidebar';
import LaborSchedulingCalendar from './components/LaborSchedulingCalendar';
import NewScheduleModal from './components/NewScheduleModal';
import CreateNovedadModal from './components/CreateNovedadModal';
import { showToast } from '../../../../shared/utils/alertas';
import laborSchedulingService from '../../../../services/laborSchedulingService';
import usersService from '../../../../services/usersService';

const LaborSchedulingPage = () => {
  const calendarRef = useRef();
  const miniJumpRef = useRef(false);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [uniqueSchedules, setUniqueSchedules] = useState([]);
  const [novedadesList, setNovedadesList] = useState([]);
  const [visibleScheduleIds, setVisibleScheduleIds] = useState(new Set());
  const [visibleNovedadIds, setVisibleNovedadIds] = useState(new Set());
  const [visibleUserIds, setVisibleUserIds] = useState(new Set());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeDate, setActiveDate] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const [showNovedadModal, setShowNovedadModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState(null);

  const [showEventContextMenu, setShowEventContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedEventForMenu, setSelectedEventForMenu] = useState(null);

  const flattenedEvents = useMemo(() => events, [events]);

  const hasMember = (set, id) => {
    if (id === undefined || id === null) return true;
    return set.has(id) || set.has(Number(id)) || set.has(String(id));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersService.getAllUsers();
        const dataset = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : response?.users || [];
        const parsed = dataset.map((user) => ({
          id: user.id_usuario ?? user.id ?? user.idUsuario,
          nombre: user.nombre,
          apellido: user.apellido,
          documento: user.documento,
        }));
        setAllUsers(parsed);
      } catch (error) {
        console.error('Error cargando usuarios', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!allUsers.length) return;
    if (!dateRange.start || !dateRange.end) return;
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allUsers, dateRange.start, dateRange.end]);

  const ensureDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return new Date(value);
    if (typeof value === 'string' && value.includes('T')) return new Date(value);
    if (typeof value === 'string') {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(value);
  };

  const addDays = (date, amount) => {
    const clone = new Date(date);
    clone.setDate(clone.getDate() + amount);
    return clone;
  };

  const expandAllDayEvent = (event) => {
    const startDate = ensureDate(event.start);
    let endExclusive = event.end ? ensureDate(event.end) : addDays(startDate, 1);
    if (!endExclusive || endExclusive <= startDate) {
      endExclusive = addDays(startDate, 1);
    }
    const segments = [];

    console.log('[LaborScheduling] expandAllDayEvent', { id: event.id, start: event.start, end: event.end, startDate, endExclusive });

    for (let cursor = new Date(startDate); cursor < endExclusive; cursor = addDays(cursor, 1)) {
      const dayStr = cursor.toISOString().split('T')[0];
      segments.push({
        ...event,
        id: `${event.id}-allday-${dayStr}`,
        start: `${dayStr}T01:00:00`,
        end: `${dayStr}T23:00:00`,
        allDay: false,
        extendedProps: {
          ...(event.extendedProps || {}),
          originalAllDay: true,
          originalStart: event.start,
          originalEnd: event.end,
        },
      });
    }
    return segments;
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const payload = {
        rangeStart: dateRange.start,
        rangeEnd: dateRange.end,
      };
      console.log('[LaborSchedulingPage] loadEvents payload', payload);
      const rawEvents = await laborSchedulingService.getEvents(payload);
      console.log('[LaborSchedulingPage] rawEvents length', Array.isArray(rawEvents) ? rawEvents.length : 0);

      const normalizedEvents = [];

      (rawEvents || []).forEach((event) => {
        if (event.allDay) {
          normalizedEvents.push(...expandAllDayEvent(event));
        } else {
          normalizedEvents.push(event);
        }
      });

      console.log('[LaborScheduling] normalizedEvents', normalizedEvents.length);

      const formattedEvents = normalizedEvents.map((event) => {
        const color = event.backgroundColor || event.color || '#2563EB';
        const isConvertedAllDay = !!event.extendedProps?.originalAllDay;
        const ep = event.extendedProps || {};
        const meta = ep.meta || {};
        return {
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          allDay: false,
          classNames: isConvertedAllDay ? ['allday-converted'] : [],
          backgroundColor: color,
          borderColor: event.borderColor || color,
          extendedProps: {
            type: ep.type,
            meta,
            descripcion: meta.descripcion,
            usuarioId: meta.usuarioId,
          },
        };
      });

      const schedulesMap = new Map();
      const novedadesMap = new Map();
      const usersWithSchedules = new Set();

      formattedEvents.forEach((event) => {
        const { type, meta } = event.extendedProps;
        if (meta?.usuarioId) {
          usersWithSchedules.add(meta.usuarioId);
        }
        if (type === 'programacion' && meta?.programacionId) {
          if (!schedulesMap.has(meta.programacionId)) {
            schedulesMap.set(meta.programacionId, {
              id: meta.programacionId,
              name: meta.usuario ? `${meta.usuario.nombre} ${meta.usuario.apellido}` : event.title,
              color: event.backgroundColor,
              usuarioId: meta.usuarioId,
            });
          }
        }
        if (type === 'novedad' && meta?.novedadId) {
          if (!novedadesMap.has(meta.novedadId)) {
            novedadesMap.set(meta.novedadId, {
              id: meta.novedadId,
              name: event.title,
              color: event.backgroundColor,
              usuarioId: meta.usuarioId,
            });
          }
        }
      });

      const nextSchedulesList = Array.from(schedulesMap.values());
      const nextNovedadesList = Array.from(novedadesMap.values());
      const nextUserList = allUsers.map((user) => ({
        id: user.id,
        name: `${user.nombre} ${user.apellido}`,
        documento: user.documento,
        color: '#2563EB',
      }));

      setEvents(formattedEvents);
      setUniqueSchedules(nextSchedulesList);
      setNovedadesList(nextNovedadesList);
      setUserList(nextUserList);

      setVisibleScheduleIds((prev) => {
        const oldIds = new Set(uniqueSchedules.map((item) => item.id));
        const next = new Set();
        nextSchedulesList.forEach((item) => {
          // Si es nuevo (no estaba en la lista anterior), mostrarlo por defecto
          if (!hasMember(oldIds, item.id)) {
            next.add(item.id);
          }
          // Si ya existía y estaba visible, mantenerlo visible
          else if (hasMember(prev, item.id)) {
            next.add(item.id);
          }
        });
        return next;
      });

      setVisibleNovedadIds((prev) => {
        const oldIds = new Set(novedadesList.map((item) => item.id));
        const next = new Set();
        nextNovedadesList.forEach((item) => {
          if (!hasMember(oldIds, item.id)) {
            next.add(item.id);
          } else if (hasMember(prev, item.id)) {
            next.add(item.id);
          }
        });
        return next;
      });

      const eventUserIds = new Set();
      formattedEvents.forEach((e) => {
        const uid = e?.extendedProps?.meta?.usuarioId;
        if (uid !== undefined && uid !== null) eventUserIds.add(uid);
      });
      const allUserIds = new Set(allUsers.map((u) => u.id));
      const unionIds = new Set([...Array.from(allUserIds), ...Array.from(eventUserIds)]);
      
      setVisibleUserIds((prev) => {
        const oldIds = new Set(userList.map((u) => u.id));
        const next = new Set();
        unionIds.forEach((id) => {
          if (!hasMember(oldIds, id)) {
            next.add(id);
          } else if (hasMember(prev, id)) {
            next.add(id);
          }
        });
        return next;
      });
      console.log('[LaborScheduling] userIds', { allUsers: Array.from(allUserIds), eventUserIds: Array.from(eventUserIds), visibleUserIds: Array.from(unionIds) });

      console.log('[LaborScheduling] sidebar counts', {
        schedules: nextSchedulesList.length,
        novedades: nextNovedadesList.length,
        users: nextUserList.length,
      });
    } catch (error) {
      console.error('Error cargando eventos:', error);
      if (!error.message?.includes('canceled')) {
        showToast(error.response?.data?.message || 'Error al cargar datos', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = (scheduleId) => {
    setVisibleScheduleIds((prev) => {
      const next = new Set(prev);
      if (next.has(scheduleId)) next.delete(scheduleId);
      else next.add(scheduleId);
      return next;
    });
  };

  const toggleNovedad = (novedadId) => {
    setVisibleNovedadIds((prev) => {
      const next = new Set(prev);
      if (next.has(novedadId)) next.delete(novedadId);
      else next.add(novedadId);
      return next;
    });
  };

  const toggleUser = (userId) => {
    setVisibleUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSaveProgramacion = async (payload) => {
    try {
      setLoading(true);
      console.log('[LaborSchedulingPage] handleSaveProgramacion payload', payload);
      if (modalMode === 'edit' && modalData?.id) {
        await laborSchedulingService.updateProgramacion(modalData.id, payload);
        showToast('Programación actualizada', 'success');
      } else {
        const created = await laborSchedulingService.createProgramacion(payload);
        console.log('[LaborSchedulingPage] createProgramacion result', created);
        showToast(`Programación creada para ${payload.usuarioIds.length} usuario(s)`, 'success');
        
        // Asegurar que las nuevas programaciones y usuarios sean visibles
        if (Array.isArray(created)) {
            setVisibleScheduleIds((prev) => {
                const next = new Set(prev);
                created.forEach((c) => next.add(c.id));
                return next;
            });
        }
        
        if (payload.usuarioIds && Array.isArray(payload.usuarioIds)) {
            setVisibleUserIds((prev) => {
                const next = new Set(prev);
                payload.usuarioIds.forEach((uid) => next.add(uid));
                return next;
            });
        }
      }
      setShowModal(false);
      await loadEvents();
    } catch (error) {
      console.error('Error guardando programación', error);
      showToast(error.response?.data?.message || 'Error al guardar la programación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNovedad = async (payload) => {
    try {
      setLoading(true);
      console.log('[LaborSchedulingPage] handleSaveNovedad payload', payload);
      if (modalMode === 'edit' && modalData?.id) {
        await laborSchedulingService.updateNovedad(modalData.id, payload);
        showToast('Novedad actualizada', 'success');
      } else {
        const created = await laborSchedulingService.createNovedad(payload);
        console.log('[LaborSchedulingPage] createNovedad result', created);
        showToast(`Novedad creada para ${payload.usuarioIds.length} usuario(s)`, 'success');
        
        // Asegurar que las nuevas novedades sean visibles
        if (Array.isArray(created)) {
            setVisibleNovedadIds((prev) => {
                const next = new Set(prev);
                created.forEach((c) => next.add(c.id_novedad)); // Asumiendo que devuelve el objeto creado con id_novedad
                return next;
            });
        } else if (created && created.id_novedad) {
             setVisibleNovedadIds((prev) => {
                const next = new Set(prev);
                next.add(created.id_novedad);
                return next;
            });
        }
      }
      setShowNovedadModal(false);
      await loadEvents();
    } catch (error) {
      console.error('Error guardando novedad', error);
      showToast(error.response?.data?.message || 'Error al guardar la novedad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openProgramacionModal = async (programacionId) => {
    try {
      setLoading(true);
      const detail = await laborSchedulingService.getProgramacionById(programacionId);
      if (!detail) {
        showToast('Programación no encontrada', 'error');
        return;
      }
      setModalMode('edit');
      setModalData(detail);
      setShowModal(true);
    } catch (error) {
      console.error('Error cargando programación', error);
      showToast('No se pudo cargar la programación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openNovedadModal = async (novedadId) => {
    try {
      setLoading(true);
      const detail = await laborSchedulingService.getNovedadById(novedadId);
      if (!detail) {
        showToast('Novedad no encontrada', 'error');
        return;
      }
      setModalMode('edit');
      setModalData(detail);
      setShowNovedadModal(true);
    } catch (error) {
      console.error('Error cargando novedad', error);
      showToast('No se pudo cargar la novedad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgramacion = async (programacionId) => {
    if (!programacionId) return;
    if (!window.confirm('¿Deseas eliminar esta programación?')) return;
    try {
      setLoading(true);
      await laborSchedulingService.deleteProgramacion(programacionId);
      showToast('Programación eliminada', 'success');
      await loadEvents();
    } catch (error) {
      console.error('Error eliminando programación', error);
      showToast(error.response?.data?.message || 'Error al eliminar la programación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNovedad = async (novedadId) => {
    if (!novedadId) return;
    if (!window.confirm('¿Deseas eliminar esta novedad?')) return;
    try {
      setLoading(true);
      await laborSchedulingService.deleteNovedad(novedadId);
      showToast('Novedad eliminada', 'success');
      await loadEvents();
    } catch (error) {
      console.error('Error eliminando novedad', error);
      showToast(error.response?.data?.message || 'Error al eliminar la novedad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgramacion = (selection) => {
    setModalMode('create');
    setModalData(selection ? { start: selection.startStr, end: selection.endStr } : null);
    setShowModal(true);
  };

  const handleCreateNovedad = () => {
    setModalMode('create');
    setModalData(null);
    setShowNovedadModal(true);
  };

  const handleDatesSet = (arg) => {
    const start = arg.startStr.split('T')[0];
    const end = arg.endStr.split('T')[0];
    setDateRange({ start, end });

    if (miniJumpRef.current) {
      miniJumpRef.current = false;
    } else {
      setActiveDate(new Date(arg.start));
    }
  };

  const handleSidebarDateSelect = (date) => {
    if (!calendarRef.current) return;
    const api = calendarRef.current.getApi();
    const target = date instanceof Date ? date : new Date(date);
    const currentView = api.view.type;

    miniJumpRef.current = true;
    setActiveDate(target);

    if (currentView === 'timeGridDay') {
      api.changeView('timeGridDay', target);
    } else if (currentView === 'timeGridWeek') {
      api.changeView('timeGridWeek', target);
    } else {
      api.gotoDate(target);
    }
  };

  const handleEventClick = (eventInfo) => {
    eventInfo.jsEvent.preventDefault();
    const { event } = eventInfo;
    setSelectedEventForMenu({
      type: event.extendedProps.type,
      meta: event.extendedProps.meta,
    });
    setContextMenuPosition({
      x: eventInfo.jsEvent.clientX,
      y: eventInfo.jsEvent.clientY,
    });
    setShowEventContextMenu(true);
  };

  const handleEditFromContextMenu = () => {
    if (!selectedEventForMenu) return;
    if (selectedEventForMenu.type === 'novedad') {
      openNovedadModal(selectedEventForMenu.meta?.novedadId);
    } else {
      openProgramacionModal(selectedEventForMenu.meta?.programacionId);
    }
    setShowEventContextMenu(false);
  };

  const filteredEvents = flattenedEvents.filter((event) => {
    const { type, meta } = event.extendedProps;
    if (type === 'programacion' && meta?.programacionId && !hasMember(visibleScheduleIds, meta.programacionId)) {
      return false;
    }
    if (type === 'novedad' && meta?.novedadId && !hasMember(visibleNovedadIds, meta.novedadId)) {
      return false;
    }
    if (meta?.usuarioId && !hasMember(visibleUserIds, meta.usuarioId)) {
      return false;
    }
    return true;
  });

  console.log('[LaborScheduling] filteredEvents length', filteredEvents.length);

  const handleUserEdit = (item) => {
    if (item?.documento) {
      const schedule = uniqueSchedules.find((s) => s.usuarioId === item.id);
      if (!schedule) {
        showToast('Este usuario no tiene programación activa', 'info');
        return;
      }
      openProgramacionModal(schedule.id);
      return;
    }
    if (item?.id) {
      openProgramacionModal(item.id);
    }
  };

  const handleUserDelete = (userId) => {
    const schedule = uniqueSchedules.find((s) => s.usuarioId === userId);
    if (!schedule) {
      showToast('No se encontró programación para eliminar', 'info');
      return;
    }
    handleDeleteProgramacion(schedule.id);
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex flex-col">
      <div className="flex-1 flex min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <div className="text-yellow-600 font-semibold text-sm tracking-wide">Cargando programación…</div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <LaborSchedulingCalendar
            events={filteredEvents}
            calendarRef={calendarRef}
            onSelect={handleCreateProgramacion}
            onEventClick={handleEventClick}
            onDatesSet={handleDatesSet}
          />
        </div>

        <div className="w-72 min-w-[220px] max-w-xs border-l border-yellow-100 bg-white/70">
          <LaborSchedulingSidebar
            users={userList}
            schedules={uniqueSchedules}
            novedades={novedadesList}
            visibleScheduleIds={visibleScheduleIds}
            visibleNovedadIds={visibleNovedadIds}
            visibleUserIds={visibleUserIds}
            toggleSchedule={toggleSchedule}
            toggleNovedad={toggleNovedad}
            toggleUser={toggleUser}
            filter={filter}
            setFilter={setFilter}
            selectedUser={null}
            setSelectedUser={() => {}}
            activeDate={activeDate}
            onDateSelect={handleSidebarDateSelect}
            onCreate={handleCreateProgramacion}
            onCreateNovedad={handleCreateNovedad}
            onEdit={handleUserEdit}
            onDelete={handleUserDelete}
            onEditNovedad={(item) => openNovedadModal(item.id)}
            onDeleteNovedad={handleDeleteNovedad}
          />
        </div>
      </div>

      <NewScheduleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProgramacion}
        initialData={modalData}
      />

      <CreateNovedadModal
        isOpen={showNovedadModal}
        onClose={() => setShowNovedadModal(false)}
        onSave={handleSaveNovedad}
        initialData={modalData}
      />

      {showEventContextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowEventContextMenu(false)} />
          <div
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-2 min-w-[150px]"
            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          >
            <button
              onClick={handleEditFromContextMenu}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => setShowEventContextMenu(false)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-500"
            >
              ❌ Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LaborSchedulingPage;

