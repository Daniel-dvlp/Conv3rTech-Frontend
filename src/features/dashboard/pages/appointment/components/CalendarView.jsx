import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const CalendarView = ({ events, onDateClick, onEventClick }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="max-w-6xl mx-auto p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
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
        />
      </div>
    </div>
  );
};

export default CalendarView;
