import React from 'react';

const EmployeeDetailModal = ({ empleado, onClose }) => {
  if (!empleado) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${empleado.name || empleado.nombre}`}
            alt={empleado.name || empleado.nombre}
            className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{empleado.name || `${empleado.nombre} ${empleado.apellido}`}</h2>
            <p className="text-yellow-600 font-semibold text-sm">{empleado.role}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              empleado.status === 'Activo' ? 'bg-green-100 text-green-700' :
              empleado.status === 'Inactivo' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {empleado.status}
            </span>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Contacto</h3>
          <div className="text-xs text-gray-700 space-y-1">
            <div><span className="font-semibold">Correo:</span> {empleado.email}</div>
            <div><span className="font-semibold">Celular:</span> {empleado.celular}</div>
            <div><span className="font-semibold">Documento:</span> {empleado.documento}</div>
          </div>
        </div>
        {/* Detalles del turno si existen */}
        {(empleado.start || empleado.end || empleado.title) && (
          <div className="mb-2">
            <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Detalles del Turno</h3>
            <div className="text-xs text-gray-700 space-y-1">
              {empleado.title && <div><span className="font-semibold">Título:</span> {empleado.title}</div>}
              {empleado.start && <div><span className="font-semibold">Inicio:</span> {new Date(empleado.start).toLocaleString()}</div>}
              {empleado.end && <div><span className="font-semibold">Fin:</span> {new Date(empleado.end).toLocaleString()}</div>}
              {empleado.role && <div><span className="font-semibold">Rol:</span> {empleado.role}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailModal; 