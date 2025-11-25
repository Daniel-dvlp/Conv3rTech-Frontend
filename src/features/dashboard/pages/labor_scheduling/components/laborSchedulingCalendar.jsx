import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FaUser, FaClock } from 'react-icons/fa';

const LaborSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, calendarRef, onEventDrop }) => {

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const isMonthView = view.type === 'dayGridMonth';
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
        </div>
      );
    }

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
        </div>
      );
    }

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
        </div>
      </div>
    );
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .calendar-wrapper {
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

    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="flex-1 p-6 bg-white">
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            start: 'title',
            center: '',
            end: 'prev,next dayGridMonth,timeGridWeek,timeGridDay today'
          }}
          events={events}
          eventContent={renderEventContent}
          selectable={true}
          select={onSelect}
          eventClick={onEventClick}
          datesSet={onDatesSet}
          eventDrop={onEventDrop}
          height="100%"
          allDaySlot={false}
          locale="es"
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
        />
      </div>
    </div>
  );
};

export default LaborSchedulingCalendar;

