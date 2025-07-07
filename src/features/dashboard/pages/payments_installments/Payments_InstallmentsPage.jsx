import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaFileExcel, FaSearch } from 'react-icons/fa';
import PagosTable from './components/PagosTable';
import SkeletonRow from './components/SkeletonRow';
import { mockPagos } from './data/Pagos_data';
import Pagination from '../../../../shared/components/Pagination';
import * as XLSX from 'xlsx';
import CreatePaymentsModal from './components/CreatePaymentsModal';

const mockPagosIntegrado = [
    {
      cliente: { id: 1, nombre: 'Juan', apellido: 'Valdez', documento: '123456' },
      contratos: [
        {
          numero: '00001',
          pagos: [
            {
              id: 1,
              fecha: '02/03/2025',
              montoTotal: 5000000,
              montoAbonado: 1000000,
              montoRestante: 4000000,
              metodoPago: 'Tarjeta',
              estado: 'Registrado',
              concepto: 'Mantenimiento Cámaras'
            }
          ]
        },
        {
          numero: 'VD-00001',
          pagos: [
            {
              id: 2,
              fecha: '05/03/2025',
              montoTotal: 7000000,
              montoAbonado: 2000000,
              montoRestante: 5000000,
              metodoPago: 'Transferencia',
              estado: 'Registrado',
              concepto: 'Revisión general'
            }
          ]
        }
      ]
    },
    {
      cliente: { id: 2, nombre: 'Laura', apellido: 'Mejía', documento: '654321' },
      contratos: [
        {
          numero: '00002',
          pagos: [
            {
              id: 3,
              fecha: '10/03/2025',
              montoTotal: 3000000,
              montoAbonado: 3000000,
              montoRestante: 0,
              metodoPago: 'Transferencia',
              estado: 'Registrado',
              concepto: 'Instalación DVR'
            }
          ]
        }
      ]
    }
  ];

const ITEMS_PER_PAGE = 5;

const Payments_InstallmentsPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mockCargado, setMockCargado] = useState(false);

  

 const handleAddPago = (nuevosPagos) => {
  setPagos(prev => {
    const actualizados = [...prev];

    nuevosPagos.forEach(pagoNuevo => {
      const index = actualizados.findIndex(p => p.id === pagoNuevo.id);
      if (index !== -1) {
        // 🔄 Si ya existe, actualízalo
        actualizados[index] = pagoNuevo;
      } else {
        // ➕ Si es nuevo, agrégalo
        actualizados.push(pagoNuevo);
      }
    });

    return actualizados;
  });

  setCurrentPage(1); // Puedes dejar esto si quieres volver a la página 1
};


  const handleCargarMock = (pagosDelMock) => {
    if (!mockCargado) {
      setPagos(prev => [...prev, ...pagosDelMock]);
      setMockCargado(true);
      setLoading(false);
    }
  };

  // Filtro y paginación
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

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPagos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos y abonos');
    XLSX.writeFile(workbook, 'ReporteDePagosYabonos.xlsx');
  };

  return (
    <div className="p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestión de Pagos y Abonos
        </h1>

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
            <FaFileExcel /> Exportar
          </button>

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
                {['Fecha', 'Número de Contrato', 'Nombre y Apellido', 'Monto Total', 'Monto Pagado', 'Método de Pago', 'Estado', 'Acciones']
                  .map((h, i) => (
                    <th key={i} className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(ITEMS_PER_PAGE)].map((_, i) => <SkeletonRow key={i} />)}
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
        onAddPago={handleAddPago}
        pagosAgregados={pagos}
        onLoadMock={handleCargarMock}
        mockPagosIntegrado={mockPagosIntegrado}
      />
    </div>
  );
};

export default Payments_InstallmentsPage;
