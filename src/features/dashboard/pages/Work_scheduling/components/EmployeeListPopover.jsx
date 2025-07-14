import React from 'react';

const EmployeeListPopover = ({ empleados, anchor, onSelect, onClose }) => {
  if (!empleados || empleados.length === 0 || !anchor) return null;
  const style = {
    position: 'fixed',
    top: anchor.top + anchor.height + 8,
    left: anchor.left,
    zIndex: 110,
    minWidth: 240,
    maxWidth: 300,
  };
  return (
    <div style={style} className="bg-white/95 backdrop-blur-xl border-2 border-yellow-400 rounded-xl shadow-xl p-3 animate-fade-in">
      <div className="font-bold text-gray-800 text-base mb-2">Empleados asignados</div>
      <ul className="divide-y divide-gray-100">
        {empleados.map((emp) => (
          <li key={emp.id} className="py-2 flex items-center gap-2 cursor-pointer hover:bg-yellow-50 rounded-lg px-2 transition-all" onClick={() => onSelect(emp)}>
            <span className="font-semibold text-gray-700 text-sm truncate flex-1">{emp.name}</span>
            <span className="bg-gray-200 text-gray-700 text-xs font-mono rounded px-2 py-0.5">{emp.documento}</span>
          </li>
        ))}
      </ul>
      <button onClick={onClose} className="mt-3 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 font-bold text-xs hover:bg-yellow-100 transition-all ml-auto block">Cerrar</button>
    </div>
  );
};

export default EmployeeListPopover; 