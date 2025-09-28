import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaDownload } from 'react-icons/fa';
import PagosTable from './components/PagosTable';
import CreatePaymentsModal from './components/CreatePaymentsModal';
import Pagination from '../../../../shared/components/Pagination'; // Asegúrate de que esta ruta sea correcta
import toast from 'react-hot-toast'; // Importar react-hot-toast
import PaymentsDetailModal from './components/PaymentsDetailModal'; // Importa el nuevo modal de detalles
import { paymentsApi } from './services/paymentsApi';
import { projectsApi } from '../../../../shared/services/projectsApi';
import { projectPaymentsApi } from './services/projectPaymentsApi';

const ITEMS_PER_PAGE = 5;

const Payments_InstallmentsPage = () => {
  const [clientesConContratosYPagos, setClientesConContratosYPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [modalContractData, setModalContractData] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false); // Data completa del contrato para el modal
  const [detailContractData, setDetailContractData] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      
      // Primero cargar todos los proyectos
      const projectsResponse = await projectsApi.getAllProjects();
      const projects = projectsResponse.data || [];
      
      console.log('Proyectos obtenidos del backend:', projects);
      
      if (projects.length === 0) {
        setClientesConContratosYPagos([]);
        return;
      }

      // Para cada proyecto, obtener sus pagos usando las rutas anidadas
      const projectsWithPayments = await Promise.all(
        projects.map(async (project) => {
          try {
            console.log(`Obteniendo pagos para proyecto ${project.id}:`, project);
            const paymentsResponse = await projectPaymentsApi.getProjectPayments(project.id);
            console.log(`Pagos obtenidos para proyecto ${project.id}:`, paymentsResponse);
            return {
              ...project,
              pagos: paymentsResponse.data || []
            };
          } catch (error) {
            console.warn(`No se pudieron cargar los pagos del proyecto ${project.id}:`, error);
            return {
              ...project,
              pagos: []
            };
          }
        })
      );
      
      console.log('Proyectos con pagos:', projectsWithPayments);

      // Agrupar proyectos por cliente y contrato
      const grouped = {};
      projectsWithPayments.forEach(proyecto => {
        // Si el cliente es solo un string (nombre), crear un objeto cliente temporal
        let cliente;
        if (typeof proyecto.cliente === 'string') {
          cliente = {
            id_cliente: proyecto.id, // Usar el ID del proyecto como ID temporal del cliente
            nombre: proyecto.cliente,
            apellido: '',
            documento: ''
          };
        } else {
          cliente = proyecto.cliente;
        }
        
        if (!cliente) return;
        
        const clienteId = cliente.id_cliente || proyecto.id; // Usar ID del proyecto si no hay ID de cliente
        
        if (!grouped[clienteId]) {
          grouped[clienteId] = {
            cliente: {
              id: clienteId,
              id_cliente: clienteId,
              nombre: cliente.nombre || '',
              apellido: cliente.apellido || '',
              documento: cliente.documento || ''
            },
            contratos: {}
          };
        }
        
        const contratoNumero = proyecto.numeroContrato || proyecto.numero_contrato;
        if (!grouped[clienteId].contratos[contratoNumero]) {
          grouped[clienteId].contratos[contratoNumero] = {
            numero: contratoNumero,
            id_proyecto: proyecto.id, // Usar el campo 'id' en lugar de 'id_proyecto'
            montoTotal: Number(proyecto.costos?.total || 0), // Usar la estructura de costos del JSON
            pagos: []
          };
        }
        
        // Procesar pagos del proyecto
        const pagosProcesados = proyecto.pagos.map(pago => {
          const totalPagado = proyecto.pagos
            .filter(p => p.estado)
            .reduce((sum, p) => sum + Number(p.monto), 0);
          const montoTotal = Number(proyecto.costos?.total || 0);
          const montoRestante = Math.max(0, montoTotal - totalPagado);
          
          return {
            id: pago.id_pago_abono || pago.id,
            fecha: pago.fecha,
            montoTotal: montoTotal,
            montoAbonado: Number(pago.monto),
            montoRestante: montoRestante,
            metodoPago: pago.metodo_pago,
            estado: pago.estado ? 'Registrado' : 'Cancelado',
            concepto: `Pago ${pago.metodo_pago}`
          };
        });
        
        // Si no hay pagos, crear un pago "virtual" para mostrar el proyecto
        if (pagosProcesados.length === 0) {
          const montoTotal = Number(proyecto.costos?.total || 0);
          pagosProcesados.push({
            id: `virtual-${proyecto.id}`,
            fecha: 'Sin pagos',
            montoTotal: montoTotal,
            montoAbonado: 0,
            montoRestante: montoTotal,
            metodoPago: 'Pendiente',
            estado: 'Sin pagos',
            concepto: 'Proyecto sin pagos registrados',
            isVirtual: true, // Marcar como virtual para identificar
            projectId: proyecto.id // Incluir el ID del proyecto
          });
        }
        
        grouped[clienteId].contratos[contratoNumero].pagos = pagosProcesados;
      });
      
      // Convertir grouped a array
      const result = Object.values(grouped).map(clienteEntry => ({
        cliente: clienteEntry.cliente,
        contratos: Object.values(clienteEntry.contratos)
      }));
      
      setClientesConContratosYPagos(result);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos de pagos');
    } finally {
      setLoading(false);
    }
  };

  // Aplanar los datos para la tabla principal
  const flatPaymentsData = useMemo(() => {
    const allFlatPayments = [];
    console.log('Procesando clientesConContratosYPagos:', clientesConContratosYPagos);
    
    clientesConContratosYPagos.forEach(clienteEntry => {
      const { cliente, contratos } = clienteEntry;
      console.log('Procesando cliente:', cliente);
      
      contratos.forEach(contrato => {
        console.log('Procesando contrato:', contrato);
        
        contrato.pagos.forEach(pago => {
          const pagoFlat = {
            id: pago.id || '',
            fecha: pago.fecha || '',
            montoTotal: pago.montoTotal || 0,
            montoAbonado: pago.montoAbonado || 0,
            montoRestante: pago.montoRestante || 0,
            metodoPago: pago.metodoPago || '',
            estado: pago.estado || '',
            concepto: pago.concepto || '',
            numeroContrato: contrato.numero || '',
            nombre: cliente.nombre || '',
            apellido: cliente.apellido || '',
            clienteId: cliente.id || '',
            contratoNumero: contrato.numero || '',
          };
          
          console.log('Pago aplanado creado:', pagoFlat);
          allFlatPayments.push(pagoFlat);
        });
      });
    });
    
    console.log('Todos los pagos aplanados:', allFlatPayments);
    return allFlatPayments;
  }, [clientesConContratosYPagos]);

  // Filtrar los pagos según el término de búsqueda
  const filteredPagos = useMemo(() =>
    flatPaymentsData.filter(p =>
      (p.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.apellido || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.fecha || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.numeroContrato || '').toString().includes(searchTerm) ||
      (p.metodoPago || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.estado || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.concepto || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    console.log('Pago de la fila:', pagoDeLaFila);
    console.log('Clientes disponibles:', clientesConContratosYPagos);
    
    // Si es un pago virtual, usar el projectId directamente
    if (pagoDeLaFila.isVirtual) {
      const projectId = pagoDeLaFila.projectId;
      const contratoNumero = pagoDeLaFila.numeroContrato;
      
      // Crear datos del modal para proyecto sin pagos
      setModalContractData({
        cliente: {
          id: pagoDeLaFila.clienteId,
          nombre: pagoDeLaFila.nombre,
          apellido: pagoDeLaFila.apellido
        },
        contrato: {
          numero: contratoNumero,
          id_proyecto: projectId,
          pagos: [],
          montoTotal: pagoDeLaFila.montoTotal,
          montoAbonado: 0,
          montoRestante: pagoDeLaFila.montoRestante,
        },
      });
      setMostrarModalPago(true);
      return;
    }
    
    // 1. Encontrar el cliente y el contrato en la estructura anidada
    const clienteFound = clientesConContratosYPagos.find(c => c.cliente.id === pagoDeLaFila.clienteId);
    if (!clienteFound) {
      console.error('Cliente no encontrado para el pago seleccionado.');
      console.error('ClienteId buscado:', pagoDeLaFila.clienteId);
      console.error('IDs de clientes disponibles:', clientesConContratosYPagos.map(c => c.cliente.id));
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
        id_proyecto: contratoFound.id_proyecto,
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
  const handleAddPagoToData = async (newAbonoInfo) => {
    console.log('Recibido en el padre para guardar (nuevo abono):', newAbonoInfo);

    try {
      // Usar la ruta anidada para crear el pago
      await projectPaymentsApi.createProjectPayment(newAbonoInfo.id_proyecto, {
        fecha: newAbonoInfo.fecha,
        monto: newAbonoInfo.montoAbonado,
        metodo_pago: newAbonoInfo.metodoPago,
        estado: true
      });
      toast.success('Abono registrado correctamente.');
      loadPaymentsData(); // Recargar datos
    } catch (error) {
      console.error('Error registrando pago:', error);
      toast.error('Error al registrar el abono');
    }
  };

  // Manejador para cancelar un pago
  const handleCancelPayment = async (paymentIdToCancel, contratoNumero, clienteId) => {
    try {
      // Buscar el proyecto para obtener el projectId
      const clienteFound = clientesConContratosYPagos.find(c => c.cliente.id === clienteId);
      if (!clienteFound) {
        toast.error('Cliente no encontrado.');
        return;
      }
      
      const contratoFound = clienteFound.contratos.find(c => c.numero === contratoNumero);
      if (!contratoFound) {
        toast.error('Contrato no encontrado.');
        return;
      }
      
      // Usar la ruta anidada para cancelar el pago
      await projectPaymentsApi.cancelProjectPayment(contratoFound.id_proyecto, paymentIdToCancel);
      toast.success('Pago cancelado correctamente.');
      loadPaymentsData();
    } catch (error) {
      console.error('Error cancelando pago:', error);
      toast.error('Error al cancelar el pago');
    }
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