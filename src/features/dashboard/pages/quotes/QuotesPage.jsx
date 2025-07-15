import React, { useState, useEffect, useMemo } from 'react';
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import QuotesTable from './components/QuotesTable';
import SkeletonRow from './components/SkeletonRow';
import { mockQuotes } from './data/Quotes_data';
import Pagination from '../../../../shared/components/Pagination';
import QuoteDetailModal from './components/QuoteDetailModal';
import QuoteEditModal from './components/QuoteEditModal';
import { mockProducts } from '../products/data/Products_data.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showSuccess, showError, showInfo, confirmDelete } from '../../../../shared/utils/alerts';

const ITEMS_PER_PAGE = 5;

const QuotesPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteToEdit, setQuoteToEdit] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setQuotes(mockQuotes);
      setProducts(mockProducts)
      setLoading(false);
    }, 1500);
  }, []);

  const mockServices = [
    { nombre: 'Instalación', descripcion: 'Servicio de instalación básica', precio: 50000 },
    { nombre: 'Mantenimiento', descripcion: 'Servicio de mantenimiento general', precio: 70000 },
    { nombre: 'Revisión', descripcion: 'Revisión técnica del equipo', precio: 30000 },
  ];
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

  const handleSaveQuoteChanges = (updatedQuote) => {
    try {
      setQuotes((prev) =>
        prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
      );
      showSuccess('Cotización actualizada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Ocurrió un error al actualizar la cotización');
    } finally {
      setQuoteToEdit(null);
    }
  };

  const handleExport = (quotes) => {
    try {
      if (!Array.isArray(quotes) || quotes.length === 0) {
        showInfo('No hay cotizaciones para exportar');
        return;
      }

      const exportData = [];

      quotes.forEach((quote) => {
        const base = {
          'ID Cotización': quote.id,
          'Orden de Servicio': quote.ordenServicio,
          'Cliente': `${quote.clienteData.nombre} ${quote.clienteData.apellido}`,
          'Documento': quote.clienteData.documento,
          'Correo electrónico': quote.clienteData.email,
          'Estado': quote.estado,
          'Fecha de Vencimiento': quote.fechaVencimiento,
          'Subtotal Productos': quote.detalleOrden.subtotalProductos,
          'Subtotal Servicios': quote.detalleOrden.subtotalServicios,
          'IVA': quote.detalleOrden.iva,
          'Total Cotización': quote.detalleOrden.total,
        };

        quote.detalleOrden.productos.forEach((p) => {
          exportData.push({
            ...base,
            Tipo: 'Producto',
            Nombre: p.nombre,
            Descripción: p.descripcion,
            Cantidad: p.cantidad,
            'Precio Unitario': p.precio,
            Total: p.total,
          });
        });

        quote.detalleOrden.servicios.forEach((s) => {
          exportData.push({
            ...base,
            Tipo: 'Servicio',
            Nombre: s.servicio,
            Descripción: s.descripcion,
            Cantidad: s.cantidad,
            'Precio Unitario': s.precio,
            Total: s.total,
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Cotizaciones');
      XLSX.writeFile(workbook, 'ReporteCotizaciones.xlsx');

      showSuccess('Archivo Excel exportado exitosamente');
    } catch (error) {
      console.error(error);
      showError('Ocurrió un error al exportar las cotizaciones');
    }
  };


  const handleDownloadPDF = (cotizacion) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Cotización - ${cotizacion.ordenServicio}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Fecha de Vencimiento: ${cotizacion.fechaVencimiento}`, 14, 30);
    doc.text(`Cliente: ${cotizacion.cliente}`, 14, 38);
    doc.text(`Documento: ${cotizacion.clienteData?.documento || ''}`, 14, 46);
    doc.text(`Email: ${cotizacion.clienteData?.email || ''}`, 14, 54);
    doc.text(`Estado: ${cotizacion.estado}`, 14, 62);

    const detalle = [];

    if (cotizacion.detalleOrden.productos.length > 0) {
      detalle.push([
        { content: 'Productos', colSpan: 6, styles: { halign: 'center', fillColor: [220, 220, 220] } }
      ]);
      detalle.push(['Nombre', 'Descripción', 'Cantidad', 'Precio Unitario', '', 'Total']);
      cotizacion.detalleOrden.productos.forEach((p) => {
        detalle.push([
          p.nombre,
          p.descripcion,
          p.cantidad,
          `$${p.precioUnitario.toLocaleString()}`,
          '',
          `$${p.total.toLocaleString()}`
        ]);
      });
    }

    if (cotizacion.detalleOrden.servicios.length > 0) {
      detalle.push([
        { content: 'Servicios', colSpan: 6, styles: { halign: 'center', fillColor: [220, 220, 220] } }
      ]);
      detalle.push(['Nombre', 'Descripción', 'Cantidad', 'Precio Unitario', '', 'Total']);
      cotizacion.detalleOrden.servicios.forEach((s) => {
        detalle.push([
          s.servicio,
          s.descripcion,
          s.cantidad,
          `$${s.precioUnitario.toLocaleString()}`,
          '',
          `$${s.total.toLocaleString()}`
        ]);
      });
    }

    autoTable(doc, {
      startY: 72,
      body: detalle,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100], textColor: 255, halign: 'center' }
    });

    const finalY = doc.lastAutoTable?.finalY || 90;

    doc.setFontSize(12);
    doc.text(`Subtotal Productos: $${cotizacion.detalleOrden.subtotalProductos.toLocaleString()}`, 14, finalY + 10);
    doc.text(`Subtotal Servicios: $${cotizacion.detalleOrden.subtotalServicios.toLocaleString()}`, 14, finalY + 18);
    doc.text(`IVA (19%): $${cotizacion.detalleOrden.iva.toLocaleString()}`, 14, finalY + 26);

    doc.setFontSize(14);
    doc.text(`Total: $${cotizacion.detalleOrden.total.toLocaleString()}`, 14, finalY + 36);

    doc.save(`Cotizacion_${cotizacion.ordenServicio}.pdf`);
  };

  const handleCancelQuote = async (quote) => {
    try {
      if (quote.estado === 'Anulada') {
        showInfo('Esta cotización ya se encuentra anulada');
        return;
      }

      const confirmed = await confirmDelete(
        '¿Estás segura de que deseas anular esta cotización?',
        'Esta acción no se puede deshacer.'
      );

      if (!confirmed) return;

      const updatedQuote = { ...quote, estado: 'Anulada' };
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) => (q.id === quote.id ? updatedQuote : q))
      );

      showSuccess('Cotización anulada exitosamente');
    } catch (error) {
      console.error(error);
      showError('Ocurrió un error al anular la cotización');
    }
  };



  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
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
            onClick={() => handleExport(filteredQuotes)}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            <FaFileExcel />
            Exportar
          </button>
        </div>
      </div>

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
          <QuotesTable
            quotes={currentItems}
            onViewDetails={(quote) => setSelectedQuote(quote)}
            onDownloadPDF={handleDownloadPDF}
            onEdit={(quote) => setQuoteToEdit(quote)}
            onCancel={handleCancelQuote}
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

      {selectedQuote && (
        <QuoteDetailModal
          quote={selectedQuote}
          onClose={() => setSelectedQuote(null)}
        />
      )}

      {quoteToEdit && (
        <QuoteEditModal
          isOpen={!!quoteToEdit}
          onClose={() => setQuoteToEdit(null)}
          onSave={handleSaveQuoteChanges}
          quoteToEdit={quoteToEdit}
          products={products}
          services={mockServices}
        />
      )}
    </div>
  );
};

export default QuotesPage;
