import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaFilePdf, FaMinusCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast'; // Importar react-hot-toast
import Swal from 'sweetalert2'; // Importar Swal para el modal de motivo
// Asegúrate de que esta ruta sea correcta para tu utilidad de alertas
import { confirmDelete } from '../../../../../shared/utils/alerts';
import { createBasePDF, addHeader, addFooter, addGenericTable } from '../../../../../shared/utils/pdf/pdfTemplate';
import { usePermissions } from '../../../../../shared/hooks/usePermissions';

const inputBase = 'w-full p-2.5 border rounded-lg text-sm focus:ring-conv3r-gold focus:border-conv3r-gold';


// Helper para formatear montos a moneda local (COP) con decimales
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0,00'; 
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};


const CreatePaymentsModal = ({ isOpen, onClose, onSaveNewAbono, contractData, onCancelPayment }) => {
  const { canDelete } = usePermissions();
  const [concepto, setConcepto] = useState('');
  const [montoAbonar, setMontoAbonar] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [errores, setErrores] = useState({});

  // Resetear estados y errores al abrir el modal o cambiar la data del contrato
  useEffect(() => {
    if (isOpen) {
      setConcepto('');
      setMontoAbonar('');
      setMetodoPago('');
      setErrores({});
    }
  }, [isOpen, contractData]);

  // --- PRIMER PUNTO DE CONTROL: Si el modal no debe estar abierto, no renderiza nada. ---
  if (!isOpen) return null;

  // --- SEGUNDO PUNTO DE CONTROL: Si no hay datos de contrato, mostrar el mensaje de "seleccionar contrato". ---
  // ESTE BLOQUE DEBE IR ANTES DE CUALQUIER INTENTO DE USAR `contractData`
  if (!contractData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Registrar Pagos o Abonos</h2>
          <p className="text-gray-600 mb-4">Por favor, selecciona un contrato desde la tabla principal o ingresa los datos del contrato para registrar un abono.</p>
          {/* Aquí podrías añadir un formulario para buscar/seleccionar un contrato si no se abrió desde la tabla */}
          <button onClick={onClose} className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95">Cerrar</button>
        </div>
      </div>
    );
  }

  // --- A PARTIR DE AQUÍ, SABEMOS QUE `isOpen` ES TRUE Y `contractData` NO ES NULL ---
  // Ahora es seguro definir estas variables, ya que `contractData` existe.
  const currentMontoTotalContrato = contractData?.contrato?.montoTotal || 0;
  const currentMontoAbonadoContrato = contractData?.contrato?.montoAbonado || 0;
  const currentMontoRestanteContrato = contractData?.contrato?.montoRestante || 0;

  // Determinar la clase de color para el monto restante (ahora es seguro usar los montos)
  const restanteColorClass = currentMontoRestanteContrato === 0
    ? 'text-green-600 font-bold'
    : currentMontoRestanteContrato <= currentMontoTotalContrato * 0.20 // Ejemplo: 20% o menos restante
    ? 'text-orange-600 font-bold'
    : 'text-red-600 font-bold';

  const handleMontoChange = (e) => {
    // 1. Obtener el valor limpio (sin símbolos ni puntos, solo números y comas)
    let rawValue = e.target.value.replace(/[^0-9,]/g, '');

    // 2. Evitar múltiples comas: solo permitir la primera
    const parts = rawValue.split(',');
    if (parts.length > 2) {
      // Si hay más de una coma, reconstruir usando solo la primera parte y el resto unido
      rawValue = parts[0] + ',' + parts.slice(1).join('');
    }

    if (rawValue === '') {
      setMontoAbonar('');
      return;
    }

    // 3. Separar enteros y decimales
    const partsFinal = rawValue.split(',');
    let integerPart = partsFinal[0];
    // Limitar decimales a 2 dígitos si se desea, aquí lo dejo abierto o limito a 2
    const decimalPart = partsFinal.length > 1 ? ',' + partsFinal[1].substring(0, 2) : '';

    // 4. Formatear la parte entera con puntos
    // Eliminar ceros a la izquierda si no es solo "0"
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
      integerPart = integerPart.replace(/^0+/, '');
    }
    if (integerPart === '') integerPart = '0'; // Si el usuario escribe ",50", asumir "0,50"

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    setMontoAbonar(formattedInteger + decimalPart);
  };

  const handleSaveAbono = () => {
    const erroresVal = {};
    if (!concepto.trim()) erroresVal.concepto = 'Campo requerido';

    // Parsear el monto: quitar puntos, cambiar coma por punto
    const montoLimpio = montoAbonar.replace(/\./g, '').replace(',', '.');
    const montoIngresado = parseFloat(montoLimpio);

    if (isNaN(montoIngresado) || montoIngresado <= 0) erroresVal.montoAbonar = 'Monto válido requerido';
    if (!metodoPago) erroresVal.metodoPago = 'Campo requerido';

    // Este check de `!contractData` ya es redundante aquí porque ya lo controlamos arriba.
    // Lo mantengo por si la función `handleSaveAbono` pudiera llamarse de otra forma
    // o para mayor seguridad, pero en el flujo actual, `contractData` ya es válido.
    if (!contractData) {
      toast.error('No se ha seleccionado un contrato para registrar el abono.');
      setErrores(erroresVal); // Mostrar errores si existen
      return;
    }

    if (montoIngresado > currentMontoRestanteContrato) {
      erroresVal.montoAbonar = `El monto excede el restante (${formatCurrency(currentMontoRestanteContrato)})`;
    }

    if (Object.keys(erroresVal).length > 0) {
      setErrores(erroresVal);
      return;
    }

    const nuevoMontoRestanteCalculado = Math.max(0, currentMontoRestanteContrato - montoIngresado);

    const nuevoAbonoData = {
      clienteId: contractData.cliente.id,
      numeroContrato: contractData.contrato.numero,
      id_proyecto: contractData.contrato.id_proyecto,
      fecha: new Date().toISOString().split('T')[0], // Fecha en formato YYYY-MM-DD
      concepto: concepto.trim(),
      montoAbonado: montoIngresado,
      metodoPago: metodoPago,
      montoTotalContrato: currentMontoTotalContrato, // Pasa el monto total del contrato
      montoRestanteCalculado: nuevoMontoRestanteCalculado, // Pasa el restante actualizado
    };

    // Llamar a onSaveNewAbono y manejar errores
    try {
      onSaveNewAbono(nuevoAbonoData); // Esta función ahora maneja su propio try/catch y toast
      // Solo limpiar si la llamada es exitosa (dependiendo de cómo onSaveNewAbono propague errores)
      // Como onSaveNewAbono en el padre maneja el error y muestra toast,
      // aquí asumimos éxito para limpiar el formulario o esperamos que el padre cierre el modal.
      // Sin embargo, el padre NO cierra el modal automáticamente en caso de error.
      // Lo ideal sería que onSaveNewAbono devolviera una promesa.
      
      setConcepto('');
      setMontoAbonar('');
      setMetodoPago('');
      setErrores({});
      // toast.success('Abono registrado exitosamente.'); // El padre ya muestra el toast
    } catch (error) {
      // Si onSaveNewAbono lanzara error, lo capturamos aquí
      console.error("Error en modal:", error);
    }
  };

  const handleCancelPaymentInModal = async (pagoId) => {
    const { value: motivo } = await Swal.fire({
      title: '¿Deseas anular este pago?',
      text: "Esta acción no se puede deshacer. Por favor ingresa el motivo de la anulación:",
      input: 'text',
      inputPlaceholder: 'Escribe el motivo aquí...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir un motivo!';
        }
      }
    });

    if (motivo) {
      if (contractData && onCancelPayment) {
        // Pasamos el motivo como cuarto argumento
        await onCancelPayment(pagoId, contractData.contrato.numero, contractData.cliente.id, motivo);
      } else {
        toast.error('No se pudo cancelar el pago. Falta información del contrato o la función de cancelación.');
      }
    }
  };

  const handleDescargarPDF = () => {
    if (!contractData?.contrato) {
      toast.error('No hay datos del contrato disponibles para generar el PDF.');
      return;
    }

    const pagos = contractData.contrato.pagos || [];
    if (pagos.length === 0) {
      toast.error('No hay pagos registrados para este contrato.');
      return;
    }

    const doc = createBasePDF();
    const cliente = contractData.cliente || {};
    const contrato = contractData.contrato || {};
    const clienteNombre = `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() || 'Cliente no especificado';
    const documentoCliente = cliente.documento || 'Sin documento';
    const telefonoCliente = cliente.telefono || 'No registrado';
    const proyectoNombre = contrato.nombreProyecto || contrato?.proyecto?.nombre || contrato.id_proyecto || 'Sin proyecto asignado';
    const estadoContrato = contrato.estado || 'Sin estado';

    const parseAmount = (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const totalPagos = pagos.reduce((acc, pago) => acc + parseAmount(pago.montoAbonado), 0);
    const ultimaFechaMovimiento = pagos[pagos.length - 1]?.fecha || 'Sin movimientos';
    const montoTotalContrato = parseAmount(contrato.montoTotal);
    const montoAbonadoContrato = parseAmount(contrato.montoAbonado);
    const montoRestanteContrato = parseAmount(contrato.montoRestante);
    const totalAbonadoMostrar = montoAbonadoContrato > 0 ? montoAbonadoContrato : totalPagos;

    let y = addHeader(doc, `Pagos contrato ${contrato.numero || ''}`.trim());

    // Información general
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Información del contrato', 14, y);
    y += 8;

    const LEFT_X = 14;
    const RIGHT_X = 110;
    const LINE_HEIGHT = 7;
    let leftY = y;
    let rightY = y;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    doc.text(`Cliente: ${clienteNombre}`, LEFT_X, leftY);
    leftY += LINE_HEIGHT;
    doc.text(`Documento: ${documentoCliente}`, LEFT_X, leftY);
    leftY += LINE_HEIGHT;
    doc.text(`Teléfono: ${telefonoCliente}`, LEFT_X, leftY);

    doc.text(`Contrato: ${contrato.numero || 'N/A'}`, RIGHT_X, rightY);
    rightY += LINE_HEIGHT;
    doc.text(`Proyecto: ${proyectoNombre}`, RIGHT_X, rightY);
    rightY += LINE_HEIGHT;
    doc.text(`Estado: ${estadoContrato}`, RIGHT_X, rightY);

    y = Math.max(leftY, rightY) + 6;

    // Estado financiero
    const stats = [
      { label: 'Monto total contrato', value: formatCurrency(montoTotalContrato) },
      { label: 'Total abonado', value: formatCurrency(totalAbonadoMostrar) },
      { label: 'Saldo pendiente', value: formatCurrency(montoRestanteContrato) },
    ];

    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.rect(14, y, 182, 38, 'F');

    const STAT_WIDTH = 182 / stats.length;
    doc.setFontSize(10);

    stats.forEach((stat, index) => {
      const statX = 20 + (STAT_WIDTH * index);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(stat.label, statX, y + 12);

      doc.setFont('helvetica', 'bold');
      const isSaldo = stat.label === 'Saldo pendiente';
      const saldoColor = montoRestanteContrato === 0 ? [22, 163, 74] : [190, 18, 60];
      const valueColor = isSaldo ? saldoColor : [0, 1, 42];
      doc.setTextColor(...valueColor);
      doc.setFontSize(12);
      doc.text(stat.value, statX, y + 24);
      doc.setFontSize(10);
    });

    y += 48;

    // Tabla de pagos
    const tableRows = [
      [
        {
          content: 'Historial de pagos y abonos',
          colSpan: 7,
          styles: { halign: 'center', fillColor: [249, 250, 251], fontStyle: 'bold', textColor: [0, 1, 42] }
        }
      ],
      ['Fecha', 'Concepto', 'Monto contrato', 'Abono', 'Restante', 'Método', 'Estado']
    ];

    pagos.forEach((pago) => {
      tableRows.push([
        pago.fecha || 'N/A',
        pago.concepto || 'Sin descripción',
        formatCurrency(parseAmount(pago.montoTotal ?? montoTotalContrato)),
        formatCurrency(parseAmount(pago.montoAbonado)),
        formatCurrency(parseAmount(pago.montoRestante ?? montoRestanteContrato)),
        pago.metodoPago || 'N/A',
        pago.estado || 'N/A'
      ]);
    });

    y = addGenericTable(doc, tableRows, y);

    // Resumen final
    const resumenY = y + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Resumen de movimientos', 14, resumenY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Total de registros: ${pagos.length}`, 14, resumenY + 8);
    doc.text(`Total abonado registrado: ${formatCurrency(totalPagos)}`, 14, resumenY + 16);
    doc.text(`Último movimiento: ${ultimaFechaMovimiento}`, 14, resumenY + 24);

    addFooter(doc);
    doc.save(`Pagos_Contrato_${contrato.numero || 'sin_numero'}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto flex justify-center items-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-5 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

          {/* Título */}
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <h2 className="text-xl font-bold">Registrar Pagos o Abonos</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl"><FaTimes /></button>
          </div>

          {/* Sección de Cliente y Contrato - Compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
             <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">Cliente:</span>
                <span className="text-sm text-gray-800 truncate" title={`${contractData.cliente.nombre} ${contractData.cliente.apellido}`}>
                  {contractData.cliente.nombre} {contractData.cliente.apellido}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-700">Contrato:</span>
                <span className="text-sm text-gray-800 font-mono">{contractData.contrato.numero}</span>
             </div>
          </div>

          {/* Información Financiera Compacta */}
          <div className="bg-white border border-blue-100 rounded-lg p-3 mb-4 shadow-sm">
            <h3 className="text-conv3r-dark font-bold text-sm mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v6m0 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-3 6h6m-3-3v6" />
              </svg>
              Estado Financiero
            </h3>
            <div className="flex justify-between items-center text-sm gap-4 flex-wrap">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Total Contrato</span>
                <span className="font-bold text-gray-900">{formatCurrency(currentMontoTotalContrato)}</span>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Total Abonado</span>
                <span className="font-bold text-green-700">{formatCurrency(currentMontoAbonadoContrato)}</span>
              </div>
              <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Restante</span>
                <span className={`font-bold ${restanteColorClass}`}>
                  {formatCurrency(currentMontoRestanteContrato)}
                </span>
              </div>
            </div>
          </div>


          {/* Formulario de abono */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end mb-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                <span className="text-red-500">*</span> Concepto
              </label>
              <input
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                className={`${inputBase} py-2`}
                placeholder="Ej: Abono cuota Julio"
              />
              {errores.concepto && <p className="text-red-600 text-xs mt-0.5">{errores.concepto}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                <span className="text-red-500">*</span> Monto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-xs">$</span>
                <input
                  type="text"
                  value={montoAbonar}
                  onChange={handleMontoChange}
                  className={`${inputBase} pl-6 py-2 font-semibold text-gray-800`}
                  placeholder="150.000"
                />
              </div>
              {errores.montoAbonar && <p className="text-red-600 text-xs mt-0.5">{errores.montoAbonar}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">
                <span className="text-red-500">*</span> Método
              </label>
              <select
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value)}
                className={`${inputBase} py-2`}
              >
                <option value="">Elegir...</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="PSE">PSE</option>
                <option value="Cheque">Cheque</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
              {errores.metodoPago && <p className="text-red-600 text-xs mt-0.5">{errores.metodoPago}</p>}
            </div>

            <button
              type="button"
              onClick={handleSaveAbono}
              disabled={currentMontoRestanteContrato <= 0}
              className={`inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm transition-all h-10
                          ${(currentMontoRestanteContrato <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaPlus size={12} /> Guardar
            </button>
          </div>

          <div className="flex justify-end mt-2 mb-2">
            <button
              onClick={handleDescargarPDF}
              className="inline-flex items-center gap-2 text-xs font-medium text-conv3r-dark bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FaFilePdf size={12} /> PDF Contrato
            </button>
          </div>

          {/* Tabla de todos los pagos asociados al contrato */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {['Fecha', 'Concepto', 'Abono', 'Restante', 'Método', 'Estado', 'Acción']
                    .map(h => <th key={h} className="px-2 py-2 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {contractData.contrato.pagos.length > 0 ? (
                  contractData.contrato.pagos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2 whitespace-nowrap text-xs">{p.fecha}</td>
                      <td className="px-2 py-2 text-left text-xs truncate max-w-[150px]" title={p.concepto}>{p.concepto}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium">{formatCurrency(p.montoAbonado)}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">{formatCurrency(p.montoRestante)}</td>
                      <td className="px-2 py-2 text-xs">{p.metodoPago}</td>
                      <td className="px-2 py-2 text-xs">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.estado === 'Registrado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {p.estado}
                         </span>
                      </td>
                      <td className="px-2 py-2">
                        {p.estado === 'Registrado' && canDelete('pagosyabonos') && (
                            <button
                            className="text-red-500 hover:text-red-700 transition-colors"
                            onClick={() => handleCancelPaymentInModal(p.id)}
                            title="Cancelar pago"
                            >
                            <FaMinusCircle size={14} />
                            </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500 text-xs">
                      No hay pagos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Botones finales */}
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 font-semibold py-1.5 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">Cerrar</button>
          </div>

        </div>
    </div>
  );
};

export default CreatePaymentsModal;