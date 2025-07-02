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

  /* ──────────────── Datos simulados ──────────────── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagos(mockPagos);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  /* ──────────────── Exportar a Excel ──────────────── */
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPagos);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos y abonos');
    XLSX.writeFile(workbook, 'ReporteDePagosYabonos.xlsx');
  };

  /* ──────────────── Añadir pago desde el modal ──────────────── */
  const handleAgregarPago = (nuevoPago) => {
    setPagos(prev => [...prev, nuevoPago]);
    setCurrentPage(1);            // volvemos a la primera página
    window.scrollTo({ top: 0 });  // UX: el usuario ve el resultado
  };

  /* ──────────────── Filtros y paginación ──────────────── */
  const filteredPagos = useMemo(() =>
    pagos.filter(p =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numeroContrato.toString().includes(searchTerm) ||
      p.metodoPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estado.toLowerCase().includes(searchTerm.toLowerCase())
    ), [pagos, searchTerm]);

  const totalPages = Math.ceil(filteredPagos.length / ITEMS_PER_PAGE);

  const paginatedPagos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPagos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPagos, currentPage]);

  /* ──────────────── UI ──────────────── */
  return (
    <div className="p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestión de Pagos y Abonos
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador */}
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

          {/* Exportar */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel /> Exportar
          </button>

          {/* Registrar pago */}
          <button
            onClick={() => setMostrarModalPago(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus /> Registrar Pago
          </button>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                {['Fecha','Número de Contrato','Nombre y Apellido','Monto Total','Monto Pagado','Método de Pago','Estado','Acciones']
                  .map((h,i) => (
                    <th key={i} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(ITEMS_PER_PAGE)].map((_,i) => <SkeletonRow key={i} />)}
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
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Modal */}
      <CreatePaymentsModal
        isOpen={mostrarModalPago}
        onClose={() => setMostrarModalPago(false)}
        onAddPago={handleAgregarPago}
      />
    </div>
  );
};

export default Payments_InstallmentsPage;
