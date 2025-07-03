import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';

const WorkSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, onExport, calendarRef }) => {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded hover:bg-gray-100" onClick={() => calendarRef.current?.getApi().today()}>Hoy</button>
          <button className="px-3 py-1 rounded hover:bg-gray-100" onClick={() => calendarRef.current?.getApi().prev()}>◀</button>
          <button className="px-3 py-1 rounded hover:bg-gray-100" onClick={() => calendarRef.current?.getApi().next()}>▶</button>
        </div>
        <div className="font-bold text-lg" id="calendar-title"></div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded hover:bg-gray-100" onClick={() => calendarRef.current?.getApi().changeView('dayGridMonth')}>Mes</button>
          <button className="px-3 py-1 rounded hover:bg-gray-100" onClick={() => calendarRef.current?.getApi().changeView('timeGridWeek')}>Semana</button>
          <button className="px-3 py-1 rounded hover:bg-gray-100" onClick={() => calendarRef.current?.getApi().changeView('timeGridDay')}>Día</button>
          <button className="px-3 py-1 rounded bg-conv3r-gold text-conv3r-dark font-bold" onClick={onExport}>Exportar</button>
        </div>
      </div>
      <div className="flex-1">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          events={events}
          selectable={true}
          editable={true}
          select={onSelect}
          eventClick={onEventClick}
          datesSet={onDatesSet}
          height="100%"
        />
      </div>
    </div>
  );
};

export default WorkSchedulingCalendar; 