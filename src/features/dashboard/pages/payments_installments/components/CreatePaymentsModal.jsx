import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaFilePdf, FaMinusCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast'; // Importar react-hot-toast
// Asegúrate de que esta ruta sea correcta para tu utilidad de alertas
import { confirmDelete } from '../../../../../shared/utils/alerts';

const inputBase = 'w-full p-2.5 border rounded-lg text-sm focus:ring-conv3r-gold focus:border-conv3r-gold';


// Helper para formatear montos a moneda local (COP)
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0'; // O algún valor predeterminado si el monto no es un número válido
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};


const CreatePaymentsModal = ({ isOpen, onClose, onSaveNewAbono, contractData, onCancelPayment }) => {
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

  const handleSaveAbono = () => {
    const erroresVal = {};
    if (!concepto.trim()) erroresVal.concepto = 'Campo requerido';
    const montoIngresado = parseFloat(montoAbonar);
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

    onSaveNewAbono(nuevoAbonoData);
    setConcepto('');
    setMontoAbonar('');
    setMetodoPago('');
    setErrores({});
    toast.success('Abono registrado exitosamente.');
  };

  const handleCancelPaymentInModal = async (pagoId) => {
    const confirm = await confirmDelete('¿Deseas cancelar este pago? Esto lo anulará en el sistema.');
    if (!confirm) return;

    if (contractData && onCancelPayment) {
      onCancelPayment(pagoId, contractData.contrato.numero, contractData.cliente.id);
      toast.success('Pago cancelado exitosamente.');
    } else {
      toast.error('No se pudo cancelar el pago. Falta información del contrato o la función de cancelación.');
    }
  };

  const handleDescargarPDF = () => {
    // Es seguro usar contractData.contrato.pagos aquí porque ya pasamos la validación
    if (!contractData.contrato || contractData.contrato.pagos.length === 0) {
      toast.error('No hay datos de pagos para generar el PDF de este contrato.');
      return;
    }

    const doc = new jsPDF();
    const cliente = contractData.cliente;
    const contrato = contractData.contrato;

    doc.setFontSize(16);
    doc.text('Historial de Pagos del Contrato', 14, 20);
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente?.nombre} ${cliente?.apellido}`, 14, 30);
    doc.text(`Documento: ${cliente?.documento || 'N/A'}`, 14, 38); // Añadir fallback
    doc.text(`Contrato: ${contrato?.numero}`, 14, 46);
    doc.text(`Monto Total Contrato: ${formatCurrency(contrato?.montoTotal)}`, 14, 54);
    doc.text(`Monto Abonado Total: ${formatCurrency(contrato?.montoAbonado)}`, 14, 62);
    doc.text(`Monto Restante: ${formatCurrency(contrato?.montoRestante)}`, 14, 70);


    autoTable(doc, {
      startY: 80, // Ajusta el inicio Y para después de la info del contrato
      head: [['Fecha', 'Concepto', 'Monto Total', 'Monto Abono', 'Restante (Contrato)', 'Método', 'Estado']],
      body: contrato.pagos.map(p => [
        p.fecha,
        p.concepto,
        formatCurrency(p.montoTotal), // Monto total del CONTRATO para ese registro de abono
        formatCurrency(p.montoAbonado), // Monto de ESE abono
        formatCurrency(p.montoRestante), // Restante del CONTRATO después de ese abono
        p.metodoPago,
        p.estado
      ]),
      styles: { fontSize: 10 }
    });

    doc.save(`Pagos_Contrato_${contrato.numero}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex justify-center items-start p-6 pt-12 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 relative" onClick={(e) => e.stopPropagation()}>

          {/* Título */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">Registrar Pagos o Abonos</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl"><FaTimes /></button>
          </div>

          {/* Sección de Cliente y Contrato - Usando un Fieldset para agrupar visualmente */}
          <fieldset className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
            <legend className="px-2 text-conv3r-dark text-md font-semibold bg-gray-50 rounded-md">
              Datos del Contrato Seleccionado
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Cliente</label>
                <input
                  type="text"
                  value={`${contractData.cliente.nombre} ${contractData.cliente.apellido}`}
                  disabled
                  className={`${inputBase} bg-gray-200 cursor-not-allowed text-gray-800 font-semibold`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Número de Contrato</label>
                <input
                  type="text"
                  value={contractData.contrato.numero}
                  disabled
                  className={`${inputBase} bg-gray-200 cursor-not-allowed text-gray-800 font-semibold`}
                />
              </div>
            </div>
          </fieldset>

          {/* Información del Contrato - Panel más destacado y con énfasis en el restante */}
          <div className="bg-grey-400 p-3 pl-0 rounded-xl border border-blue-200 mb-2 shadow-m">
            <h3 className="text-conv3rge-dark font-extrabold text-xl mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m7 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v6m0 0V5a2 2 0 012-2h2a2 2 0 012 2v6m-3 6h6m-3-3v6" />
              </svg>
              Estado Financiero del Contrato
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-base">
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Monto Total Contrato:</span>
                <span className="text-gray-900 text-lg font-bold">{formatCurrency(currentMontoTotalContrato)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Monto Abonado Total:</span>
                <span className="text-green-700 text-lg font-bold">{formatCurrency(currentMontoAbonadoContrato)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-600">Monto Restante:</span>
                <span className={`text-lg ${restanteColorClass}`}>
                  {formatCurrency(currentMontoRestanteContrato)}
                </span>
              </div>
            </div>
          </div>


          {/* Formulario de abono */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Concepto</label>
              <input
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                className={inputBase}
                placeholder="Ej: Abono de cuota de Julio"
              />
              {errores.concepto && <p className="text-red-600 text-xs mt-1">{errores.concepto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Monto a Abonar</label>
              <input
                type="number"
                value={montoAbonar}
                onChange={e => setMontoAbonar(e.target.value)}
                className={inputBase}
                placeholder="Ej: 150000"
              />
              {errores.montoAbonar && <p className="text-red-600 text-xs mt-1">{errores.montoAbonar}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Método de Pago</label>
              <select
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar...</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="PSE">PSE</option>
                <option value="Cheque">Cheque</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
              {errores.metodoPago && <p className="text-red-600 text-xs mt-1">{errores.metodoPago}</p>}
            </div>

            <button
              type="button"
              onClick={handleSaveAbono}
              // Deshabilita el botón si no hay contrato data o el restante es 0
              disabled={currentMontoRestanteContrato <= 0} // Ahora contractData ya está validado
              className={`inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all h-fit
                          ${(currentMontoRestanteContrato <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaPlus /> Guardar Abono
            </button>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleDescargarPDF}
              className="inline-flex items-center gap-2 text-sm font-semibold text-conv3r-dark bg-blue-50 border border-blue-200 mb-3 px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
            >
              <FaFilePdf size={14} /> Descargar PDF de este contrato
            </button>
          </div>

          {/* Tabla de todos los pagos asociados al contrato */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-gray-50">
                <tr>
                  {['Fecha', 'Concepto', 'Monto Total', 'Monto Abono', 'Restante (Contrato)', 'Método', 'Estado', 'Acciones']
                    .map(h => <th key={h} className="px-2 py-2 text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {contractData.contrato.pagos.length > 0 ? (
                  contractData.contrato.pagos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2 whitespace-nowrap">{p.fecha}</td>
                      <td className="px-2 py-2 text-left">{p.concepto}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{formatCurrency(p.montoTotal)}</td> {/* Monto total del contrato */}
                      <td className="px-2 py-2 whitespace-nowrap">{formatCurrency(p.montoAbonado)}</td> {/* Monto de ESTE abono */}
                      <td className="px-2 py-2 whitespace-nowrap">{formatCurrency(p.montoRestante)}</td> {/* Restante del contrato DESPUÉS de este abono */}
                      <td className="px-2 py-2">{p.metodoPago}</td>
                      <td className="px-2 py-2">{p.estado}</td>
                      <td className="px-2 py-2">
                        {/* {p.estado?.toLowerCase() === 'registrado' && ( */}
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleCancelPaymentInModal(p.id)}
                            title="Cancelar pago"
                          >
                            <FaMinusCircle size={16} />
                          </button>
                        
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                      No hay pagos registrados para este contrato aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Botones finales */}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cerrar</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatePaymentsModal;