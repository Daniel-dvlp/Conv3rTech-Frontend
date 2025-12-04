import React, { useState } from 'react';
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const AppointmentsSidebar = ({
  activeDate,
  onDateSelect,
  onCreate,
  filter,
  setFilter,
  appointments = [] // Optional: to list appointments in sidebar
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedDate = activeDate ? new Date(activeDate) : null;

  const isSameDay = (dateA, dateB) => {
    if (!dateA || !dateB) return false;
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  // Mini Calendar Logic
  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>);
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isToday = new Date().toDateString() === dayDate.toDateString();
      const isSelected = selectedDate ? isSameDay(dayDate, selectedDate) : false;

      let dayClasses = 'w-6 h-6 flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors ';
      if (isToday) {
        dayClasses += 'bg-blue-600 text-white hover:bg-blue-700';
      } else if (isSelected) {
        dayClasses += 'bg-blue-100 text-blue-700 border border-blue-400 hover:bg-blue-200';
      } else {
        dayClasses += 'text-gray-700 hover:bg-gray-100';
      }

      days.push(
        <div
          key={i}
          onClick={() => handleDateClick(i)}
          className={dayClasses}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <aside className="h-full flex flex-col bg-white border-r border-gray-200 w-72 flex-shrink-0 overflow-hidden shadow-sm">
      {/* 1. Botón Superior */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onCreate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-yellow-400 text-[#00012A] rounded-lg hover:bg-yellow-500 transition-all shadow-sm text-sm font-bold"
        >
          <FaPlus size={12} /> Asignar Cita
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* 2. Mini Calendario */}
        <div className="mb-6 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-bold text-gray-800 capitalize">
              {currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <FaChevronLeft size={10} />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
              <span key={`${d}-${i}`} className="text-[10px] text-gray-400 font-bold w-full">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 place-items-center">
            {generateCalendarDays()}
          </div>
        </div>

        {/* 3. Buscador */}
        <div className="mb-6 relative group">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={filter || ''}
            onChange={e => setFilter && setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-gray-700 transition-all"
          />
        </div>
        
        {/* Lista de citas filtradas (opcional) */}
        {filter && appointments.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Resultados</h3>
                {appointments.filter(app => app.title.toLowerCase().includes(filter.toLowerCase())).map(app => (
                    <div key={app.id} className="p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                        <div className="font-medium text-gray-800">{app.title}</div>
                        <div className="text-xs text-gray-500">{new Date(app.start).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </aside>
  );
};

export default AppointmentsSidebar;
