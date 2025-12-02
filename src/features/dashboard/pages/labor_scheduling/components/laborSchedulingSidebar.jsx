import React, { useState } from 'react';
import { FaSearch, FaUser, FaEye, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../../../../shared/contexts/AuthContext';

const LaborSchedulingSidebar = ({
  users,
  filter,
  setFilter,
  selectedUser,
  setSelectedUser,
  onCreate
}) => {
  const [search, setSearch] = useState(filter);
  const { hasPrivilege } = useAuth();

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.documento?.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserClick = (id) => {
    setSelectedUser(selectedUser === id ? null : id);
  };

  const handleShowAll = () => {
    setSelectedUser(null);
  };

  const handleCreateClick = () => {
    // Permitir abrir el modal de creación incluso si no hay usuarios seleccionados.
    // La selección de usuarios se puede gestionar dentro del modal.
    onCreate();
  };

  return (
    <aside className="h-full flex flex-col bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/20 border-r border-yellow-100 shadow-lg min-w-[220px] max-w-xs">
      <div className="p-4 border-b border-yellow-100 bg-white/60 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md">
            <FaUser className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Usuarios</h2>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleCreateClick}
            disabled={!hasPrivilege('programacion_laboral', 'Crear')}
            className={`w-full inline-flex justify-center py-2 px-6 shadow-sm text-sm font-medium rounded-md flex items-center justify-center gap-2 ${
              hasPrivilege('programacion_laboral', 'Crear')
                ? 'text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            title={!hasPrivilege('programacion_laboral', 'Crear') ? 'No tienes privilegio para crear' : ''}
          >
            <FaPlus className="text-xs" /> Nueva Programación
          </button>
        </div>
      </div>
      <div className="p-3 border-b border-yellow-100 bg-white/40">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => { setSearch(e.target.value); setFilter(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 bg-white/80 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500 text-gray-700 shadow-sm text-sm"
          />
        </div>
      </div>
      <div className="p-3 border-b border-yellow-100 bg-white/30 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Vista general</span>
        <button
          onClick={handleShowAll}
          className="inline-flex justify-center py-1 px-3 border border-transparent shadow-sm text-xs font-medium rounded-md text-conv3r-dark bg-conv3r-gold hover:brightness-95 transition-transform hover:scale-105 flex items-center gap-1"
        >
          <FaEye className="text-xs" />
          Ver todos
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FaUser className="mx-auto text-2xl mb-2 opacity-30" />
            <p className="text-xs">No se encontraron usuarios con programaciones laborales</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${selectedUser === user.id ? 'bg-yellow-100 border-yellow-300' : 'bg-white/70 border-yellow-200 hover:bg-yellow-50'} shadow-sm`}
              onClick={() => handleUserClick(user.id)}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedUser === user.id ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300'}`}>
                {selectedUser === user.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className="font-medium text-gray-800 text-sm truncate flex-1">{user.name}</span>
              <span className="text-xs text-gray-500 font-mono">{user.documento}</span>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-yellow-100 bg-white/60 text-xs text-gray-600 flex items-center justify-between">
        <span>Usuario seleccionado</span>
        <span className="font-bold text-orange-600">{selectedUser ? '1' : 'Todos'}</span>
      </div>
    </aside>
  );
};

export default LaborSchedulingSidebar;
