import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarView = ({ events, onDateClick, onEventClick }) => {
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");

  // Handler para cambio de vista
  const handleViewChange = (view) => {
    setCurrentView(view.view.type);
  };

  // Solo scroll en week/day
  const scrollClass =
    currentView === "timeGridWeek" || currentView === "timeGridDay"
      ? "max-h-[600px] overflow-y-auto"
      : "";

  return (
    <div className="w-full overflow-x-auto">
      <div className={`max-w-6xl mx-auto p-4 ${scrollClass}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          timeZone="local"
          dateClick={onDateClick}
          eventClick={onEventClick}
          events={events}
          height="auto"
          headerToolbar={false}
          contentHeight="auto"
          fixedWeekCount={false}
          aspectRatio={1.8}
          views={{
            dayGridMonth: {},
            timeGridWeek: {},
            timeGridDay: {},
          }}
          viewDidMount={handleViewChange}
          datesSet={handleViewChange}
        />
      </div>
    </div>
  );
};

export default CalendarView;
