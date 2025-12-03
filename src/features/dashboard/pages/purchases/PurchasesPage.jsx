// src/features/dashboard/pages/purchases/PurchasesPage.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaSearch, FaFileExcel } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import PurchasesTable from './components/PurchasesTable';
import SkeletonRow from './components/SkeletonRow';
import Pagination from '../../../../shared/components/Pagination';
import PurchaseDetailModal from './components/PurchasesDetailModal';
import NewPurchasesModal from './components/NewPurchasesModal';
import * as XLSX from 'xlsx';
import { usePurchases } from './hooks/usePurchases';

const ITEMS_POR_PAGINA = 5;

const PaginaCompras = () => {
  // Usar el hook personalizado
  const { purchases: compras, loading: cargando, suppliers: proveedores, products: productos, createPurchase, changePurchaseStatus } = usePurchases();
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [esNuevaCompraAbierto, setEsNuevaCompraAbierto] = useState(false);

  const normalizar = (texto) =>
    String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const comprasFiltradas = useMemo(() => {
    const busquedaNormalizada = normalizar(terminoBusqueda);

    if (!busquedaNormalizada) return compras;

    return compras.filter((compra) => {
      const camposBusqueda = [
        compra.numeroRecibo,
        compra.proveedor,
        compra.creadoPor,
        compra.estado,
        compra.fechaRegistro,
        compra.observaciones,
        // Incluir motivoAnulacion en la búsqueda si existe
        compra.motivoAnulacion, //
        String(compra.subtotal),
        String(compra.iva),
        String(compra.total),
        ...compra.productos.map(p => normalizar(p.nombre || '')),
        ...compra.productos.map(p => normalizar(p.modelo || '')),
        ...compra.productos.map(p => normalizar(p.unidadDeMedida || '')),
        ...compra.productos.map(p => normalizar(p.codigoDeBarra || '')),
      ];

      return camposBusqueda.some(campo =>
        normalizar(campo).includes(busquedaNormalizada)
      );
    });
  }, [compras, terminoBusqueda]);

  const totalPaginas = useMemo(() => {
    return Math.ceil(comprasFiltradas.length / ITEMS_POR_PAGINA);
  }, [comprasFiltradas]);

  const itemsActuales = useMemo(() => {
    const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return comprasFiltradas.slice(indiceInicio, indiceInicio + ITEMS_POR_PAGINA);
  }, [comprasFiltradas, paginaActual]);

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas || 1);
    }
  }, [totalPaginas, paginaActual]);

  const manejarCambioPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const manejarGuardarCompra = async (nuevaCompraData) => {
    try {
      console.log('📝 Creando compra con datos:', nuevaCompraData);
      await createPurchase(nuevaCompraData);
      
      setEsNuevaCompraAbierto(false);
    } catch (error) {
      console.error('❌ Error al crear compra:', error);
      
      // Manejo de errores simplificado como en ClientsPage
      let mensajeError = 'Error al crear la compra';
      
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      toast.error(mensajeError);
      
      // Re-lanzar el error para que el modal lo maneje
      throw error;
    }
  };

  // MODIFICACIÓN CLAVE: Ahora manejarAnularCompra acepta un 'motivo'
  const manejarAnularCompra = async (idCompra, motivo) => {
    try {
      // El backend cambia el estado a 'Anulada'
      await changePurchaseStatus(idCompra, 'Anulada', motivo);
    } catch (error) {
      console.error('Error al anular compra:', error);
    }
  };

  const manejarExportar = () => {
    const datosAExportar = [];

    // Encabezados para la primera fila de Excel
    const headers = [
      'ID Compra',
      'Número de Recibo',
      'Proveedor',
      'Fecha de Registro',
      'Fecha de Creación',
      'Creado Por',
      'Estado',
      'Observaciones',
      'Motivo de Anulación', // Nuevo encabezado
      'Subtotal',
      'IVA (19%)',
      'Total Compra',
      'Producto (Nombre)',
      'Producto (Modelo)',
      'Producto (Unidad)',
      'Producto (Cantidad)',
      'Producto (Precio Unitario Compra)',
      'Producto (Subtotal)',
      'Producto (Código de Barras)',
    ];
    datosAExportar.push(headers);

    comprasFiltradas.forEach(compra => {
      if (compra.productos && compra.productos.length > 0) {
        compra.productos.forEach((item, idx) => {
          const row = [
            // Campos de la compra principal, solo en la primera fila del grupo de productos
            idx === 0 ? compra.id : '',
            idx === 0 ? compra.numeroRecibo : '',
            idx === 0 ? compra.proveedor : '',
            idx === 0 ? compra.fechaRegistro : '',
            idx === 0 ? new Date(compra.fechaCreacion).toLocaleString('es-CO') : '',
            idx === 0 ? compra.creadoPor : '',
            idx === 0 ? compra.estado : '',
            idx === 0 ? compra.observaciones : '',
            idx === 0 ? (compra.estado === 'Anulada' ? compra.motivoAnulacion : '') : '', //
            idx === 0 ? compra.subtotal : '',
            idx === 0 ? compra.iva : '',
            idx === 0 ? compra.total : '',
            // Campos del producto
            item.nombre || 'Desconocido',
            item.modelo || 'N/A',
            item.unidadDeMedida || 'N/A',
            item.cantidad,
            item.precioUnitarioCompra,
            item.cantidad * (item.precioUnitarioCompra || 0), // Asegurar el cálculo si precioUnitarioCompra es undefined
            item.codigoDeBarra || 'N/A',
          ];
          datosAExportar.push(row);
        });
      } else {
        const row = [
          compra.id,
          compra.numeroRecibo,
          compra.proveedor,
          compra.fechaRegistro,
          new Date(compra.fechaCreacion).toLocaleString('es-CO'),
          compra.creadoPor,
          compra.estado,
          compra.observaciones,
          (compra.estado === 'Anulada' ? compra.motivoAnulacion : ''), //
          compra.subtotal,
          compra.iva,
          compra.total,
          '', '', '', '', '', '', ''
        ];
        datosAExportar.push(row);
      }
      // === SE REINCORPORA LA FILA VACÍA PARA SEPARACIÓN ===
      datosAExportar.push([]);
      // ====================================================
    });

    const worksheet = XLSX.utils.aoa_to_sheet(datosAExportar);

    // === APLICAR ESTILOS Y FORMATO PARA EL EXCEL ===
    // Estilo para los bordes de todas las celdas
    const thinBorder = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    };

    // Estilo para encabezados (fila 0): Azul clarito, negrita, tamaño de fuente más grande, bordes
    const headerCellStyle = {
      fill: { fgColor: { rgb: "ADD8E6" } }, // Azul clarito (LightBlue)
      font: { bold: true, sz: 14 }, // Negrita, tamaño 14
      border: thinBorder,
    };

    // Estilo para celdas de datos: tamaño de fuente normal, bordes
    const dataCellStyle = {
      font: { sz: 11 }, // Tamaño de fuente 11
      border: thinBorder,
    };

    // Estilo específico para la columna 'ID Compra' (columna 0): Verde, bordes
    const idColumnStyle = {
      fill: { fgColor: { rgb: "90EE90" } }, // Verde claro (LightGreen)
      border: thinBorder,
      font: { sz: 11 } // Asegurar el mismo tamaño de fuente
    };

    // Iterar sobre todas las celdas para aplicar estilos
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) { // Filas
      for (let C = range.s.c; C <= range.e.c; ++C) { // Columnas
        const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cell_address]) {
          worksheet[cell_address] = { v: '' }; // Asegurarse de que la celda exista para aplicar estilos
        }

        if (R === 0) { // Es una celda de encabezado (primera fila)
          worksheet[cell_address].s = headerCellStyle;
        } else { // Es una celda de datos
          // Si es una fila de separación (vacía), aplicar solo bordes para mantener la estética
          if (datosAExportar[R].every(cell => cell === '')) { // Si toda la fila está vacía
            worksheet[cell_address].s = { border: thinBorder }; // Solo bordes a la fila vacía
          } else if (C === 0 && datosAExportar[R][C] !== '') { // Es la columna ID Compra y tiene un valor
            worksheet[cell_address].s = { ...dataCellStyle, ...idColumnStyle };
          } else {
            worksheet[cell_address].s = dataCellStyle;
          }
        }
      }
    }
    // === FIN DE ESTILOS ===

    // Ajustar anchos de columna automáticamente (esto ya estaba y funciona bien)
    const wscols = headers.map((header, index) => {
      let maxWidth = header.length;
      // Considerar también el contenido de las filas de datos para el ancho
      for (let i = 1; i < datosAExportar.length; i++) {
        if (datosAExportar[i][index] !== undefined && datosAExportar[i][index] !== null) {
          const cellLength = String(datosAExportar[i][index]).length;
          if (cellLength > maxWidth) {
            maxWidth = cellLength;
          }
        }
      }
      return { wch: maxWidth + 2 }; // Añadir un poco de padding
    });
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ReporteCompras');

    // Generar nombre de archivo con timestamp
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    const fileName = `ReporteCompras (${timestamp}).xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Compras</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar"
              value={terminoBusqueda}
              onChange={(e) => {
                setTerminoBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={manejarExportar}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            aria-label="Exportar a Excel"
          >
            <FaFileExcel />
            Exportar
          </button>
          <button
            onClick={() => setEsNuevaCompraAbierto(true)}
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            aria-label="Crear nueva compra"
          >
            <FaPlus />
            Registrar compra
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* La tabla de esqueleto también refleja los encabezados visibles */}
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número de Recibo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(ITEMS_POR_PAGINA)].map((_, idx) => (
                <SkeletonRow key={idx} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <PurchasesTable
            compras={itemsActuales}
            onView={(compra) => setCompraSeleccionada(compra)}
            onAnnul={manejarAnularCompra} // Aquí se pasa la función actualizada
          />
          {totalPaginas > 1 && (
            <Pagination
              currentPage={paginaActual}
              totalPages={totalPaginas}
              onPageChange={manejarCambioPagina}
            />
          )}
        </>
      )}

      <PurchaseDetailModal
        compra={compraSeleccionada}
        onClose={() => setCompraSeleccionada(null)}
      />

      <NewPurchasesModal
        isOpen={esNuevaCompraAbierto}
        onClose={() => setEsNuevaCompraAbierto(false)}
        onSave={manejarGuardarCompra}
        proveedores={proveedores}
        productos={productos}
      />
    </div>
  );
};

export default PaginaCompras;