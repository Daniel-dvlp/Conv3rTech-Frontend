import React from 'react';
import { FaEye, FaTimes } from 'react-icons/fa'; // 👈 solo los íconos necesarios

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '-';
  return amount.toLocaleString("es-CO", { style: "currency", currency: "COP" });
};

const PurchasesTable = ({ purchases, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Recibo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {purchases.map((purchase) => (
            <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(purchase.id).padStart(3, '0')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.receiptNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.supplier}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(purchase.amount ?? purchase.total)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.registrationDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button
                    title="Ver"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => onViewDetails?.(purchase)}
                  >
                    <FaEye size={16} />
                  </button>
                  <button title="Anular" className="text-red-600 hover:text-red-800">
                    <FaTimes size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesTable;
