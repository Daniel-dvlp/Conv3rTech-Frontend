// src/features/dashboard/pages/Project/components/HistorialSalidasModal.jsx

import React from 'react';
import { FaTimes, FaTruck, FaClock, FaUser, FaUserCheck, FaMapMarkerAlt, FaClipboardList } from 'react-icons/fa';

const HistorialSalidasModal = ({ 
  isOpen, 
  onClose, 
  project,
  sedeIndex 
}) => {
  if (!isOpen) return null;

  const sede = sedeIndex !== null ? project?.sedes?.[sedeIndex] : null;
  const salidas = sede ? sede.salidasMaterial || [] : project?.sedes?.flatMap(sede => sede.salidasMaterial || []) || [];

  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSedeName = (sedeIndex) => {
    return project?.sedes?.[sedeIndex]?.nombre || 'Sede no encontrada';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <FaClipboardList className="text-blue-500 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">
              Historial de Salidas de Material
            </h2>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-6">
          {/* Información del contexto */}
          <div className="mb-6">
            {sede ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span className="font-semibold text-blue-900">{sede.nombre}</span>
                </div>
                <p className="text-sm text-blue-700">{sede.ubicacion}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-green-500" />
                  <span className="font-semibold text-green-900">Todas las Sedes del Proyecto</span>
                </div>
                <p className="text-sm text-green-700">Historial completo de salidas de materiales</p>
              </div>
            )}
          </div>

          {/* Lista de salidas */}
          {salidas.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {salidas.map((salida, index) => (
                <div key={salida.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FaTruck className="text-blue-500" />
                      <span className="font-semibold text-gray-800">{salida.material}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        x{salida.cantidad}
                      </span>
                      {salida.costoTotal && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          {formatCurrency(salida.costoTotal)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaClock />
                      <span>{formatDate(salida.fecha)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-500" />
                      <span className="text-gray-600">Entrega:</span>
                      <span className="font-medium text-gray-800">{salida.entregador}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserCheck className="text-gray-500" />
                      <span className="text-gray-600">Recibe:</span>
                      <span className="font-medium text-gray-800">{salida.receptor}</span>
                    </div>
                  </div>

                  {!sede && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt />
                      <span>Sede: {getSedeName(salida.sedeIndex || 0)}</span>
                    </div>
                  )}

                  {salida.observaciones && (
                    <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700 italic">
                        "{salida.observaciones}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaClipboardList className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay salidas de material registradas</p>
              <p className="text-gray-400 text-sm mt-2">
                {sede ? 'para esta sede' : 'en este proyecto'}
              </p>
            </div>
          )}

          {/* Resumen */}
          {salidas.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Resumen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total salidas:</span>
                  <span className="font-semibold text-gray-800 ml-2">{salidas.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Materiales únicos:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {new Set(salidas.map(s => s.material)).size}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Cantidad total:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {salidas.reduce((sum, s) => sum + s.cantidad, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Última salida:</span>
                  <span className="font-semibold text-gray-800 ml-2">
                    {salidas.length > 0 ? formatDate(salidas[salidas.length - 1].fecha) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default HistorialSalidasModal;
