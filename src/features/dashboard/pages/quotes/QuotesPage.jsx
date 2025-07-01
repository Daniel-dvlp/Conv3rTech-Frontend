import React, { useState, useEffect, useMemo } from 'react';
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import QuotesTable from './components/QuotesTable';
import SkeletonRow from './components/SkeletonRow';
import { mockQuotes } from './data/Quotes_data';
import Pagination from '../../../../shared/components/Pagination';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 5;

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setQuotes(mockQuotes);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) => 
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredQuotes = useMemo(() => {
  const normalizedSearch = normalize(searchTerm);

  return quotes.filter((quote) =>
    normalize(quote.cliente).includes(normalizedSearch) ||
    normalize(quote.estado).includes(normalizedSearch) ||
    normalize(quote.ordenServicio).includes(normalizedSearch)
  );
}, [quotes, searchTerm]);


  const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuotes, currentPage]);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredQuotes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cotizaciones');
    XLSX.writeFile(workbook, 'ReporteCotizaciones.xlsx');
  };

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado del módulo con buscador */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente, estado u orden..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Exportar
          </button>
        </div>
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
        <>
          <QuotesTable quotes={currentItems} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default QuotesPage;
