import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaPlus, FaChevronDown, FaChevronUp, FaCheckSquare, FaSquare, FaChevronLeft, FaChevronRight, FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

const LaborSchedulingSidebar = ({
  users,
  schedules,
  novedades,
  visibleScheduleIds,
  visibleNovedadIds,
  visibleUserIds,
  toggleSchedule,
  toggleNovedad,
  toggleUser,
  filter,
  setFilter,
  selectedUser,
  setSelectedUser,
  activeDate,
  onDateSelect,
  onCreate,
  onCreateNovedad,
  onEdit,
  onDelete,
  onEditNovedad,
  onDeleteNovedad
}) => {
  const [search, setSearch] = useState(filter);
  const [expandedSchedules, setExpandedSchedules] = useState(new Set());
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [novedadMenuOpenId, setNovedadMenuOpenId] = useState(null);

  // Mini Calendar State
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuOpenId(null);
      setNovedadMenuOpenId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.documento?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpandSchedule = (scheduleId) => {
    const newSet = new Set(expandedSchedules);
    if (newSet.has(scheduleId)) {
      newSet.delete(scheduleId);
    } else {
      newSet.add(scheduleId);
    }
    setExpandedSchedules(newSet);
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

      {/* 1. Botones Superiores (Separados) */}
      <div className="p-4 flex gap-3 border-b border-gray-100">
        <button
          onClick={() => onCreate()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
        >
          <FaPlus size={12} /> Programar
        </button>
        <button
          onClick={() => onCreateNovedad()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-all shadow-sm text-sm font-medium"
        >
          <FaPlus size={12} /> Novedad
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
            placeholder="Buscar personas..."
            value={search}
            onChange={e => { setSearch(e.target.value); setFilter(e.target.value); }}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-gray-700 transition-all"
          />
        </div>

        {/* 4. Listado de Empleados con Programación */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Programaciones</h3>
          </div>
          <div className="space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="text-xs text-gray-400 italic px-2">No se encontraron empleados.</div>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="group relative flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  {/* Checkbox / Visibility */}
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleUser(user.id); }}
                    className="cursor-pointer text-lg flex-shrink-0 transition-transform active:scale-95"
                    style={{ color: user.color || '#3B82F6' }}
                  >
                    {visibleUserIds.has(user.id) ? <FaCheckSquare /> : <FaSquare className="opacity-30" />}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleUser(user.id)}>
                    <div className="text-sm font-medium text-gray-800 truncate">{user.name}</div>
                    <div className="text-xs text-gray-400 truncate">{user.documento || 'Sin ID'}</div>
                  </div>

                  {/* Actions (Edit/Delete) */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(user); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar Programación"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(user.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar Programación"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. Novedades (Sección Independiente) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Novedades</h3>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{novedades?.length || 0}</span>
          </div>
          <div className="space-y-1">
            {(!novedades || novedades.length === 0) ? (
              <div className="text-xs text-gray-400 italic px-2">No hay novedades registradas.</div>
            ) : (
              novedades.map(novedad => (
                <div key={novedad.id} className="group relative flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                  {/* Checkbox */}
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleNovedad(novedad.id); }}
                    className="cursor-pointer text-lg flex-shrink-0 transition-transform active:scale-95"
                    style={{ color: novedad.color }}
                  >
                    {visibleNovedadIds.has(novedad.id) ? <FaCheckSquare /> : <FaSquare className="opacity-30" />}
                  </div>

                  {/* Novedad Info */}
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleNovedad(novedad.id)}>
                    <div className="text-sm font-medium text-gray-800 truncate">{novedad.name}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditNovedad(novedad); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar Novedad"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNovedad(novedad.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar Novedad"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default LaborSchedulingSidebar;