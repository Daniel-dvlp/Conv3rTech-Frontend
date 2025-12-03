// src/features/dashboard/pages/purchases/components/PurchasesDetailModal.jsx

import React, { useRef } from 'react';
import {
  FaTimes,
  FaCalendar,
  FaUser,
  FaBuilding,
  FaClipboard,
  FaMoneyBillWave,
  FaStickyNote,
  FaClock,
  FaInfoCircle
} from 'react-icons/fa';

// Modificado InfoRow para permitir alinear el contenido principal si es necesario
const InfoRow = ({ icon, label, children, alignRight = false }) => (
  <div className="flex items-start gap-3 text-sm">
    <div className="text-gray-400 mt-0.5">{icon}</div>
    <div className="flex-1">
      <span className="text-gray-500">{label}:</span>
      {/* Añadida clase condicional para alinear a la derecha */}
      <p className={`font-semibold text-gray-900 ${alignRight ? 'text-right' : ''}`}>{children}</p>
    </div>
  </div>
);

const PurchaseDetailModal = ({ compra, onClose }) => {
  const modalContentRef = useRef();
  // Eliminado mouseDownTargetRef y los handlers de mouse para prevenir cierre fuera del modal

  if (!compra) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16 md:pt-24"
      // Eliminado onMouseDown y onMouseUp aquí para que no cierre al hacer clic fuera
    >
      <div
        className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Esto detiene la propagación de clics dentro del modal
        ref={modalContentRef}
      >
        <header className="flex justify-between items-center p-4 sm:p-6 border-b bg-white rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orden de Compra #{compra.numeroRecibo}</h2>
            <p className="text-md text-gray-600">Proveedor: {compra.proveedor}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-4 sm:p-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6">

          {/* Información de la Compra + datos de creación */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaClipboard className="text-gray-500" />
              <span>Información de la Compra</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow icon={<FaClipboard />} label="Número de Recibo">{compra.numeroRecibo}</InfoRow>
              <InfoRow icon={<FaBuilding />} label="Proveedor">{compra.proveedor}</InfoRow>
              <InfoRow icon={<FaCalendar />} label="Fecha de Registro">{compra.fechaRegistro}</InfoRow>
              {/* No estoy seguro si 'creadoPor' y 'fechaCreacion' son parte del mock o reales */}
              {compra.creadoPor && <InfoRow icon={<FaUser />} label="Creado por">{compra.creadoPor}</InfoRow>}
              {compra.fechaCreacion && <InfoRow icon={<FaClock />} label="Creado en">{new Date(compra.fechaCreacion).toLocaleString('es-CO')}</InfoRow>}
              <InfoRow icon={<></>} label="Estado">
                <span className={`font-medium ${
                  compra.estado === 'Activa' ? 'text-green-600' :
                  compra.estado === 'Anulada' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {compra.estado}
                </span>
              </InfoRow>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaClipboard className="text-gray-500" />
              <span>Productos</span>
            </h3>
            {compra.productos?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 border">Producto</th>
                      <th className="px-3 py-2 border">Modelo</th>
                      <th className="px-3 py-2 border">Unidad</th>
                      <th className="px-3 py-2 border text-right">Cantidad</th> {/* Alineado a la derecha */}
                      <th className="px-3 py-2 border text-right">Precio Unitario</th> {/* Alineado a la derecha */}
                      <th className="px-3 py-2 border text-right">Total</th> {/* Alineado a la derecha */}
                    </tr>
                  </thead>
                  <tbody>
                    {compra.productos.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2 border">{item.nombre || 'Desconocido'}</td>
                        <td className="px-3 py-2 border">{item.modelo || 'N/A'}</td>
                        <td className="px-3 py-2 border">{item.unidadDeMedida || 'N/A'}</td>
                        <td className="px-3 py-2 border text-right">{item.cantidad}</td> {/* Alineado a la derecha */}
                        <td className="px-3 py-2 border text-right"> {/* Alineado a la derecha */}
                          ${item.precioUnitarioCompra?.toLocaleString('es-CO') || '0'}
                        </td>
                        <td className="px-3 py-2 border text-right"> {/* Alineado a la derecha */}
                          ${(item.cantidad * (item.precioUnitarioCompra || 0)).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 italic">No hay productos registrados.</p>
            )}
          </div>

          {/* Totales */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaMoneyBillWave className="text-gray-500" />
              <span>Totales</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Usando alignRight para los valores numéricos */}
              <InfoRow icon={<></>} label="Subtotal" alignRight>${compra.subtotal?.toLocaleString('es-CO') || '0'}</InfoRow>
              <InfoRow icon={<></>} label="IVA" alignRight>${compra.iva?.toLocaleString('es-CO') || '0'}</InfoRow>
              <InfoRow icon={<></>} label="Total" alignRight>${compra.total?.toLocaleString('es-CO') || '0'}</InfoRow>
            </div>
          </div>

          {/* Observaciones (mostrar siempre la nueva columna aunque esté vacía) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <FaStickyNote className="text-gray-500" />
              <span>Observaciones</span>
            </h3>
            {compra.observaciones ? (
              <p className="text-gray-800 whitespace-pre-line">{compra.observaciones}</p>
            ) : compra.motivoAnulacion ? (
              <p className="text-gray-500 italic">
                Sin observaciones adicionales. Revisar el motivo de anulación registrado más abajo.
              </p>
            ) : (
              <p className="text-gray-500 italic">Sin observaciones registradas.</p>
            )}
          </div>

          {/* Motivo de Anulación (en su propia sección si la compra está anulada) */}
          {compra.estado === 'Anulada' && compra.motivoAnulacion && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-3">
                <FaInfoCircle className="text-red-500" />
                <span>Motivo de Anulación</span>
              </h3>
              <p className="text-red-800 font-medium">{compra.motivoAnulacion}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailModal;