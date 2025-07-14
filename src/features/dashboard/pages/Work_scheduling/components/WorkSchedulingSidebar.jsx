import React, { useState } from 'react';
import { FaSearch, FaUser, FaEye, FaEyeSlash, FaPlus } from 'react-icons/fa';
import { showToast } from '../../../../../shared/utils/alertas';

const WorkSchedulingSidebar = ({ employees, filter, setFilter, selected, setSelected, onCreate }) => {
  const [search, setSearch] = useState(filter);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.documento?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id) => {
    setSelected(selected.includes(id)
      ? selected.filter(eid => eid !== id)
      : [...selected, id]);
  };

  const handleToggleAll = () => {
    if (selected.length === employees.length) setSelected([]);
    else setSelected(employees.map(e => e.id));
  };

  const handleCreateClick = () => {
    if (selected.length === 0) {
      showToast('Debes seleccionar al menos un empleado activo para crear un turno.', 'warning');
      return;
    }
    onCreate();
  };

  return (
    <aside className="h-full flex flex-col bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/20 border-r border-yellow-100 shadow-lg min-w-[220px] max-w-xs">
      <div className="p-4 border-b border-yellow-100 bg-white/60 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md">
            <FaUser className="text-white text-sm" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Empleados</h2>
        </div>
        <button
          onClick={handleCreateClick}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-2 px-3 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
        >
          <FaPlus className="text-xs" /> Nuevo Turno
        </button>
      </div>
      <div className="p-3 border-b border-yellow-100 bg-white/40">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={search}
            onChange={e => { setSearch(e.target.value); setFilter(e.target.value); }}
            className="w-full pl-9 pr-3 py-2 bg-white/80 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500 text-gray-700 shadow-sm text-sm"
          />
        </div>
      </div>
      <div className="p-3 border-b border-yellow-100 bg-white/30 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">Mostrar/Ocultar todos</span>
        <button
          onClick={handleToggleAll}
          className="flex items-center gap-1 py-1 px-3 bg-white/70 hover:bg-yellow-100 border border-yellow-200 rounded-md text-gray-700 hover:text-gray-900 font-medium text-xs"
        >
          {selected.length === employees.length ? <FaEyeSlash className="text-orange-500 text-xs" /> : <FaEye className="text-orange-500 text-xs" />}
          {selected.length === employees.length ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FaUser className="mx-auto text-2xl mb-2 opacity-30" />
            <p className="text-xs">No se encontraron empleados</p>
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <div
              key={emp.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${selected.includes(emp.id) ? 'bg-yellow-100 border-yellow-300' : 'bg-white/70 border-yellow-200 hover:bg-yellow-50'} shadow-sm`}
              onClick={() => handleToggle(emp.id)}
            >
              <input
                type="checkbox"
                checked={selected.includes(emp.id)}
                onChange={() => handleToggle(emp.id)}
                className="accent-yellow-500 mr-2"
              />
              <span className="font-medium text-gray-800 text-sm truncate flex-1">{emp.name}</span>
              <span className="text-xs text-gray-500 font-mono">{emp.documento}</span>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-yellow-100 bg-white/60 text-xs text-gray-600 flex items-center justify-between">
        <span>Empleados activos</span>
        <span className="font-bold text-orange-600">{selected.length}</span>
      </div>
    </aside>
  );
};

export default WorkSchedulingSidebar;