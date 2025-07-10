import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaDownload } from 'react-icons/fa';
import PagosTable from './components/PagosTable';
import CreatePaymentsModal from './components/CreatePaymentsModal';
import Pagination from '../../../../shared/components/Pagination'; // Asegúrate de que esta ruta sea correcta
import toast from 'react-hot-toast'; // Importar react-hot-toast
import PaymentsDetailModal from './components/PaymentsDetailModal'; // Importa el nuevo modal de detalles

// Mock de datos mejorado para simular la estructura real
const mockPagosIntegrado = [
  {
    cliente: { id: 1, nombre: 'Juan', apellido: 'Pérez', documento: '1012345678' },
    contratos: [
      {
        numero: 'CON-001',
        pagos: [
          {
            id: 1,
            fecha: '2024-01-15',
            montoTotal: 1000000, // Monto total del contrato
            montoAbonado: 250000, // Monto de este pago/abono
            montoRestante: 750000, // Restante del contrato después de este pago
            metodoPago: 'Transferencia',
            estado: 'Registrado',
            concepto: 'Abono inicial contrato CON-001',
          },
          {
            id: 2,
            fecha: '2024-02-10',
            montoTotal: 1000000,
            montoAbonado: 150000,
            montoRestante: 600000,
            metodoPago: 'Efectivo',
            estado: 'Registrado',
            concepto: 'Abono cuota febrero CON-001',
          },
        ],
      },
      {
        numero: 'CON-002',
        pagos: [
          {
            id: 3,
            fecha: '2024-03-01',
            montoTotal: 500000,
            montoAbonado: 500000,
            montoRestante: 0,
            metodoPago: 'PSE',
            estado: 'Completado',
            concepto: 'Pago completo contrato CON-002',
          },
        ],
      },
    ],
  },
  {
    cliente: { id: 2, nombre: 'María', apellido: 'González', documento: '2023456789' },
    contratos: [
      {
        numero: 'CON-003',
        pagos: [
          {
            id: 4,
            fecha: '2024-04-05',
            montoTotal: 1200000,
            montoAbonado: 300000,
            montoRestante: 900000,
            metodoPago: 'Tarjeta',
            estado: 'Registrado',
            concepto: 'Abono inicial contrato CON-003',
          },
          {
            id: 5,
            fecha: '2024-05-20',
            montoTotal: 1200000,
            montoAbonado: 200000,
            montoRestante: 700000,
            metodoPago: 'Transferencia',
            estado: 'Cancelado', // Ejemplo de pago cancelado
            concepto: 'Abono cuota mayo CON-003 (cancelado)',
          },
        ],
      },
    ],
  },
  {
    cliente: { id: 3, nombre: 'Pedro', apellido: 'Ramírez', documento: '3034567890' },
    contratos: [
      {
        numero: 'CON-004',
        pagos: [
          {
            id: 6,
            fecha: '2024-06-10',
            montoTotal: 800000,
            montoAbonado: 800000,
            montoRestante: 0,
            metodoPago: 'Efectivo',
            estado: 'Completado',
            concepto: 'Pago final contrato CON-004',
          },
        ],
      },
    ],
  },
];

const ITEMS_PER_PAGE = 5;

