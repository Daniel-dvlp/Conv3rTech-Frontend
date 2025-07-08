import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { FaEdit, FaTrash, FaUser, FaFileExcel } from 'react-icons/fa';

const tabBtn = (active) => `px-3 py-1.5 rounded-lg font-bold transition-all duration-200 text-xs
  ${active ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 shadow-md' : 'bg-white/70 text-gray-700 hover:bg-yellow-100'}`;

const EventPopover = ({ event, anchor, onEdit, onDelete, onClose }) => {
  if (!event || !anchor) return null;
  
  const style = {
    position: 'fixed',
    top: anchor.top + anchor.height + 8,
    left: anchor.left,
    zIndex: 100,
    minWidth: 240,
    maxWidth: 300,
  };
  
  return (
    <div style={style} className="bg-white/95 backdrop-blur-xl border-2 border-yellow-400 rounded-xl shadow-xl p-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full" style={{ background: event.backgroundColor }}></div>
        <span className="font-bold text-gray-800 text-base">{event.title}</span>
      </div>
      <div className="text-sm text-gray-700 mb-2 capitalize">{event.extendedProps?.role}</div>
      <div className="text-xs text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
        <div className="font-medium">Horario:</div>
        <div>{new Date(event.start).toLocaleDateString()}</div>
        <div>{new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button 
          onClick={onEdit} 
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold text-xs hover:shadow-md transition-all"
        >
          <FaEdit /> Editar
        </button>
        <button 
          onClick={onDelete} 
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition-all"
        >
          <FaTrash /> Eliminar
        </button>
        <button 
          onClick={onClose} 
          className="ml-auto px-2 py-1.5 text-gray-400 hover:text-gray-700 text-xs transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Render personalizado para eventos con contador de múltiples eventos
function renderEventContent(eventInfo) {
  const color = eventInfo.event.backgroundColor || '#FFB300';
  const start = new Date(eventInfo.event.start);
  const end = new Date(eventInfo.event.end);
  const hora = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const tooltip = `${eventInfo.event.title}\n${eventInfo.event.extendedProps?.role || ''}\n${start.toLocaleDateString()} ${hora}`;
  
  // Contar eventos en el mismo día para este empleado
  const dayEvents = eventInfo.view.calendar.getEvents().filter(ev => {
    const evStart = new Date(ev.start);
    const eventStart = new Date(eventInfo.event.start);
    return ev.extendedProps.employeeId === eventInfo.event.extendedProps.employeeId &&
           evStart.toDateString() === eventStart.toDateString();
  });
  
  const hasMultipleEvents = dayEvents.length > 1;
  
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
      {hasMultipleEvents && (
        <div className="flex-shrink-0">
          <div className="w-4 h-4 bg-yellow-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {dayEvents.length}
          </div>
        </div>
      )}
    </div>
  );
}

const WorkSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, onExport, calendarRef }) => {
  const [view, setView] = React.useState('dayGridMonth');
  const [popover, setPopover] = React.useState(null);

  const handleViewChange = (v) => {
    setView(v);
    calendarRef.current?.getApi().changeView(v);
  };

  React.useEffect(() => {
    if (calendarRef.current) {
      const title = calendarRef.current.getApi().view.title;
      const el = document.getElementById('calendar-title');
      if (el) el.textContent = title;
    }
  }, [view, events]);

  React.useEffect(() => {
    if (!popover) return;
    const close = (e) => {
      if (!e.target.closest('.fc-event') && !e.target.closest('.popover-event')) setPopover(null);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [popover]);

  const handleEventClick = (info) => {
    const rect = info.el.getBoundingClientRect();
    setPopover({
      event: info.event,
      anchor: { top: rect.top + window.scrollY, left: rect.left + window.scrollX, height: rect.height },
      eventInfo: info,
    });
  };

  const handleEdit = () => {
    if (popover) {
      onEventClick(popover.eventInfo);
      setPopover(null);
    }
  };

  const handleDelete = () => {
    if (popover) {
      if (popover.eventInfo && popover.eventInfo.event) {
        onEventClick({ ...popover.eventInfo, delete: true });
      }
      setPopover(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 flex flex-col h-full">
        {/* Controles superiores */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <div className="flex gap-2 items-center">
            <button 
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-400 font-bold shadow-md hover:shadow-lg transition-all duration-200 text-xs" 
              onClick={() => calendarRef.current?.getApi().today()}
            >
              Hoy
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg bg-white/70 text-gray-700 font-bold shadow hover:bg-yellow-100 transition-all text-xs" 
              onClick={() => calendarRef.current?.getApi().prev()}
            >
              ◀
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg bg-white/70 text-gray-700 font-bold shadow hover:bg-yellow-100 transition-all text-xs" 
              onClick={() => calendarRef.current?.getApi().next()}
            >
              ▶
            </button>
          </div>
          
          <div className="flex-1 text-center">
            <span id="calendar-title" className="text-lg font-bold text-gray-800 tracking-wide"></span>
          </div>
          
          <div className="flex gap-2 items-center justify-end">
            <button className={tabBtn(view === 'dayGridMonth')} onClick={() => handleViewChange('dayGridMonth')}>
              Mes
            </button>
            <button className={tabBtn(view === 'timeGridWeek')} onClick={() => handleViewChange('timeGridWeek')}>
              Semana
            </button>
            <button className={tabBtn(view === 'timeGridDay')} onClick={() => handleViewChange('timeGridDay')}>
              Día
            </button>
            <button 
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1 text-xs" 
              onClick={onExport}
            >
              <FaFileExcel className="text-xs" />
              Exportar
            </button>
          </div>
        </div>
        
        {/* Calendario */}
        <div className="flex-1 p-3 relative">
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
            eventClassNames={() => 'rounded-lg shadow-md font-bold border border-white/60 text-xs px-1.5 py-1 hover:shadow-lg transition-all duration-200'}
            dayHeaderClassNames={() => 'bg-gradient-to-r from-yellow-50 to-white text-gray-800 font-bold text-sm py-2'}
            dayCellClassNames={() => 'bg-white/60 hover:bg-yellow-50/50 transition-colors'}
            eventContent={renderEventContent}
            moreLinkClick="popover"
            moreLinkContent={(args) => `+${args.num} más`}
          />
          
          {/* Popover de evento */}
          {popover && (
            <div className="popover-event">
              <EventPopover
                event={popover.event}
                anchor={popover.anchor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onClose={() => setPopover(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSchedulingCalendar; 