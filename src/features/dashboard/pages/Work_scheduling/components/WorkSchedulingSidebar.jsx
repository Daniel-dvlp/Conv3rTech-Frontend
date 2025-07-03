import React from 'react';

const WorkSchedulingSidebar = ({ employees, filter, setFilter, selected, setSelected, onCreate }) => {
  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
      <button
        className="w-full bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg mb-4 hover:brightness-95"
        onClick={onCreate}
      >
        + Crear Programación
      </button>
      <input
        type="text"
        placeholder="Buscar empleado..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-conv3r-gold focus:border-conv3r-gold"
      />
      <div className="flex-1 overflow-y-auto">
        {employees.filter(emp => emp.name.toLowerCase().includes(filter.toLowerCase())).map(emp => (
          <label key={emp.id} className="flex items-center gap-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(emp.id)}
              onChange={() => setSelected(selected.includes(emp.id)
                ? selected.filter(id => id !== emp.id)
                : [...selected, emp.id])}
              className="accent-conv3r-gold"
            />
            <span className="w-3 h-3 rounded-full" style={{ background: emp.color }}></span>
            <span className="text-gray-800 font-medium">{emp.name}</span>
            <span className="text-xs text-gray-500">{emp.role}</span>
          </label>
        ))}
      </div>
    </aside>
  );
};

export default WorkSchedulingSidebar; 