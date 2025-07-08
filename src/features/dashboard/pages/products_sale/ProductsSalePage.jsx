import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import SalesTable from './components/SalesTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import NewProductSaleModal from './components/NewProductSaleModal';
import { mockSales } from './data/Sales_data';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 5;

const ProductsSalePage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSales(mockSales);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) => (text || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  const filteredSales = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    return sales.filter((sale) =>
      normalize(sale.numero).includes(normalizedSearch) ||
      normalize(sale.cliente).includes(normalizedSearch) ||
      normalize(sale.fechaHora).includes(normalizedSearch) ||
      normalize(String(sale.monto)).includes(normalizedSearch) ||
      normalize(sale.metodoPago).includes(normalizedSearch) ||
      normalize(sale.estado).includes(normalizedSearch)
    );
  }, [sales, searchTerm]);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSales, currentPage]);

  const handleAddSale = (newSale) => {
    setSales((prev) => [newSale, ...prev]);
    setShowNewModal(false);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Venta de productos');
    XLSX.writeFile(workbook, 'ReporteVentas.xlsx');
  };

  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ventas</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por número, cliente, fecha, monto, método o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
          >
            <FaPlus />
            Nueva venta
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['# Venta', 'Cliente', 'Fecha y Hora', 'Monto Total', 'Método de Pago', 'Estado', 'Acciones'].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {header}
                  </th>
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
          <SalesTable sales={currentItems} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      <NewProductSaleModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSave={handleAddSale}
      />
    </div>
  );
};

export default ProductsSalePage;
