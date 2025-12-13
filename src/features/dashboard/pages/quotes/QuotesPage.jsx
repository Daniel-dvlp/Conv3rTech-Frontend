import React, { useState, useEffect, useMemo } from 'react';
import { FaFileExcel, FaSearch, FaPlus } from 'react-icons/fa';
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
import autoTable from 'jspdf-autotable';
import {
  createBasePDF,
  addHeader,
  addFooter,
  addGenericTable
} from '../../../../shared/utils/pdf/pdfTemplate';
import { showSuccess, showError, showInfo, confirmDelete } from '../../../../shared/utils/alerts';
import { usePermissions } from '../../../../shared/hooks/usePermissions';

const ITEMS_PER_PAGE = 5;

const QuotesPage = () => {
  const { checkManage } = usePermissions();
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

  const loadData = async () => {
    try {
      const [quotesRes, clientsRes, productsRes, servicesRes] = await Promise.all([
        quotesService.getAllQuotes(),
        clientsApi.getAllClients(),
        productsService.getAllProducts(),
        servicesCatalogApi.getAllServices(),
      ]);
      const quotesData = Array.isArray(quotesRes) ? quotesRes : quotesRes?.data ?? [];
      setQuotes(quotesData);
      
      const allClients = Array.isArray(clientsRes) ? clientsRes : clientsRes?.data ?? [];
      setClients(allClients.filter(c => c.estado_cliente === true));
      
      // Filtrar productos activos
      const allProducts = Array.isArray(productsRes) ? productsRes : productsRes?.data ?? [];
      setProducts(allProducts.filter(p => p.estado === true));

      // Filtrar servicios activos
      const allServices = Array.isArray(servicesRes) ? servicesRes : servicesRes?.data ?? [];
      setServices(allServices.filter(s => s.estado === 'activo'));
    } catch (e) {
      console.error('Error cargando datos de cotizaciones', e);
      showError('No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      if (updatedQuote?._deleted) {
        setQuotes((prev) => prev.filter((q) => {
          const qId = q.id_cotizacion ?? q.id;
          const updatedId = updatedQuote.id_cotizacion ?? updatedQuote.id;
          return qId !== updatedId;
        }));
        showSuccess('Cotización procesada y eliminada de la lista');
        setQuoteToEdit(null);
        return;
      }

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
    const formatNumber = (num) => {
      if (num === null || num === undefined) return '0';
      const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
      return isNaN(parsedNum) ? '0' : new Intl.NumberFormat('es-ES').format(parsedNum);
    };

    const doc = createBasePDF();

    // 1️⃣ ENCABEZADO GENERAL
    let y = addHeader(doc, `Cotización: ${cotizacion.nombre_cotizacion || cotizacion.ordenServicio}`);

    // 2️⃣ INFORMACIÓN GENERAL
    const clienteNombre = cotizacion.cliente
      ? `${cotizacion.cliente.nombre} ${cotizacion.cliente.apellido}`
      : cotizacion.clienteData
        ? `${cotizacion.clienteData.nombre} ${cotizacion.clienteData.apellido}`
        : 'Cliente no especificado';

    // Título "Información general"
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81); // gray-700
    doc.text('Información general', 14, y);
    y += 10;

    // Configuración de columnas
    const LEFT_COLUMN_X = 14;
    const RIGHT_COLUMN_X = 110;
    const LINE_HEIGHT = 8;
    let currentY = y;

    // Información del cliente (columna izquierda)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${clienteNombre}`, LEFT_COLUMN_X, currentY);
    currentY += LINE_HEIGHT;
    doc.text(`Documento: ${cotizacion.cliente?.documento || cotizacion.clienteData?.documento || ''}`, LEFT_COLUMN_X, currentY);
    currentY += LINE_HEIGHT;
    doc.text(`Correo electrónico: ${cotizacion.cliente?.correo || cotizacion.clienteData?.correo || ''}`, LEFT_COLUMN_X, currentY);

    // Información de la cotización (columna derecha, misma altura)
    currentY = y; // Resetear para alinear con la información del cliente
    doc.text(`Fecha de Vencimiento: ${cotizacion.fecha_vencimiento ? new Date(cotizacion.fecha_vencimiento).toLocaleDateString('es-ES') : ''}`, RIGHT_COLUMN_X, currentY);
    currentY += LINE_HEIGHT;
    doc.text(`Estado: ${cotizacion.estado || ''}`, RIGHT_COLUMN_X, currentY);

    // Actualizar y para la siguiente sección (usar la posición más baja)
    y = Math.max(y + (LINE_HEIGHT * 3), currentY + LINE_HEIGHT) + 15; // Espacio adicional después de la información

    // 3️⃣ TABLAS SEPARADAS (Productos y Servicios)
    // Color gris claro para secciones (gray-50: RGB(249, 250, 251))
    const SECTION_BG = [249, 250, 251];
    const SPACING_BETWEEN_TABLES = 10; // Espacio entre tablas

    // Usar datos reales de la cotización
    if (cotizacion.detalles && Array.isArray(cotizacion.detalles)) {
      // TABLA DE PRODUCTOS
      const productos = cotizacion.detalles.filter(d => d.producto);
      if (productos.length > 0) {
        const detalleProductos = [];
        detalleProductos.push([
          { content: 'Productos', colSpan: 5, styles: { halign: 'center', fillColor: SECTION_BG, fontStyle: 'bold' } }
        ]);
        detalleProductos.push(['Nombre', 'Modelo', 'Cantidad', 'Precio Unitario', 'Total']);
        productos.forEach((detalleItem) => {
          detalleProductos.push([
            detalleItem.producto.nombre || '',
            detalleItem.producto.modelo || '',
            detalleItem.cantidad || 0,
            `$${formatNumber(detalleItem.precio_unitario || 0)}`,
            `$${formatNumber(detalleItem.subtotal || 0)}`
          ]);
        });
        y = addGenericTable(doc, detalleProductos, y);
        y += SPACING_BETWEEN_TABLES; // Agregar espacio después de productos
      }
      
      // TABLA DE SERVICIOS
      const servicios = cotizacion.detalles.filter(d => d.servicio);
      if (servicios.length > 0) {
        const detalleServicios = [];
        detalleServicios.push([
          { content: 'Servicios', colSpan: 5, styles: { halign: 'center', fillColor: SECTION_BG, fontStyle: 'bold' } }
        ]);
        detalleServicios.push(['Nombre', 'Descripción', 'Cantidad', 'Precio Unitario', 'Total']);
        servicios.forEach((detalleItem) => {
          detalleServicios.push([
            detalleItem.servicio.nombre || '',
            detalleItem.servicio.descripcion || '',
            detalleItem.cantidad || 0,
            `$${formatNumber(detalleItem.precio_unitario || 0)}`,
            `$${formatNumber(detalleItem.subtotal || 0)}`
          ]);
        });
        y = addGenericTable(doc, detalleServicios, y);
      }
    } else if (cotizacion.detalleOrden) {
      // Compatibilidad con datos antiguos
      // TABLA DE PRODUCTOS
      if (cotizacion.detalleOrden.productos && cotizacion.detalleOrden.productos.length > 0) {
        const detalleProductos = [];
        detalleProductos.push([
          { content: 'Productos', colSpan: 5, styles: { halign: 'center', fillColor: SECTION_BG, fontStyle: 'bold' } }
        ]);
        detalleProductos.push(['Nombre', 'Descripción', 'Cantidad', 'Precio Unitario', 'Total']);
        cotizacion.detalleOrden.productos.forEach((p) => {
          detalleProductos.push([
            p.nombre,
            p.descripcion,
            p.cantidad,
            `$${formatNumber(p.precioUnitario)}`,
            `$${formatNumber(p.total)}`
          ]);
        });
        y = addGenericTable(doc, detalleProductos, y);
        y += SPACING_BETWEEN_TABLES; // Agregar espacio después de productos
      }

      // TABLA DE SERVICIOS
      if (cotizacion.detalleOrden.servicios && cotizacion.detalleOrden.servicios.length > 0) {
        const detalleServicios = [];
        detalleServicios.push([
          { content: 'Servicios', colSpan: 5, styles: { halign: 'center', fillColor: SECTION_BG, fontStyle: 'bold' } }
        ]);
        detalleServicios.push(['Nombre', 'Descripción', 'Cantidad', 'Precio Unitario', 'Total']);
        cotizacion.detalleOrden.servicios.forEach((s) => {
          detalleServicios.push([
            s.servicio,
            s.descripcion,
            s.cantidad,
            `$${formatNumber(s.precioUnitario)}`,
            `$${formatNumber(s.total)}`
          ]);
        });
        y = addGenericTable(doc, detalleServicios, y);
      }
    }

    const finalY = y;

    // 4️⃣ TOTALES (estilo footer de tabla)
    const totalsY = finalY + 8;
    
    // Fondo gris claro para la sección de totales
    doc.setFillColor(249, 250, 251); // gray-50
    doc.rect(14, totalsY - 4, 182, 50, 'F');
    
    // Borde superior
    doc.setDrawColor(229, 231, 235); // gray-200
    doc.setLineWidth(0.5);
    doc.line(14, totalsY - 4, 196, totalsY - 4);

    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81); // gray-700
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Subtotal Productos:`, 150, totalsY + 5, { align: 'right' });
    doc.text(`$${formatNumber(cotizacion.subtotal_productos || 0)}`, 190, totalsY + 5, { align: 'right' });

    doc.text(`Subtotal Servicios:`, 150, totalsY + 12, { align: 'right' });
    doc.text(`$${formatNumber(cotizacion.subtotal_servicios || 0)}`, 190, totalsY + 12, { align: 'right' });

    doc.text(`Subtotal de cotización:`, 150, totalsY + 19, { align: 'right' });
    doc.text(`$${formatNumber(Number(cotizacion.subtotal_productos || 0) + Number(cotizacion.subtotal_servicios || 0))}`, 190, totalsY + 19, { align: 'right' });

    doc.text(`IVA (19%):`, 150, totalsY + 26, { align: 'right' });
    doc.text(`$${formatNumber(cotizacion.monto_iva || 0)}`, 190, totalsY + 26, { align: 'right' });

    // Total final en dorado (conv3r-gold)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 179, 0); // conv3r-gold
    doc.text(`Total:`, 150, totalsY + 35, { align: 'right' });
    doc.text(`$${formatNumber(cotizacion.monto_cotizacion || 0)}`, 190, totalsY + 35, { align: 'right' });

    // 5️⃣ PIE DE PÁGINA GENÉRICO
    addFooter(doc);

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
    const created = await quotesService.createQuote(payload);
    showSuccess('Cotización creada exitosamente');
    setIsCreateOpen(false);
    loadData();
    // Opcional: insertar arriba si el listado ya es real. Con mocks, lo dejamos fuera.
    // setQuotes(prev => [created, ...prev]);
    // Si hay error, se lanza y será capturado en el modal
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
            <FaPlus />
            Crear cotización
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Nombre cotización</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Monto Total</th>
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
