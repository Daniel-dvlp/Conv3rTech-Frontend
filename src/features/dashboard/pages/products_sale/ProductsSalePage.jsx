import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import SalesTable from './components/SalesTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import NewProductSaleModal from './components/NewProductSaleModal';
import ProductSaleDetailModal from './components/ProductSaleDetailModal';
import { mockSales } from './data/Sales_data';
import { mockClientes } from '../clients/data/Clientes_data';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showSuccess, showError, showInfo, confirmDelete } from '../../../../shared/utils/alerts';


const ITEMS_PER_PAGE = 5;

const ProductsSalePage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProductSale, setSelectedProductSale] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setSales(mockSales);
      setClients(mockClientes);
      setLoading(false);
    }, 1500);
  }, []);

  const normalize = (text) =>
    text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

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
    try {
      setSales((prev) => [newSale, ...prev]);
      showSuccess('Venta registrada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Ocurrió un error al guardar la venta');
    } finally {
      setShowNewModal(false);
    }
  };

  const handleExport = () => {
    // Estructura final para el Excel: cada fila = un producto de una venta
    const exportData = [];

    filteredSales.forEach((venta) => {
      venta.productos.forEach((producto, index) => {
        exportData.push({
          'ID Venta': venta.id,
          'Venta N°': venta.numero,
          'Fecha y Hora': venta.fechaHora,

          'Cliente': venta.cliente,
          'Documento Cliente': venta.clienteData?.documento || '',
          'Email Cliente': venta.clienteData?.email || '',
          'Celular Cliente': venta.clienteData?.celular || '',

          'Producto': producto.nombre,
          'Modelo': producto.modelo || '',
          'Unidad': producto.unidad || '',
          'Cantidad': producto.cantidad,
          'Precio Unitario': producto.precio,
          'Subtotal Producto': producto.subtotal,

          'Método de Pago': venta.metodoPago,
          'Estado': venta.estado,

          'Subtotal Venta': venta.subtotal,
          'IVA': venta.iva,
          'Monto Total': venta.monto,
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Venta de productos');
    XLSX.writeFile(workbook, 'ReporteVentas.xlsx');
  };

  const handleDownloadPDF = (venta) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Factura de Venta - ${venta.numero}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${venta.fechaHora}`, 14, 30);
    doc.text(`Cliente: ${venta.cliente}`, 14, 38);
    doc.text(`Documento: ${venta.clienteData?.documento || ''}`, 14, 46);
    doc.text(`Email: ${venta.clienteData?.email || ''}`, 14, 54);
    doc.text(`Celular: ${venta.clienteData?.celular || ''}`, 14, 62);
    doc.text(`Método de Pago: ${venta.metodoPago}`, 14, 70);
    doc.text(`Estado: ${venta.estado}`, 14, 78);

    autoTable(doc, {
      startY: 88,
      head: [['Producto', 'Modelo', 'Cantidad', 'Unidad', 'Precio Unitario', 'Subtotal']],
      body: venta.productos.map(p => [
        p.nombre,
        p.modelo || '',
        p.cantidad,
        p.unidad || '',
        `$${p.precio.toLocaleString()}`,
        `$${p.subtotal.toLocaleString()}`
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100], textColor: 255, halign: 'center' }
    });

    const finalY = doc.lastAutoTable?.finalY || 98;

    doc.setFontSize(12);
    doc.text(`Subtotal: $${venta.subtotal.toLocaleString()}`, 14, finalY + 10);
    doc.text(`IVA (19%): $${venta.iva.toLocaleString()}`, 14, finalY + 18);
    doc.setFontSize(14);
    doc.text(`Total: $${venta.monto.toLocaleString()}`, 14, finalY + 28);

    doc.save(`Factura_${venta.numero}.pdf`);
  };

  const handleCancelSale = async (venta) => {
    try {
      if (venta.estado === 'Anulada') {
        showInfo('Esta venta ya se encuentra anulada');
        return;
      }

      const confirmed = await confirmDelete(
        '¿Estás segura de que deseas anular esta venta?',
        'Esta acción no se puede deshacer.'
      );

      if (!confirmed) return;

      const updated = { ...venta, estado: 'Anulada' };
      setSales((prev) => prev.map((v) => (v.id === venta.id ? updated : v)));

      showSuccess('Venta anulada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Ocurrió un error al anular la venta');
    }
  };


  return (
    <div className="p-4 md:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Ventas</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar"
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
            onClick={() => handleExport(filteredSales)}
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
          <SalesTable
            sales={currentItems}
            clients={clients}
            onViewDetails={(sale) => setSelectedProductSale(sale)}
            onDownloadPDF={handleDownloadPDF}
            onCancel={handleCancelSale}
          />
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

      {selectedProductSale && (
        <ProductSaleDetailModal
          productSale={selectedProductSale}
          onClose={() => setSelectedProductSale(null)}
        />
      )}
    </div>
  );
};

export default ProductsSalePage;
