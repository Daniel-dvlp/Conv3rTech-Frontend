import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const LaborSchedulingCalendar = ({ events, onSelect, onEventClick, onEventDrop, onDatesSet, calendarRef }) => {

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    try {
        const { event, view } = eventInfo;
        const isMonthView = view.type === 'dayGridMonth';
        const isAllDay = event.allDay;
        const backgroundColor = event.backgroundColor;
        
        // Month view rendering (Chips)
        if (isMonthView) {
          return (
            <div
              className="w-full h-full px-2 py-0.5 rounded text-xs truncate font-medium text-white shadow-sm cursor-pointer"
              style={{ backgroundColor: backgroundColor, borderLeft: `3px solid rgba(0,0,0,0.2)` }}
              title={event.title}
            >
              {event.title}
            </div>
          );
        }

        // All Day rendering (Pills)
        if (isAllDay) {
          return (
            <div
              className="w-full h-full px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
              style={{ backgroundColor, borderLeft: '4px solid rgba(0,0,0,0.15)' }}
              title={event.title}
            >
              {event.title}
            </div>
          );
        }

        // Time view rendering (Cards)
        return (
          <div
            className="w-full h-full p-1 rounded overflow-hidden flex flex-col border-l-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: `${backgroundColor}20`, // Light background (20% opacity)
              borderColor: backgroundColor,
              color: '#1f2937'
            }}
            title={event.title}
          >
            <div className="text-xs font-semibold truncate" style={{ color: backgroundColor }}>
              {event.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {event.timeText}
            </div>
            {event.extendedProps?.meta?.usuario && (
                <div className="text-[10px] text-gray-400 mt-auto truncate">
                    {event.extendedProps.meta.usuario.nombre} {event.extendedProps.meta.usuario.apellido}
                </div>
            )}
          </div>
        );
    } catch (error) {
        console.error('Error rendering event content', error);
        return <div>{eventInfo.event.title}</div>;
    }
  };

  useEffect(() => {
    // Inject custom styles for FullCalendar overrides
    const style = document.createElement('style');
    style.innerHTML = `
      .calendar-wrapper {
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
        font-weight: 600 !important;
        color: #1f2937 !important;
      }

      .fc-button-primary {
        background-color: white !important;
        border-color: #e5e7eb !important;
        color: #374151 !important;
        font-weight: 500 !important;
        text-transform: capitalize !important;
        padding: 0.5rem 1rem !important;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        transition: all 0.2s !important;
      }

      .fc-button-primary:hover {
        background-color: #f9fafb !important;
        border-color: #d1d5db !important;
      }

      .fc-button-primary:not(:disabled).fc-button-active {
        background-color: #eff6ff !important;
        color: #2563eb !important;
        border-color: #bfdbfe !important;
      }

      .fc-button-group > .fc-button {
        margin-left: -1px;
      }

      /* Grid Styling */
      .fc-view-harness {
        background-color: white;
      }

      .fc-day-today {
        background-color: #f8fafc !important;
      }

      .fc-day-today .fc-daygrid-day-number {
        background-color: #2563eb;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 4px;
      }

      .fc-col-header-cell {
        padding: 12px 0;
        font-weight: 600;
        color: #4b5563;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        background-color: #f9fafb;
      }

      /* Time Grid Events - Remove default borders to let custom content handle it */
      .fc-timegrid-event {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      .fc-v-event .fc-event-main {
        padding: 0 !important;
        overflow: hidden !important;
      }

      /* Month View Events */
      .fc-daygrid-event {
        background: transparent !important;
        border: none !important;
        margin-top: 2px !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="calendar-wrapper shadow-sm rounded-lg border border-gray-200">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        locale="es"
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
        editable={false} // Siempre deshabilitado para programación laboral por estabilidad
        droppable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={onSelect}
        eventClick={onEventClick}
        datesSet={onDatesSet}
        eventContent={renderEventContent}
        height="100%"
        slotMinTime="06:00:00" // Standard work hours start
        slotMaxTime="22:00:00"
        allDaySlot={true}
        allDayText="Todo el día"
        nowIndicator={true}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          omitZeroMinute: false,
          meridiem: 'short'
        }}
      />
    </div>
  );
};

export default LaborSchedulingCalendar;
