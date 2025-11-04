// WorkSchedulingCalendar.jsx
import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { FaFileExcel, FaUser } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import EmployeeListPopover from './components/EmployeeListPopover';
import EmployeeDetailModal from './components/EmployeeDetailModal';

const tabBtn = (active) => `px-3 py-1.5 rounded-lg font-bold transition-all duration-200 text-xs
  ${active ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 shadow-md' : 'bg-white/70 text-gray-700 hover:bg-yellow-100'}`;

const WorkSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, calendarRef, employees, onEventDrop }) => {
  const [view, setView] = useState('dayGridMonth');
  const [employeePopover, setEmployeePopover] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .fc .fc-daygrid-day-number,
      .fc .fc-col-header-cell-cushion,
      .fc .fc-timegrid-axis-cushion,
      .fc .fc-timegrid-slot-label-cushion {
        text-decoration: none !important;
        border-bottom: none !important;
        color: #111 !important;
        font-weight: bold !important;
        background: transparent !important;
      }
      .fc .fc-col-header-cell,
      .fc .fc-daygrid-day,
      .fc .fc-timegrid-slot,
      .fc .fc-timegrid-axis {
        border-bottom: none !important;
      }
      .fc .fc-daygrid-day:hover {
        background: #fef9c3 !important;
      }
      .fc .fc-daygrid-day.fc-day-today {
        background: #fffde7 !important;
        border-radius: 0.5rem;
      }
      .fc-event-dragging,
      .fc-event-dragging .fc-event {
        z-index: 9999 !important;
        transform: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!employeePopover) return;
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setEmployeePopover(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [employeePopover]);

  const handleExport = () => {
    const data = events.map(ev => ({
      Empleado: ev.title,
      Rol: ev.extendedProps?.role,
      Documento: ev.extendedProps?.documento,
      Inicio: ev.start,
      Fin: ev.end
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Turnos');
    XLSX.writeFile(workbook, 'TurnosProgramacionLaboral.xlsx');
  };

  const groupEventsByDay = () => {
    const map = {};
    events.forEach(ev => {
      const day = new Date(ev.start).toDateString();
      if (!map[day]) map[day] = [];
      map[day].push(ev);
    });
    return map;
  };
  const eventsByDay = groupEventsByDay();

  function renderEventContent(eventInfo) {
    const color = eventInfo.event.backgroundColor || '#FFB300';
    const start = new Date(eventInfo.event.start);
    const end = new Date(eventInfo.event.end);
    const hora = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const tooltip = `${eventInfo.event.title}\n${eventInfo.event.extendedProps?.role || ''}\n${start.toLocaleDateString()} ${hora}`;
    const day = start.toDateString();
    const dayEvents = eventsByDay[day] || [];
    const hasMultiple = dayEvents.length > 1;
    return (
      <div
        className="flex items-center gap-1 px-1.5 py-1 rounded-lg shadow-md border border-white/60 bg-white/90 hover:bg-yellow-50 transition-all duration-200"
        style={{ borderLeft: `4px solid ${color}` }}
        title={tooltip}
      >
        <FaUser className="text-yellow-600 text-xs" />
        <div className="flex flex-col flex-1 min-w-0">
          <span className="truncate font-bold text-gray-800 text-xs leading-tight">{eventInfo.event.title}</span>
          <span className="truncate text-[10px] text-gray-500 font-medium capitalize">{eventInfo.event.extendedProps?.role}</span>
          <span className="truncate text-[10px] text-gray-700 font-semibold">{hora}</span>
        </div>
        {hasMultiple && (
          <button
            className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ml-1 shadow hover:scale-110"
            style={{ border: 'none' }}
            onClick={e => {
              e.stopPropagation();
              const anchor = { x: e.clientX, y: e.clientY };
              const empleados = dayEvents.map(ev => {
                const emp = employees.find(emp => emp.id === ev.extendedProps.employeeId);
                return {
                  ...emp,
                  ...ev.extendedProps,
                  start: ev.start,
                  end: ev.end,
                  title: ev.title
                };
              });
              setEmployeePopover({ empleados, anchor });
            }}
          >
            +{dayEvents.length - 1}
          </button>
        )}
      </div>
    );
  }

  const handleEventClick = (info) => {
    const empId = info.event.extendedProps.employeeId;
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setEmployeeDetail({ ...emp, ...info.event.extendedProps, start: info.event.start, end: info.event.end, title: info.event.title });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex flex-col h-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <div className="flex gap-2 items-center justify-end">
            <button className={tabBtn(view === 'dayGridMonth')} onClick={() => { setView('dayGridMonth'); calendarRef.current?.getApi().changeView('dayGridMonth'); }}>Mes</button>
            <button className={tabBtn(view === 'timeGridWeek')} onClick={() => { setView('timeGridWeek'); calendarRef.current?.getApi().changeView('timeGridWeek'); }}>Semana</button>
            <button className={tabBtn(view === 'timeGridDay')} onClick={() => { setView('timeGridDay'); calendarRef.current?.getApi().changeView('timeGridDay'); }}>Día</button>
            <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-md flex items-center gap-1 text-xs" onClick={handleExport}>
              <FaFileExcel className="text-xs" /> Exportar
            </button>
          </div>
        </div>

        <div className={`flex-1 relative overflow-y-auto`}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
            initialView={view}
            headerToolbar={false}
            events={events}
            selectable={true}
            editable={true}
            select={onSelect}
            eventClick={handleEventClick}
            datesSet={onDatesSet}
            height="auto"
            contentHeight="auto"
            dayMaxEventRows={4}
            eventDisplay="block"
            eventClassNames={() => 'rounded-lg shadow-md font-bold border border-white/60 text-xs px-1.5 py-1 hover:shadow-lg'}
            dayHeaderClassNames={() => 'bg-gradient-to-r from-yellow-50 to-white text-black font-bold text-sm py-2'}
            dayCellClassNames={() => 'bg-white/60 hover:bg-yellow-50/50 transition-colors text-black'}
            eventContent={renderEventContent}
            moreLinkClick="popover"
            moreLinkContent={args => `+${args.num} más`}
          />

          {employeePopover && (
            <div
              ref={popoverRef}
              style={{ position: 'fixed', left: employeePopover.anchor.x, top: employeePopover.anchor.y, zIndex: 9999 }}
            >
              <EmployeeListPopover
                empleados={employeePopover.empleados}
                anchor={employeePopover.anchor}
                onSelect={emp => {
                  setEmployeeDetail(emp);
                  setEmployeePopover(null);
                }}
                onClose={() => setEmployeePopover(null)}
              />
            </div>
          )}

          {employeeDetail && (
            <EmployeeDetailModal
              empleado={employeeDetail}
              onClose={() => setEmployeeDetail(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSchedulingCalendar;
