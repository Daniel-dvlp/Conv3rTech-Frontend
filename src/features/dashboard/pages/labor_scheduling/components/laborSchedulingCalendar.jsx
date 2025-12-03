import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const LaborSchedulingCalendar = ({ events, onSelect, onEventClick, onDatesSet, calendarRef }) => {

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const isMonthView = view.type === 'dayGridMonth';
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
        </div>
      );
    }

    if (isAllDay) {
      return (
        <div
          className="w-full h-full px-2 py-1 rounded text-xs font-semibold text-white flex items-center gap-1 allday-pill"
          style={{ backgroundColor, borderLeft: '4px solid rgba(0,0,0,0.15)' }}
        >
          {event.title}
        </div>
      );
    }

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
        </div>
      </div>
    );
  };

  useEffect(() => {
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
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="flex-1 bg-white h-full">
      <div className="calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            start: 'prev,next today title',
            center: '',
            end: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventContent={renderEventContent}
          selectable={true}
          select={onSelect}
          eventClick={onEventClick}
          datesSet={onDatesSet}
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
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
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
        />
      </div>
    </div>
  );
};

export default LaborSchedulingCalendar;
