import React from 'react';
import { FaEye, FaTimes, FaDownload, FaEdit } from 'react-icons/fa'; // 👈 Se añadió FaEdit

const PurchasesTable = ({ purchases }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero de recibo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {purchases.map((purchase) => (
            <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{String(purchase.id).padStart(3, '0')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.receiptNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.supplier}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.registrationDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-3">
                  <button title="Ver" className="text-blue-600 hover:text-blue-800">
                    <FaEye size={16} />
                  </button>
                  <button title="Editar" className="text-yellow-500 hover:text-yellow-600">
                    <FaEdit size={16} />
                  </button>
                  <button title="Anular" className="text-red-600 hover:text-red-800">
                    <FaTimes size={16} />
                  </button>
                  <button title="Descargar" className="text-green-600 hover:text-green-800">
                    <FaDownload size={16} />
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