const Payments_InstallmentsPage = () => {
  const [clientesConContratosYPagos, setClientesConContratosYPagos] = useState(JSON.parse(JSON.stringify(mockPagosIntegrado)));
  const [loading, setLoading] = useState(false); // Podrías usarlo para estados de carga reales
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [modalContractData, setModalContractData] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false); // Data completa del contrato para el modal
  const [detailContractData, setDetailContractData] = useState(null);

  // Aplanar los datos para la tabla principal
  const flatPaymentsData = useMemo(() => {
    const allFlatPayments = [];
    clientesConContratosYPagos.forEach(clienteEntry => {
      const { cliente, contratos } = clienteEntry;
      contratos.forEach(contrato => {
        contrato.pagos.forEach(pago => {
          allFlatPayments.push({
            ...pago,
            numeroContrato: contrato.numero,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            clienteId: cliente.id,
            contratoNumero: contrato.numero, // Redundante pero útil para consistencia
          });
        });
      });
    });
    return allFlatPayments;
  }, [clientesConContratosYPagos]);

  // Filtrar los pagos según el término de búsqueda
  const filteredPagos = useMemo(() =>
    flatPaymentsData.filter(p =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numeroContrato.toString().includes(searchTerm) ||
      p.metodoPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.concepto.toLowerCase().includes(searchTerm.toLowerCase())
    ), [flatPaymentsData, searchTerm]);

  // Calcular total de páginas para la paginación
  const totalPages = Math.ceil(filteredPagos.length / ITEMS_PER_PAGE);

  // Obtener los pagos para la página actual
  const paginatedPagos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPagos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPagos, currentPage]);

  // Manejador para abrir el modal de registro de pago para un contrato específico
  const handleOpenRegisterPaymentForContract = (pagoDeLaFila) => {
    // 1. Encontrar el cliente y el contrato en la estructura anidada
    const clienteFound = clientesConContratosYPagos.find(c => c.cliente.id === pagoDeLaFila.clienteId);
    if (!clienteFound) {
      console.error('Cliente no encontrado para el pago seleccionado.');
      toast.error('Error: Cliente no encontrado para el contrato.');
      return;
    }

    const contratoFound = clienteFound.contratos.find(c => c.numero === pagoDeLaFila.numeroContrato);
    if (!contratoFound) {
      console.error('Contrato no encontrado para el pago seleccionado.');
      toast.error('Error: Contrato no encontrado.');
      return;
    }

    // 2. Calcular los montos totales y abonados del CONTRATO completo
    // Asumimos que el montoTotal del contrato es el mismo en todos sus pagos.
    // Tomamos el primero si existe, si no, es 0.
    const montoTotalContrato = contratoFound.pagos[0]?.montoTotal || 0;

    // Sumar solo los `montoAbonado` de pagos NO cancelados
    const montoAbonadoContrato = contratoFound.pagos
      .filter(p => p.estado !== 'Cancelado')
      .reduce((sum, p) => sum + p.montoAbonado, 0);

    const montoRestanteContrato = Math.max(0, montoTotalContrato - montoAbonadoContrato);

    // 3. Preparar la data completa para el modal
    setModalContractData({
      cliente: clienteFound.cliente,
      contrato: {
        numero: contratoFound.numero,
        pagos: contratoFound.pagos, // Pasamos TODOS los pagos del contrato
        montoTotal: montoTotalContrato,
        montoAbonado: montoAbonadoContrato,
        montoRestante: montoRestanteContrato,
      },
    });
    setMostrarModalPago(true);
  };

  // Manejador para abrir el modal de registro de pago sin datos preestablecidos (si lo quieres mantener)
  const handleOpenGlobalRegisterPayment = () => {
    setModalContractData(null); // No precarga nada, el modal lo gestionará
    setMostrarModalPago(true);
  };

  // Manejador para abrir el modal de detalles del contrato
