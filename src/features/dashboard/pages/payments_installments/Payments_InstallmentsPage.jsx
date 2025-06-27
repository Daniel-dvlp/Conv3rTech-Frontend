import React, { useState, useEffect } from 'react';
import { FaPlus, FaFileExcel } from 'react-icons/fa';
import PagosTable from './components/PagosTable';
import SkeletonRow from './components/SkeletonRow';
import { mockPagos } from './data/Pagos_data';
import Pagination from '../../../../shared/components/Pagination';
import * as XLSX from 'xlsx'; // si tienes paginación

const ITEMS_PER_PAGE = 5; // o el número que desees

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

  const handleExport = () => {
      const worksheet = XLSX.utils.json_to_sheet(pagos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos y abonos");
      XLSX.writeFile(workbook, "ReporteDePagosYabonos.xlsx");
    };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pagos y Abonos</h1>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Exportar
          </button>
          <button className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-700flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-colors transition-all">
            <FaPlus />
            Registrar Pagos
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
        <>
          <PagosTable pagos={pagos} />
          <Pagination
            totalItems={pagos.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              // Aquí puedes manejar el cambio de página
              console.log("Página actual:", page);
            }}></Pagination>
        </>

      )}
    </div>
  );
};

export default Payments_InstallmentsPage;
