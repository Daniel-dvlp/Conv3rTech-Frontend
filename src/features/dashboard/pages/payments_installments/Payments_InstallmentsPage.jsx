import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload } from 'react-icons/fa';
import PagosTable from './components/PagosTable';
import SkeletonRow from './components/SkeletonRow';
import { mockPagos } from './data/Pagos_data';

const Payments_InstallmentsPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setPagos(mockPagos);
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pagos y Abonos</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all">
            <FaPlus />
            Registrar Pagos
          </button>
          <button className="flex items-center gap-2 border border-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all">
            <FaDownload />
            Descargar Balance
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Fecha', 'Número de Contrato', 'Nombre y Apellido', 'Monto Total', 'Monto Pagado', 'Método de Pago', 'Estado', 'Acciones'].map((header, i) => (
                  <th key={i} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">{header}</th>
                ))}
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
        <PagosTable pagos={pagos} />
      )}
    </div>
  );
};

export default Payments_InstallmentsPage;
