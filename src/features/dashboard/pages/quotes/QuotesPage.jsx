import React, { useState, useEffect, useMemo } from 'react';
import { FaFileExcel, FaSearch } from 'react-icons/fa';
import QuotesTable from './components/QuotesTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import QuoteDetailModal from './components/QuoteDetailModal';
import QuoteEditModal from './components/QuoteEditModal';
import NewQuoteModal from './components/NewQuoteModal';
import CancelQuoteModal from './components/CancelQuoteModal';
import { clientsApi } from '../clients/services/clientsApi';
import { productsService } from '../products/services/productsService';
import { quotesService, servicesCatalogApi } from './services/quotesService';
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
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [quoteToCancel, setQuoteToCancel] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [quotesRes, clientsRes, productsRes, servicesRes] = await Promise.all([
          quotesService.getAllQuotes(),
          clientsApi.getAllClients(),
          productsService.getAllProducts(),
          servicesCatalogApi.getAllServices(),
        ]);
        const quotesData = Array.isArray(quotesRes) ? quotesRes : quotesRes?.data ?? [];
        setQuotes(quotesData);
        setClients(Array.isArray(clientsRes) ? clientsRes : clientsRes?.data ?? []);
        setProducts(Array.isArray(productsRes) ? productsRes : productsRes?.data ?? []);
        setServices(Array.isArray(servicesRes) ? servicesRes : servicesRes?.data ?? []);
      } catch (e) {
        console.error('Error cargando datos de cotizaciones', e);
        showError('No se pudieron cargar las cotizaciones');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mockServices = [
    { nombre: 'Instalación', descripcion: 'Servicio de instalación básica', precio: 50000 },
    { nombre: 'Mantenimiento', descripcion: 'Servicio de mantenimiento general', precio: 70000 },
    { nombre: 'Revisión', descripcion: 'Revisión técnica del equipo', precio: 30000 },
  ];
  const normalize = (text) => {
    const s = (text ?? '').toString();
    // Algunos navegadores antiguos podrían no soportar String.prototype.normalize
    if (typeof s.normalize === 'function') {
      return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
    return s.toLowerCase();
  };

  const filteredQuotes = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);
    return quotes.filter((quote) => {
      const clienteNombre = quote.cliente
        || (quote.clienteData ? `${quote.clienteData.nombre} ${quote.clienteData.apellido}` : '')
        || quote.cliente_nombre
        || '';
      const nombreCoti = quote.nombre_cotizacion || quote.ordenServicio || '';
      const estado = quote.estado || '';
      return (
        normalize(clienteNombre).includes(normalizedSearch) ||
        normalize(nombreCoti).includes(normalizedSearch) ||
        normalize(estado).includes(normalizedSearch)
      );
    });
  }, [quotes, searchTerm]);

  const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuotes, currentPage]);

  const handleSaveQuoteChanges = async (updatedQuote) => {
    try {
      if (updatedQuote?.id_cotizacion) {
        setQuotes((prev) =>
          prev.map((q) => {
            const qId = q.id_cotizacion ?? q.id;
            const updatedId = updatedQuote.id_cotizacion ?? updatedQuote.id;
            return qId === updatedId ? { ...q, ...updatedQuote } : q;
          })
        );
      } else {
        // Compatibilidad con mocks
        setQuotes((prev) =>
          prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q))
        );
      }
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
        const clienteNombre = quote.cliente
          ? `${quote.cliente.nombre} ${quote.cliente.apellido}`
          : quote.clienteData
            ? `${quote.clienteData.nombre} ${quote.clienteData.apellido}`
            : 'Cliente no especificado';

        const base = {
          'ID Cotización': quote.id_cotizacion || quote.id,
          'Nombre Cotización': quote.nombre_cotizacion || quote.ordenServicio || '',
          'Cliente': clienteNombre,
          'Documento': quote.cliente?.documento || quote.clienteData?.documento || '',
          'Correo electrónico': quote.cliente?.correo || quote.clienteData?.correo || '',
          'Estado': quote.estado || '',
          'Fecha Creación': quote.fecha_creacion ? new Date(quote.fecha_creacion).toLocaleDateString('es-ES') : '',
          'Fecha de Vencimiento': quote.fecha_vencimiento ? new Date(quote.fecha_vencimiento).toLocaleDateString('es-ES') : '',
          'Subtotal Productos': quote.subtotal_productos || 0,
          'Subtotal Servicios': quote.subtotal_servicios || 0,
          'IVA': quote.monto_iva || 0,
          'Total Cotización': quote.monto_cotizacion || 0,
          'Observaciones': quote.observaciones || '',
          'Motivo de Rechazo': (quote.estado === 'Rechazada' || quote.estado === 'Anulada') ? (quote.motivo_anulacion || 'Sin motivo especificado') : '',
        };

        // Si hay detalles de productos/servicios, agregarlos
        if (quote.detalles && Array.isArray(quote.detalles)) {
          quote.detalles.forEach((detalle) => {
            if (detalle.producto) {
              exportData.push({
                ...base,
                Tipo: 'Producto',
                Nombre: detalle.producto.nombre || '',
                Modelo: detalle.producto.modelo || '',
                Cantidad: detalle.cantidad || 0,
                'Precio Unitario': detalle.precio_unitario || 0,
                Subtotal: detalle.subtotal || 0,
              });
            } else if (detalle.servicio) {
              exportData.push({
                ...base,
                Tipo: 'Servicio',
                Nombre: detalle.servicio.nombre || '',
                Descripción: detalle.servicio.descripcion || '',
                Cantidad: detalle.cantidad || 0,
                'Precio Unitario': detalle.precio_unitario || 0,
                Subtotal: detalle.subtotal || 0,
              });
            }
          });
        } else {
          // Si no hay detalles, agregar la fila base
          exportData.push(base);
        }
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
    doc.text(`Cotización - ${cotizacion.nombre_cotizacion || cotizacion.ordenServicio}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Fecha de Vencimiento: ${cotizacion.fecha_vencimiento ? new Date(cotizacion.fecha_vencimiento).toLocaleDateString('es-ES') : ''}`, 14, 30);

    const clienteNombre = cotizacion.cliente
      ? `${cotizacion.cliente.nombre} ${cotizacion.cliente.apellido}`
      : cotizacion.clienteData
        ? `${cotizacion.clienteData.nombre} ${cotizacion.clienteData.apellido}`
        : 'Cliente no especificado';

    doc.text(`Cliente: ${clienteNombre}`, 14, 38);
    doc.text(`Documento: ${cotizacion.cliente?.documento || cotizacion.clienteData?.documento || ''}`, 14, 46);
    doc.text(`Email: ${cotizacion.cliente?.correo || cotizacion.clienteData?.correo || ''}`, 14, 54);
    doc.text(`Estado: ${cotizacion.estado}`, 14, 62);

    const detalle = [];

    // Usar datos reales de la cotización
    if (cotizacion.detalles && Array.isArray(cotizacion.detalles)) {
      // Agregar productos
      const productos = cotizacion.detalles.filter(d => d.producto);
      if (productos.length > 0) {
        detalle.push([
          { content: 'Productos', colSpan: 6, styles: { halign: 'center', fillColor: [220, 220, 220] } }
        ]);
        detalle.push(['Nombre', 'Modelo', 'Cantidad', 'Precio Unitario', '', 'Total']);
        productos.forEach((detalleItem) => {
          detalle.push([
            detalleItem.producto.nombre || '',
            detalleItem.producto.modelo || '',
            detalleItem.cantidad || 0,
            `$${(detalleItem.precio_unitario || 0).toLocaleString()}`,
            '',
            `$${(detalleItem.subtotal || 0).toLocaleString()}`
          ]);
        });
      }

      // Agregar servicios
      const servicios = cotizacion.detalles.filter(d => d.servicio);
      if (servicios.length > 0) {
        detalle.push([
          { content: 'Servicios', colSpan: 6, styles: { halign: 'center', fillColor: [220, 220, 220] } }
        ]);
        detalle.push(['Nombre', 'Descripción', 'Cantidad', 'Precio Unitario', '', 'Total']);
        servicios.forEach((detalleItem) => {
          detalle.push([
            detalleItem.servicio.nombre || '',
            detalleItem.servicio.descripcion || '',
            detalleItem.cantidad || 0,
            `$${(detalleItem.precio_unitario || 0).toLocaleString()}`,
            '',
            `$${(detalleItem.subtotal || 0).toLocaleString()}`
          ]);
        });
      }
    } else if (cotizacion.detalleOrden) {
      // Compatibilidad con datos antiguos
      if (cotizacion.detalleOrden.productos && cotizacion.detalleOrden.productos.length > 0) {
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

      if (cotizacion.detalleOrden.servicios && cotizacion.detalleOrden.servicios.length > 0) {
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
    doc.text(`Subtotal Productos: $${(cotizacion.subtotal_productos || 0).toLocaleString()}`, 14, finalY + 10);
    doc.text(`Subtotal Servicios: $${(cotizacion.subtotal_servicios || 0).toLocaleString()}`, 14, finalY + 18);
    doc.text(`IVA (19%): $${(cotizacion.monto_iva || 0).toLocaleString()}`, 14, finalY + 26);

    doc.setFontSize(14);
    doc.text(`Total: $${(cotizacion.monto_cotizacion || 0).toLocaleString()}`, 14, finalY + 36);

    doc.save(`Cotizacion_${cotizacion.nombre_cotizacion || cotizacion.ordenServicio || 'SinNombre'}.pdf`);
  };

  const handleCancelQuote = (quote) => {
    if (quote.estado === 'Rechazada') {
      showInfo('Esta cotización ya se encuentra anulada');
      return;
    }
    setQuoteToCancel(quote);
  };

  const handleConfirmCancel = async (motivo) => {
    if (!quoteToCancel) return;
    
    try {
      const quoteId = quoteToCancel.id_cotizacion ?? quoteToCancel.id;
      if (!quoteId) {
        showError('No se pudo identificar la cotización');
        return;
      }

      // Enviar estado 'Rechazada' al backend con motivo_anulacion
      const updated = await quotesService.changeQuoteState(quoteId, 'Rechazada', motivo);
      
      setQuotes((prevQuotes) => prevQuotes.map((q) => {
        const qId = q.id_cotizacion ?? q.id;
        return qId === quoteId ? { ...q, ...updated, estado: 'Rechazada', motivo_anulacion: motivo } : q;
      }));
      
      showSuccess('Cotización rechazada exitosamente');
      setQuoteToCancel(null);
    } catch (error) {
      console.error('Error al anular cotización:', error);
      const message = error?.response?.data?.message || error?.message || 'Ocurrió un error al anular la cotización';
      showError(message);
    }
  };

  const handleCreateQuote = async (payload) => {
    try {
      const created = await quotesService.createQuote(payload);
      showSuccess('Cotización creada exitosamente');
      setIsCreateOpen(false);
      // Opcional: insertar arriba si el listado ya es real. Con mocks, lo dejamos fuera.
      // setQuotes(prev => [created, ...prev]);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'Ocurrió un error al crear la cotización';
      showError(message);
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
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-colors"
          >
            Crear cotización
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nombre de la Cotización</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Monto de la Cotización (total)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fecha de vencimiento</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
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
          services={services}
          clients={clients}
        />
      )}

      {isCreateOpen && (
        <NewQuoteModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleCreateQuote}
          clients={clients}
          products={products}
          services={services}
        />
      )}

      {quoteToCancel && (
        <CancelQuoteModal
          isOpen={!!quoteToCancel}
          onClose={() => setQuoteToCancel(null)}
          onConfirm={handleConfirmCancel}
          quote={quoteToCancel}
        />
      )}
    </div>
  );
};

export default QuotesPage;
