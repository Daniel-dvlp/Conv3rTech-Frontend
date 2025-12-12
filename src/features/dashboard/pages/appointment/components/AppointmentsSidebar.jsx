import React, { useState } from 'react';
import { FaSearch, FaPlus, FaChevronLeft, FaChevronRight, FaCheckSquare, FaSquare, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from '../../../../../shared/contexts/AuthContext';
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const AppointmentsSidebar = ({
  activeDate,
  onDateSelect,
  onCreate,
  filter,
  setFilter,
  users = [], // List of technicians
  visibleUserIds = new Set(),
  toggleUser,
  appointments = []
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const selectedDate = activeDate ? new Date(activeDate) : null;
  const { user } = useAuth();
  const { canCreate: checkCanCreate } = usePermissions();

  // Verificar si es Técnico (id_rol 2 según Seed o 3 según configuración legacy)
  const isTecnico = user?.id_rol === 2 || user?.rol?.toLowerCase().includes('tecnico');
  // Usar permiso centralizado para crear
  const canCreate = checkCanCreate('citas');

  const isSameDay = (dateA, dateB) => {
    if (!dateA || !dateB) return false;
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-6 h-6"></div>);
    }

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
          onClick={() => onDateSelect && onDateSelect(dayDate)}
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

  const toggleExpandUser = (userId) => {
    const newSet = new Set(expandedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setExpandedUsers(newSet);
  };

  // Filter users based on search
  const filteredUsers = users.filter(u => {
    const fullName = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const doc = (u.documento || '').toLowerCase();
    const term = (filter || '').toLowerCase();
    return fullName.includes(term) || doc.includes(term);
  });

  return (
    <aside className="h-full flex flex-col bg-white border-r border-gray-200 w-72 flex-shrink-0 overflow-hidden shadow-sm">
      {/* 1. Botón Superior */}
      <div className="p-4 border-b border-gray-100">
        {canCreate && (
          <button
            onClick={onCreate}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-sm font-medium"
          >
            <FaPlus size={12} /> Asignar Cita
          </button>
        )}
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
            placeholder="Buscar técnico..."
            value={filter || ''}
            onChange={e => setFilter && setFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-gray-700 transition-all"
          />
        </div>
        
        {/* 4. Lista de Técnicos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Técnicos</h3>
          </div>
          <div className="space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="text-xs text-gray-400 italic px-2">No se encontraron técnicos.</div>
            ) : (
              filteredUsers.map(user => {
                const userAppointments = appointments.filter(a => Number(a.extendedProps?.usuarioId) === Number(user.id));
                const isExpanded = expandedUsers.has(user.id);
                const isVisible = visibleUserIds.has(user.id);

                return (
                  <div key={user.id} className="flex flex-col bg-white rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                    <div className="group relative flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                       {/* Checkbox / Visibility */}
                       <div
                        onClick={(e) => { e.stopPropagation(); toggleUser && toggleUser(user.id); }}
                        className="cursor-pointer text-lg flex-shrink-0 transition-transform active:scale-95 text-blue-500"
                      >
                        {isVisible ? <FaCheckSquare /> : <FaSquare className="opacity-30" />}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0 cursor-pointer flex items-center justify-between" onClick={() => toggleExpandUser(user.id)}>
                        <div>
                          <div className="text-sm font-medium text-gray-800 truncate">{user.nombre} {user.apellido}</div>
                          <div className="text-xs text-gray-400 truncate">{userAppointments.length} citas</div>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Appointments Details */}
                    {isExpanded && (
                      <div className="pl-9 pr-2 pb-2 space-y-2">
                        {userAppointments.length === 0 ? (
                          <div className="text-xs text-gray-400 italic">Sin citas asignadas</div>
                        ) : (
                          userAppointments.map(appt => (
                            <div key={appt.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                               <div className="font-semibold text-gray-700 truncate">{appt.title}</div>
                               <div className="text-gray-500">{new Date(appt.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};

export default AppointmentsSidebar;
