import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
<<<<<<< HEAD
import { FaUser, FaClock } from 'react-icons/fa';

const LaborSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, calendarRef, onEventDrop }) => {
=======

const LaborSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, calendarRef }) => {
>>>>>>> origin/dev

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const isMonthView = view.type === 'dayGridMonth';
<<<<<<< HEAD
    const tipo = event.extendedProps.tipo || 'horario';
    const descripcion = event.extendedProps.descripcion || '';
    const userName = event.title.split(' - ')[1] || '';

    // Month view rendering
    if (isMonthView) {
      return (
        <div className="labor-event-month w-full h-full rounded-lg border-2 border-black shadow-lg overflow-hidden relative">
          {/* Event content */}
          <div className="p-2 text-black">
            {/* Hours first */}
            <div className="font-semibold text-sm mb-1">
              {new Date(event.start).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })} - {new Date(event.end).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </div>
            {/* Then title and type */}
            <div className="text-xs text-gray-700 mb-1 truncate">
              {event.title.split(' - ')[0]} {/* Remove user name for space */}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              {tipo === 'horario' ? '⏰ Horario' : '📅 Evento'}
            </div>
            {/* Description last */}
            {descripcion && (
              <div className="text-xs text-gray-500 truncate">
                {descripcion}
              </div>
            )}
          </div>
=======
    const isAllDay = event.allDay || event.extendedProps?.originalAllDay;
    const backgroundColor = event.backgroundColor;

    // Month view rendering (Chips)
    if (isMonthView) {
      return (
        <div
          className="w-full h-full px-2 py-0.5 rounded text-xs truncate font-medium text-white shadow-sm"
          style={{ backgroundColor: backgroundColor, borderLeft: `3px solid rgba(0,0,0,0.2)` }}
        >
          {event.title}
>>>>>>> origin/dev
        </div>
      );
    }

<<<<<<< HEAD
    // Day view rendering
    if (tipo === 'evento') {
      // For events, put description first, then time at bottom to avoid overlap
      return (
        <div className="labor-event-time p-2 h-full flex flex-col justify-between text-black rounded-md overflow-hidden">
          <div className="flex-1">
            {/* Description first for events */}
            {descripcion && (
              <div className="text-xs text-gray-400 mb-1 truncate font-semibold">
                {descripcion}
              </div>
            )}
            {/* Then title */}
            <div className="text-xs text-gray-700 mb-1 truncate">
              {event.title.split(' - ')[0]}
            </div>
            {userName && (
              <div className="text-xs text-gray-600 mb-1 truncate">
                👤 {userName}
              </div>
            )}
            {/* Type */}
            <div className="text-xs text-gray-500 mb-1">
              📅 Evento
            </div>
          </div>
          {/* Time at bottom */}
          <div className="font-semibold text-sm mt-1">
            {new Date(event.start).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })} - {new Date(event.end).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </div>
=======
    if (isAllDay) {
      return (
        <div
          className="w-full h-full px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 allday-pill"
          style={{ backgroundColor, borderLeft: '4px solid rgba(0,0,0,0.15)' }}
        >
          {event.title}
>>>>>>> origin/dev
        </div>
      );
    }

<<<<<<< HEAD
    // For schedules, keep original order
    return (
      <div className="labor-event-time p-2 h-full flex flex-col justify-between text-black rounded-md overflow-hidden">
        <div className="flex-1">
          {/* Hours first */}
          <div className="font-semibold text-sm mb-1">
            {new Date(event.start).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })} - {new Date(event.end).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </div>
          {/* Then title */}
          <div className="text-xs text-gray-700 mb-1 truncate">
            {event.title.split(' - ')[0]}
          </div>
          {userName && (
            <div className="text-xs text-gray-600 mb-1 truncate">
              👤 {userName}
            </div>
          )}
          {/* Type and description */}
          <div className="text-xs text-gray-500 mb-1">
            ⏰ Horario
          </div>
          {descripcion && (
            <div className="text-xs text-gray-400 truncate">
              {descripcion}
            </div>
          )}
=======
    // Time view rendering (Cards)
    return (
      <div
        className="w-full h-full p-1 rounded overflow-hidden flex flex-col border-l-4 shadow-sm"
        style={{
          backgroundColor: `${backgroundColor}20`, // Light background
          borderColor: backgroundColor,
          color: '#1f2937'
        }}
      >
        <div className="text-xs font-semibold truncate" style={{ color: backgroundColor }}>
          {event.title}
        </div>
        <div className="text-xs text-gray-500">
          {event.timeText}
>>>>>>> origin/dev
        </div>
      </div>
    );
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .calendar-wrapper {
<<<<<<< HEAD
        height: calc(100vh - 150px);
        overflow-y: auto;
        overflow-x: hidden;
      }
      .fc-scrollgrid thead {
        position: sticky;
        top: 0;
        z-index: 5;
        background: white !important;
        overflow: hidden !important;
      }
      .fc-col-header {
        position: sticky;
        top: 30px;
        z-index: 5;
        background: #4B5563 !important; /* gray-600 */
        color: white !important;
        overflow: hidden !important;
      }
      .fc-col-header-cell {
        background: #4B5563 !important; /* gray-600 */
        color: white !important;
      }
      .fc-col-header-cell * {
        color: white !important;
      }
      .fc-scrollgrid thead::-webkit-scrollbar,
      .fc-col-header::-webkit-scrollbar {
        display: none !important;
      }
      .fc-scrollgrid thead {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .fc-col-header {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .fc-toolbar-title {
        font-size: 2rem !important;
        font-weight: 700 !important;
        color: #1f2937 !important;
      }
      .fc {
        background: white !important;
      }
      .fc-button {
        background: #4B5563 !important; /* gray-600 */
        color: white !important;
        border: none !important;
        border-radius: 0.375rem !important;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
      }
      .fc-button:hover {
        filter: brightness(0.95) !important;
        transform: scale(1.05) !important;
      }
      .fc-button:not(:disabled).fc-button-active {
        background: #374151 !important; /* darker gray for active */
      }


      /* Time view event styling */
      .fc-timegrid-event {
        border-radius: 6px !important;
        border: 2px solid #000000 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
      }

      /* Event layering: events on top of schedules */
      .fc-timegrid-event[data-extended-props*="tipo":"evento""] {
        z-index: 10 !important;
        position: relative !important;
      }

      .fc-timegrid-event[data-extended-props*="tipo":"horario""] {
        z-index: 5 !important;
        position: relative !important;
      }

      /* Ensure time lines remain visible in day view */
      .fc-timegrid-slot {
        border-bottom: 1px solid #e5e7eb !important;
      }

      .fc-timegrid-slot-minor {
        border-bottom: 1px solid #f3f4f6 !important;
      }

      /* Prevent text shrinking for short events in day view */
      .fc-timegrid-event .labor-event-time {
        font-size: 14px !important;
        line-height: 1.2 !important;
      }

      .fc-timegrid-event .labor-event-time .font-semibold {
        font-size: 14px !important;
        font-weight: 600 !important;
      }

      .fc-timegrid-event .labor-event-time .text-xs {
        font-size: 12px !important;
      }

      /* Ensure minimum readable text size even for very short events */
      .fc-timegrid-event[data-duration*="00:15"] .labor-event-time,
      .fc-timegrid-event[data-duration*="00:30"] .labor-event-time {
        font-size: 13px !important;
      }

      .fc-timegrid-event[data-duration*="00:15"] .labor-event-time .font-semibold,
      .fc-timegrid-event[data-duration*="00:30"] .labor-event-time .font-semibold {
        font-size: 13px !important;
      }

      .labor-event-time {
        position: relative !important;
        border-radius: 6px !important;
      }

      /* Month view event styling */
      .fc-daygrid-event {
        margin: 1px 0 !important;
        border-radius: 8px !important;
        border: 1px solid #000000 !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        overflow: hidden !important;
      }

      .fc-daygrid-event .fc-event-main {
        padding: 0 !important;
      }

      .labor-event-month {
        position: relative !important;
        width: 100% !important;
        height: 100% !important;
        min-height: 60px !important;
      }

      /* Ensure events take full width in month cells */
      .fc-daygrid-day-events {
        position: relative !important;
        width: 100% !important;
      }

      .fc-daygrid-event-harness {
        margin-bottom: 2px !important;
      }

      /* Hide default event dot and title */
      .fc-daygrid-event-dot {
        display: none !important;
      }

      .fc-daygrid-event .fc-event-title {
        display: none !important;
      }

      /* Ensure proper text contrast */
      .fc-timegrid-event .fc-event-title {
        display: none !important;
      }

=======
        height: 100%;
        background: white;
      }
      
      /* Header Styling */
      .fc-header-toolbar {
        padding: 1rem !important;
        margin-bottom: 0 !important;
      }
      
      .fc-toolbar-title {
        font-size: 1.25rem !important;
        font-weight: 400 !important;
        color: #3c4043 !important;
      }

      .fc-button-primary {
        background-color: white !important;
        border-color: #dadce0 !important;
        color: #3c4043 !important;
        font-weight: 500 !important;
        text-transform: capitalize !important;
        padding: 0.5rem 1rem !important;
        box-shadow: none !important;
      }

      .fc-button-primary:hover {
        background-color: #f1f3f4 !important;
        border-color: #dadce0 !important;
      }

      .fc-button-primary:not(:disabled).fc-button-active {
        background-color: #e8f0fe !important;
        color: #1967d2 !important;
        border-color: #e8f0fe !important;
      }

      .fc-button-group > .fc-button {
        border-radius: 4px !important;
        margin: 0 2px !important;
      }

      /* Grid Styling */
      .fc-theme-standard td, .fc-theme-standard th {
        border-color: #e5e7eb !important; /* Soft gray */
      }

      .fc-col-header-cell-cushion {
        color: #70757a !important;
        font-weight: 500 !important;
        text-transform: uppercase !important;
        font-size: 11px !important;
        padding: 8px 0 !important;
      }

      .fc-timegrid-slot-label-cushion {
        color: #70757a !important;
        font-size: 10px !important;
      }

      .fc-timegrid-slot {
        height: 48px !important; /* Taller slots */
      }

      /* Today Highlighting */
      .fc-day-today {
        background-color: transparent !important;
      }

      .fc-col-header-cell.fc-day-today .fc-col-header-cell-cushion {
        color: #1967d2 !important;
      }

      /* Current Time Indicator */
      .fc-timegrid-now-indicator-line {
        border-color: #ea4335 !important;
        border-width: 2px !important;
      }

      .fc-timegrid-now-indicator-arrow {
        border-color: #ea4335 !important;
        border-width: 5px 0 5px 6px !important;
        border-bottom-color: transparent !important;
        border-top-color: transparent !important;
      }

      /* Events */
      .fc-timegrid-event {
        border: none !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .fc-daygrid-event {
        margin-top: 2px !important;
        border: none !important;
      }

      /* Scrollbar */
      .fc-scroller::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .fc-scroller::-webkit-scrollbar-track {
        background: transparent;
      }
      .fc-scroller::-webkit-scrollbar-thumb {
        background-color: #dadce0;
        border-radius: 4px;
      }

      .allday-pill,
      .fc-event.allday-converted {
        border-radius: 6px !important;
        min-height: 28px;
        align-items: center;
      }
>>>>>>> origin/dev
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
<<<<<<< HEAD
    <div className="flex-1 p-6 bg-white">
=======
    <div className="flex-1 bg-white h-full">
>>>>>>> origin/dev
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
<<<<<<< HEAD
            start: 'title',
            center: '',
            end: 'prev,next dayGridMonth,timeGridWeek,timeGridDay today'
=======
            start: 'prev,next today title',
            center: '',
            end: 'dayGridMonth,timeGridWeek,timeGridDay'
>>>>>>> origin/dev
          }}
          events={events}
          eventContent={renderEventContent}
          selectable={true}
          select={onSelect}
          eventClick={onEventClick}
          datesSet={onDatesSet}
<<<<<<< HEAD
          eventDrop={onEventDrop}
          height="100%"
          allDaySlot={false}
          locale="es"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
=======
          height="100%"
          allDaySlot={false}
          locale="es"
          slotMinTime="01:00:00"
          slotMaxTime="23:00:00"
          nowIndicator={true}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: 'short'
>>>>>>> origin/dev
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
<<<<<<< HEAD
=======
          views={{
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'short', day: '2-digit' }
            },
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' }
            }
          }}
          // Styling hooks
          dayCellClassNames="hover:bg-gray-50 transition-colors"
          slotLabelClassNames="text-xs text-gray-500 font-medium align-middle pr-2"
          viewClassNames="bg-white"
>>>>>>> origin/dev
        />
      </div>
    </div>
  );
};

export default LaborSchedulingCalendar;
<<<<<<< HEAD

=======
>>>>>>> origin/dev
