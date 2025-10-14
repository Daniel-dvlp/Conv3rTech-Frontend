import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import SalesTable from './components/SalesTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import NewProductSaleModal from './components/NewProductSaleModal';
import ProductSaleDetailModal from './components/ProductSaleDetailModal';
import { salesService, clientsService } from './services/salesService';
import { productsService } from '../products/services/productsService';
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
  const [products, setProducts] = useState([]);

  // Cargar ventas, clientes y productos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar datos en paralelo
        const [salesData, clientsData, productsData] = await Promise.all([
          salesService.getAllSales(),
          clientsService.getAllClients(),
          productsService.getAllProducts()
        ]);

        setSales(Array.isArray(salesData) ? salesData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);

      } catch (err) {
        console.error('Error al cargar datos:', err);
        showError('Error al cargar ventas, clientes o productos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const normalize = (text) =>
    text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const filteredSales = useMemo(() => {
    const normalizedSearch = normalize(searchTerm);

    return sales.filter((sale) =>
      normalize(sale.numero_venta).includes(normalizedSearch) ||
      normalize(`${sale.cliente?.nombre} ${sale.cliente?.apellido}`).includes(normalizedSearch) ||
      normalize(new Date(sale.fecha_venta).toLocaleString()).includes(normalizedSearch) ||
      normalize(String(sale.monto_venta)).includes(normalizedSearch) ||
      normalize(sale.metodo_pago).includes(normalizedSearch) ||
      normalize(sale.estado).includes(normalizedSearch)
    );
  }, [sales, searchTerm]);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSales, currentPage]);

  const handleAddSale = async (newSale) => {
    try {
      const created = await salesService.createSale(newSale);
      console.log('Venta creada:', created);
      setSales((prev) => [created, ...prev]);
      setShowNewModal(false);
      showSuccess('Venta registrada exitosamente');
    } catch (error) {
      console.error('Error al crear venta:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'No se pudo crear la venta. Verifique que todos los campos y datos sean correctos.';
      showError(errorMessage);
    }
  };

  const handleExport = () => {
    // Estructura final para el Excel: cada fila = un producto de una venta
    const exportData = [];

    filteredSales.forEach((venta) => {
      venta.detalles?.forEach((detalle, index) => {
        exportData.push({
          'ID Venta': venta.id_venta,
          'Venta N°': venta.numero_venta,
          'Fecha y Hora': new Date(venta.fecha_venta).toLocaleString(),

          'Cliente': `${venta.cliente?.nombre} ${venta.cliente?.apellido}`,
          'Documento Cliente': venta.cliente?.documento || '',
          'Email Cliente': venta.cliente?.email || '',
          'Celular Cliente': venta.cliente?.celular || '',

          'Producto': detalle.producto?.nombre,
          'Modelo': detalle.producto?.modelo || '',
          'Unidad': detalle.producto?.unidad_medida || '',
          'Cantidad': detalle.cantidad,
          'Precio Unitario': detalle.precio_unitario,
          'Subtotal Producto': detalle.subtotal_producto,

          'Método de Pago': venta.metodo_pago,
          'Estado': venta.estado,

          'Subtotal Venta': venta.subtotal_venta,
          'IVA': venta.monto_iva,
          'Monto Total': venta.monto_venta,
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
    doc.text(`Factura de Venta - ${venta.numero_venta}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(venta.fecha_venta).toLocaleString()}`, 14, 30);
    doc.text(`Cliente: ${venta.cliente?.nombre} ${venta.cliente?.apellido}`, 14, 38);
    doc.text(`Documento: ${venta.cliente?.documento || ''}`, 14, 46);
    doc.text(`Email: ${venta.cliente?.email || ''}`, 14, 54);
    doc.text(`Celular: ${venta.cliente?.celular || ''}`, 14, 62);
    doc.text(`Método de Pago: ${venta.metodo_pago}`, 14, 70);
    doc.text(`Estado: ${venta.estado}`, 14, 78);

    autoTable(doc, {
      startY: 88,
      head: [['Producto', 'Modelo', 'Cantidad', 'Unidad', 'Precio Unitario', 'Subtotal']],
      body: venta.detalles?.map(detalle => [
        detalle.producto?.nombre,
        detalle.producto?.modelo || '',
        detalle.cantidad,
        detalle.producto?.unidad_medida || '',
        `$${detalle.precio_unitario.toLocaleString()}`,
        `$${detalle.subtotal_producto.toLocaleString()}`
      ]) || [],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [100, 100, 100], textColor: 255, halign: 'center' }
    });

    const finalY = doc.lastAutoTable?.finalY || 98;

    doc.setFontSize(12);
    doc.text(`Subtotal: $${venta.subtotal_venta.toLocaleString()}`, 14, finalY + 10);
    doc.text(`IVA (19%): $${venta.monto_iva.toLocaleString()}`, 14, finalY + 18);
    doc.setFontSize(14);
    doc.text(`Total: $${venta.monto_venta.toLocaleString()}`, 14, finalY + 28);

    doc.save(`Factura_${venta.numero_venta}.pdf`);
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

      const updated = await salesService.changeSaleState(venta.id_venta, 'Anulada');
      setSales((prev) => prev.map((v) => (v.id_venta === venta.id_venta ? updated : v)));

      showSuccess('Venta anulada exitosamente');
    } catch (error) {
      console.error('Error al anular venta:', error);
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
        clients={clients}
        products={products}
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
