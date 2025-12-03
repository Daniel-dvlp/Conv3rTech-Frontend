import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";

const CalendarView = ({ events, onDateClick, onEventClick }) => {
  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    const { event, view } = eventInfo;
    const isMonthView = view.type === "dayGridMonth";
    const backgroundColor = event.backgroundColor || "#FACC15";
    
    // Extract client name from title
    const titleParts = event.title.split(" - ");
    const clientName = titleParts[0] || event.title;

    // Month view - Minimal chips (solo hora)
    if (isMonthView) {
      return (
        <div
          className="px-1 py-0.5 rounded text-xs font-semibold truncate cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: backgroundColor,
            color: "white",
          }}
          title={`${event.title} - ${event.timeText}`}
        >
          {event.timeText}
        </div>
      );
    }

    // Week/Day view - Compact cards like dashboard
    return (
      <div
        className="h-full p-1.5 rounded-lg cursor-pointer hover:shadow-md transition-all flex items-center gap-2 border-l-4"
        style={{
          backgroundColor: "white",
          borderLeftColor: backgroundColor,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: backgroundColor }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate text-gray-800">
            {clientName}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {event.timeText}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .appointments-calendar-wrapper {
        height: 100%;
        background: white;
      }
      
      /* Header Styling - Compact */
      .fc-header-toolbar {
        padding: 0.75rem !important;
        margin-bottom: 0.5rem !important;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 12px;
        border: 1px solid #dee2e6;
      }
      
      .fc-toolbar-title {
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        color: #00012A !important;
      }

      .fc-button-primary {
        background-color: #00012A !important;
        border-color: #00012A !important;
        color: white !important;
        font-weight: 500 !important;
        text-transform: capitalize !important;
        padding: 0.4rem 0.8rem !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;
        font-size: 0.875rem !important;
      }

      .fc-button-primary:hover {
        background-color: #1e3a8a !important;
        border-color: #1e3a8a !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important;
      }

      .fc-button-primary:not(:disabled).fc-button-active {
        background-color: #3b82f6 !important;
        color: white !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3) !important;
      }

      .fc-button-group > .fc-button {
        margin-left: 0 !important;
      }

      /* Grid Styling - Softer borders */
      .fc-theme-standard td, .fc-theme-standard th {
        border: 1px solid #f1f3f5 !important;
      }

      .fc-scrollgrid {
        border: 1px solid #e9ecef !important;
      }

      /* Optimized for full month visibility */
      .fc-daygrid-day-frame {
        min-height: 100px !important;
      }

      .fc-daygrid-day-events {
        margin-top: 2px !important;
      }

      .fc-col-header-cell-cushion {
        color: #495057 !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        font-size: 0.7rem !important;
        padding: 8px 0 !important;
      }

      .fc-timegrid-slot-label-cushion {
        color: #6c757d !important;
        font-size: 0.75rem !important;
        font-weight: 500 !important;
      }

      .fc-timegrid-slot {
        height: 48px !important;
        border-bottom: 1px solid #f8f9fa !important;
      }

      .fc-timegrid-axis {
        border-right: 1px solid #e9ecef !important;
      }

      /* Today Highlighting - Softer */
      .fc-day-today {
        background-color: #f0f9ff !important;
      }

      .fc-day-today .fc-daygrid-day-number {
        background-color: #3b82f6 !important;
        color: white !important;
        font-weight: 600 !important;
        width: 24px !important;
        height: 24px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 2px !important;
        font-size: 0.75rem !important;
      }

      /* Day Numbers - Smaller for better fit */
      .fc-daygrid-day-number {
        padding: 2px !important;
        font-size: 0.8rem !important;
        font-weight: 500 !important;
        color: #495057 !important;
      }

      /* Week Numbers */
      .fc-daygrid-week-number {
        background-color: #f8f9fa !important;
        color: #6c757d !important;
        font-weight: 600 !important;
        font-size: 0.7rem !important;
      }

      /* Event Styling - Very compact */
      .fc-event {
        border: none !important;
        padding: 0 !important;
        margin: 0.5px 1px !important;
        font-size: 0.7rem !important;
      }

      .fc-daygrid-event {
        margin: 0.5px 1px !important;
      }

      .fc-timegrid-event {
        border-radius: 6px !important;
        overflow: hidden !important;
      }

      /* Hover Effects - Softer */
      .fc-daygrid-day:hover {
        background-color: #f8f9fa !important;
        cursor: pointer;
      }

      /* Current Time Indicator */
      .fc-timegrid-now-indicator-line {
        border-color: #dc3545 !important;
        border-width: 2px !important;
      }

      .fc-timegrid-now-indicator-arrow {
        border-color: #dc3545 !important;
      }

      /* Scrollbar Styling */
      .fc-scroller::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .fc-scroller::-webkit-scrollbar-track {
        background: #f8f9fa;
        border-radius: 4px;
      }

      .fc-scroller::-webkit-scrollbar-thumb {
        background: #dee2e6;
        border-radius: 4px;
      }

      .fc-scroller::-webkit-scrollbar-thumb:hover {
        background: #adb5bd;
      }

      /* More Events Link */
      .fc-daygrid-more-link {
        color: #3b82f6 !important;
        font-weight: 600 !important;
        font-size: 0.65rem !important;
      }

      .fc-daygrid-more-link:hover {
        color: #2563eb !important;
        text-decoration: underline !important;
      }

      /* Ensure calendar takes full height */
      .fc {
        height: 100% !important;
      }

      .fc-view-harness {
        height: 100% !important;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .fc-toolbar-title {
          font-size: 1.1rem !important;
        }
        
        .fc-button-primary {
          padding: 0.3rem 0.6rem !important;
          font-size: 0.8rem !important;
        }

        .fc-daygrid-day-frame {
          min-height: 70px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="appointments-calendar-wrapper bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
        }}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
        eventContent={renderEventContent}
        height="auto"
        contentHeight="auto"
        weekNumbers={true}
        weekText="S"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator={true}
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={3}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
      />
    </div>
  );
};

export default CalendarView;
