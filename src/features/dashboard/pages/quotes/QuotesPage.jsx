import React, { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import QuotesTable from './components/QuotesTable';
import SkeletonRow from './components/SkeletonRow';
import { mockQuotes } from './data/Quotes_data';

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setQuotes(mockQuotes);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado del módulo */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
        <button className="flex items-center gap-2 border border-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all">
          <FaDownload />
          Descargar cotizaciones
        </button>
      </div>

      {/* Tabla con Skeleton mientras carga */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden de Servicio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de vencimiento</th>
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
        <QuotesTable quotes={quotes} />
      )}
    </div>
  );
};

export default QuotesPage;
