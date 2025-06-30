import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import PagosTable from './components/PagosTable';
import SkeletonRow from './components/SkeletonRow';
import { mockPagos } from './data/Pagos_data';
import Pagination from '../../../../shared/components/Pagination';
import * as XLSX from 'xlsx';
import CreatePaymentsModal from './components/CreatePaymentsModal';

const ITEMS_PER_PAGE = 5;

const Payments_InstallmentsPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  

  useEffect(() => {
    setTimeout(() => {
      setPagos(mockPagos);
      setLoading(false);
    }, 1200);
  }, []);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPagos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos y abonos");
    XLSX.writeFile(workbook, "ReporteDePagosYabonos.xlsx");
  };

  const handleAgregarPago = (nuevoPago) => {
    setPagos((prevPagos) => [...prevPagos, nuevoPago]);
  };

  const filteredPagos = useMemo(() =>
    pagos.filter(p =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numeroContrato.toString() === (searchTerm) ||
      p.metodoPago.toLowerCase() === (searchTerm.toLowerCase()) ||
      p.estado.toLowerCase() === searchTerm.toLowerCase()
    ), [pagos, searchTerm]
  );

  const totalPages = Math.ceil(filteredPagos.length / ITEMS_PER_PAGE);

  const paginatedPagos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPagos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPagos, currentPage]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pagos y Abonos</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, contrato o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Exportar
          </button>

          <button
            onClick={() => setMostrarModalPago(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
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
              {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <PagosTable pagos={paginatedPagos} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      <CreatePaymentsModal
        isOpen={mostrarModalPago}
        onClose={() => setMostrarModalPago(false)}
        onAddPago={handleAgregarPago}
      />
    </div>
  );
};

export default Payments_InstallmentsPage;
