// src/features/dashboard/pages/purchases/PurchasesPage.jsx

import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { mockPurchases } from './data/Purchases_data';
import PurchasesTable from './components/PurchasesTable';
import SkeletonPurchaseRow from './components/SkeletonRow';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 1500); // Simula carga
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Compras</h1>
        <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
          <FaPlus />
          Nueva Compra
        </button>
      </div>

      {/* Tabla o Skeleton */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              {[...Array(4)].map((_, i) => (
                <SkeletonPurchaseRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <PurchasesTable purchases={purchases} />
      )}
    </div>
  );
};

export default PurchasesPage;
