// src/features/dashboard/pages/ventas/ProductsSalePage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';
import SalesTable from './components/SalesTable';
import SkeletonRow from './components/SkeletonRow';
import { mockSales } from './data/Sales_data';

const ProductsSalePage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSales(mockSales);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado del módulo */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Ventas</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
            <FaPlus />
            Nueva venta
          </button>
          <button className="flex items-center gap-2 border border-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all">
            <FaDownload />
            Descargar ventas
          </button>
        </div>
      </div>

      {/* Tabla con Skeleton mientras carga */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Venta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método de Pago</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <SalesTable sales={sales} />
      )}
    </div>
  );
};

export default ProductsSalePage;
