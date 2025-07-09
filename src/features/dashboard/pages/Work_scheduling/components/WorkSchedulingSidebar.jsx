import React, { useState } from 'react';
import { FaPlus, FaSearch, FaUser, FaEye, FaEyeSlash, FaFilter, FaCalendarAlt } from 'react-icons/fa';

const WorkSchedulingSidebar = ({ employees, filter, setFilter, selected, setSelected, onCreate }) => {
  const [showAll, setShowAll] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(filter.toLowerCase()) || 
    emp.role.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelectAll = () => {
    if (showAll) {
      setSelected([]);
    } else {
      setSelected(employees.map(e => e.id));
    }
    setShowAll(!showAll);
  };

  const toggleEmployee = (empId) => {
    setSelected(selected.includes(empId)
      ? selected.filter(id => id !== empId)
      : [...selected, empId]);
  };

  const selectedCount = selected.length;
  const totalCount = employees.length;

  return (
    <aside className="w-full bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/20 border-r border-orange-200/40 flex flex-col h-full shadow-lg backdrop-blur-sm">
      {/* Header Compacto */}
      <div className="p-4 border-b border-orange-200/40 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-md">
            <FaCalendarAlt className="text-white text-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Empleados</h2>
            <p className="text-xs text-gray-600">Selecciona para filtrar</p>
          </div>
        </div>
        
        {/* Botón Crear */}
        <button
          onClick={onCreate}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        >
          <FaPlus className="text-xs" />
          Crear Turno
        </button>
      </div>

      {/* Búsqueda Compacta */}
      <div className="p-3 border-b border-orange-200/40 bg-white/40 backdrop-blur-sm">
        <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-105' : ''}`}>
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <FaSearch className={`h-3 w-3 transition-colors ${searchFocused ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-7 pr-3 py-2 bg-white/80 border border-orange-200/60 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all placeholder-gray-500 text-gray-700 shadow-sm text-sm"
          />
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="p-3 border-b border-orange-200/40 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <FaFilter className="text-gray-600 text-xs" />
            <span className="text-xs font-medium text-gray-700">Filtros</span>
          </div>
          <div className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold">
            {selectedCount}/{totalCount}
          </div>
        </div>
        
        <button
          onClick={handleSelectAll}
          className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-white/70 hover:bg-white/90 border border-orange-200/60 rounded-md transition-all text-gray-700 hover:text-gray-900 font-medium text-xs"
        >
          {showAll ? <FaEyeSlash className="text-orange-500 text-xs" /> : <FaEye className="text-orange-500 text-xs" />}
          {showAll ? 'Ocultar todos' : 'Mostrar todos'}
        </button>
      </div>

      {/* Lista de Empleados */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <FaUser className="mx-auto text-2xl mb-2 opacity-30" />
            <p className="text-xs">No se encontraron empleados</p>
          </div>
        ) : (
          filteredEmployees.map(emp => {
            const isSelected = selected.includes(emp.id);
            return (
              <div
                key={emp.id}
                className={`group relative overflow-hidden rounded-lg transition-all duration-300 cursor-pointer transform hover:scale-102 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-orange-100 to-yellow-100 shadow-sm border border-orange-300' 
                    : 'bg-white/70 hover:bg-white/90 border border-orange-200/60 hover:border-orange-300'
                }`}
                onClick={() => toggleEmployee(emp.id)}
              >
                <label className="flex items-center gap-2 p-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEmployee(emp.id)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-r from-orange-400 to-yellow-400 border-orange-400' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full shadow-inner border border-white flex-shrink-0"
                      style={{ backgroundColor: emp.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`font-medium truncate transition-colors text-sm ${
                          isSelected ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {emp.name}
                        </span>
                      </div>
                      <span className={`text-xs block transition-colors ${
                        isSelected ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {emp.role}
                      </span>
                    </div>
                  </div>
                </label>
                
                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r from-orange-400/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                  isSelected ? 'opacity-20' : ''
                }`} />
              </div>
            );
          })
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-orange-200/40 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Empleados activos</span>
          <span className="font-bold text-orange-600">{selectedCount}</span>
        </div>
      </div>
    </aside>
  );
};

export default WorkSchedulingSidebar;