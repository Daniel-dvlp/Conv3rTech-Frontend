import React, { useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const AppointmentsCalendar = ({ events, onSelect, onEventClick, onDatesSet, calendarRef, onEventDrop }) => {

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const isMonthView = view.type === 'dayGridMonth';
    const isAllDay = event.allDay;
    const backgroundColor = event.backgroundColor || '#3B82F6'; // Default blue if not set

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
          {eventInfo.timeText}
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
        margin-left: -1px;
      }

      /* Grid Styling */
      .fc-view-harness {
        background-color: white;
      }

      .fc-day-today {
        background-color: transparent !important;
      }

      .fc-day-today .fc-daygrid-day-number {
        background-color: #1a73e8;
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
        padding: 8px 0;
        font-weight: 500;
        color: #70757a;
        text-transform: uppercase;
        font-size: 11px;
      }

      /* Time Grid Events */
      .fc-timegrid-event {
        border-radius: 4px;
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
        border: none !important;
      }

      .fc-event-main {
        padding: 2px 4px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="calendar-wrapper shadow-sm">
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
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        select={onSelect}
        eventClick={onEventClick}
        datesSet={onDatesSet}
        eventContent={renderEventContent}
        eventDrop={onEventDrop}
        height="100%"
        slotMinTime="06:00:00"
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

export default AppointmentsCalendar;