const handleOpenPaymentDetails = (contractNumber, clientId) => {
    // Aquí buscarías el contrato completo con sus pagos
    // en tu fuente de datos (ej. clientesConContratosYPagos)
    const clienteFound = clientesConContratosYPagos.find(c => c.cliente.id === clientId);
    if (!clienteFound) {
      toast.error('Cliente no encontrado.');
      return;
    }
    const contratoFound = clienteFound.contratos.find(c => c.numero === contractNumber);
    if (!contratoFound) {
      toast.error('Contrato no encontrado.');
      return;
    }

    // Calcular montos totales, abonados y restantes del contrato si no los tienes ya calculados
    const montoTotalContrato = contratoFound.pagos[0]?.montoTotal || 0; // Asumiendo que montoTotal es el mismo para todo el contrato
    const montoAbonadoContrato = contratoFound.pagos
      .filter(p => p.estado !== 'Cancelado')
      .reduce((sum, p) => sum + p.montoAbonado, 0);
    const montoRestanteContrato = Math.max(0, montoTotalContrato - montoAbonadoContrato);


    setDetailContractData({
      cliente: {
        id: clienteFound.cliente.id,
        nombre: clienteFound.cliente.nombre,
        apellido: clienteFound.cliente.apellido,
        documento: clienteFound.cliente.documento,
      },
      contrato: {
        numero: contratoFound.numero,
        fechaInicio: contratoFound.fechaInicio, // Asegúrate de que esto exista en tus datos
        montoTotal: montoTotalContrato,
        montoAbonado: montoAbonadoContrato,
        montoRestante: montoRestanteContrato,
        pagos: contratoFound.pagos, // Pasamos el array completo de pagos
      },
    });
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailContractData(null); // Limpiar datos al cerrar
  };

  // Manejador para añadir un nuevo abono a la data principal
  const handleAddPagoToData = (newAbonoInfo) => {
    console.log('Recibido en el padre para guardar (nuevo abono):', newAbonoInfo);

    setClientesConContratosYPagos(prevClientesData => {
      const updatedClientes = JSON.parse(JSON.stringify(prevClientesData)); // Copia profunda

      const clienteIndex = updatedClientes.findIndex(c => c.cliente.id === newAbonoInfo.clienteId);
      if (clienteIndex === -1) {
        console.error('Cliente no encontrado para el nuevo abono.');
        toast.error('Error al guardar: Cliente no encontrado.');
        return prevClientesData;
      }
      const cliente = updatedClientes[clienteIndex];

      const contratoIndex = cliente.contratos.findIndex(c => c.numero === newAbonoInfo.numeroContrato);
      if (contratoIndex === -1) {
        console.error('Contrato no encontrado para el nuevo abono.');
        toast.error('Error al guardar: Contrato no encontrado.');
        return prevClientesData;
      }
      const contrato = cliente.contratos[contratoIndex];

      // Calcular el nuevo ID para el abono
      let newId = 1;
      if (flatPaymentsData.length > 0) {
        newId = Math.max(...flatPaymentsData.map(p => p.id)) + 1;
      }

      // Crear el nuevo registro de abono
      const newAbonoRecord = {
        id: newId,
        fecha: newAbonoInfo.fecha,
        montoTotal: newAbonoInfo.montoTotalContrato, // El monto total del contrato original
        montoAbonado: newAbonoInfo.montoAbonado, // El monto de ESTE abono
        montoRestante: newAbonoInfo.montoRestanteCalculado, // El restante después de este abono
        metodoPago: newAbonoInfo.metodoPago,
        estado: 'Registrado', // Nuevo abono siempre inicia como 'Registrado'
        concepto: newAbonoInfo.concepto,
      };

      contrato.pagos.push(newAbonoRecord); // Añadir el nuevo abono a la lista de pagos del contrato

      // Opcional: Actualizar el estado del pago principal si lo modelaras como un solo pago principal
      // y abonos como sub-registros. En tu modelo actual, cada abono es un pago.
      // El estado del contrato como "pagado/parcial" se refleja en el montoRestante.

      // Después de añadir el abono, actualizamos la `modalContractData` para que el modal se refresque
      // con el historial y los montos actualizados.
      const updatedMontoAbonadoContrato = contrato.pagos
        .filter(p => p.estado !== 'Cancelado')
        .reduce((sum, p) => sum + p.montoAbonado, 0);
      const updatedMontoRestanteContrato = Math.max(0, newAbonoInfo.montoTotalContrato - updatedMontoAbonadoContrato);

      setModalContractData(prevData => ({
        ...prevData,
        contrato: {
          ...prevData.contrato,
          pagos: [...contrato.pagos], // Asegura que es una nueva referencia
          montoAbonado: updatedMontoAbonadoContrato,
          montoRestante: updatedMontoRestanteContrato,
        }
      }));

      return updatedClientes;
    });

    toast.success('Abono registrado correctamente.');
    // No cerramos el modal aquí, el usuario puede seguir agregando abonos
    // setMostrarModalPago(false);
    // setModalContractData(null);
  };

  // Manejador para cancelar un pago
  const handleCancelPayment = (paymentIdToCancel, contratoNumero, clienteId) => {
    setClientesConContratosYPagos(prevClientesData => {
      const updatedClientes = JSON.parse(JSON.stringify(prevClientesData));

      const clienteIndex = updatedClientes.findIndex(c => c.cliente.id === clienteId);
      if (clienteIndex === -1) {
        toast.error('Error: Cliente no encontrado para la cancelación.');
        return prevClientesData;
      }
      const cliente = updatedClientes[clienteIndex];

      const contratoIndex = cliente.contratos.findIndex(c => c.numero === contratoNumero);
      if (contratoIndex === -1) {
        toast.error('Error: Contrato no encontrado para la cancelación.');
        return prevClientesData;
      }
      const contrato = cliente.contratos[contratoIndex];

      const pagoIndex = contrato.pagos.findIndex(p => p.id === paymentIdToCancel);
      if (pagoIndex === -1) {
        toast.error('Error: Pago no encontrado para la cancelación.');
        return prevClientesData;
      }

      // Marcar el pago como cancelado
      contrato.pagos[pagoIndex].estado = 'Cancelado';

      // Recalcular los montos del contrato después de la cancelación
      const montoTotalContrato = contrato.pagos[0]?.montoTotal || 0;
      const montoAbonadoContrato = contrato.pagos
        .filter(p => p.estado !== 'Cancelado')
        .reduce((sum, p) => sum + p.montoAbonado, 0);
      const montoRestanteContrato = Math.max(0, montoTotalContrato - montoAbonadoContrato);

      // Actualizar la `modalContractData` para reflejar los cambios en el modal
      setModalContractData(prevData => ({
        ...prevData,
        contrato: {
          ...prevData.contrato,
          pagos: [...contrato.pagos], // Pasamos la nueva referencia para forzar re-render
          montoAbonado: montoAbonadoContrato,
          montoRestante: montoRestanteContrato,
        }
      }));

      
      return updatedClientes;
    });
  };


  const handleExport = () => {
    // Lógica de exportación, si es necesario, aquí podrías exportar todos los pagos filtrados
    toast.info('Funcionalidad de exportar no implementada en este ejemplo.');
    console.log('Exportando pagos:', filteredPagos);
  };


  return (
    <div className="p-4 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Gestión de Pagos e Cuotas</h1>
        <div className="flex space-x-3">
          <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Resetear a la primera página al buscar
            }}
            className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-conv3r-gold focus:border-conv3r-gold"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all"
          >
            <FaDownload /> Exportar
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        
      </div>

      {/* Tabla de Pagos */}
      {loading ? (
        // Implementa tu SkeletonRow aquí si es necesario
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      ) : (
        <>
          <PagosTable
            pagos={paginatedPagos}
            onRegisterNewAbono={handleOpenRegisterPaymentForContract}
            handleOpenPaymentDetails={handleOpenPaymentDetails} // Pasa la función para abrir el modal de detalles
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Modal de Registro de Pagos */}
      <CreatePaymentsModal
        isOpen={mostrarModalPago}
        onClose={() => {
          setMostrarModalPago(false);
          setModalContractData(null); // Limpiar data al cerrar
        }}
        onSaveNewAbono={handleAddPagoToData}
        contractData={modalContractData} // Pasa la data completa del contrato
        onCancelPayment={handleCancelPayment} // Pasa la función para cancelar
      />

      {/* Modal de Detalles del Contrato */}
        <PaymentsDetailModal
        contractData={detailContractData}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default Payments_InstallmentsPage;