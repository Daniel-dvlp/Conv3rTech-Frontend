import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

const inputBase = 'w-full p-2.5 border rounded-lg text-sm focus:ring-conv3r-gold focus:border-conv3r-gold';

const CreatePaymentsModal = ({ isOpen, onClose, onAddPago, pagosAgregados = [], onLoadMock, mockPagosIntegrado }) => {
  const [clienteInput, setClienteInput] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [contratoSeleccionado, setContratoSeleccionado] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [pagosContrato, setPagosContrato] = useState([]);
  const [pagosPorGuardar, setPagosPorGuardar] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [mockEnviado, setMockEnviado] = useState(false);

  

  const clientesFiltrados = mockPagosIntegrado.filter(p => {
    const busq = clienteInput.toLowerCase();
    return (
      p.cliente.nombre.toLowerCase().includes(busq) ||
      p.cliente.apellido.toLowerCase().includes(busq) ||
      p.cliente.documento.includes(busq)
    );
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (clienteSeleccionado && contratoSeleccionado) {
      const contrato = clienteSeleccionado.contratos.find(c => c.numero === contratoSeleccionado);
      

      const pagosDelPadre = pagosAgregados.filter(p => p.numeroContrato === contratoSeleccionado);
      const pagosLocales = pagosPorGuardar.filter(p => p.numeroContrato === contratoSeleccionado);

      setPagosContrato([...pagosDelPadre, ...pagosLocales]);
    } else {
      setPagosContrato([]);
    }
  }, [clienteSeleccionado, contratoSeleccionado, pagosAgregados, pagosPorGuardar]);

  const [errores, setErrores] = useState({
    concepto: '',
    monto: '',
    metodoPago: ''
  });

  const handleDescargarPDF = () => {
    if (!contratoSeleccionado || pagosContrato.length === 0) return;

    const doc = new jsPDF();
    const cliente = clienteSeleccionado?.cliente;

    doc.setFontSize(16);
    doc.text('Seguimiento de Pagos del Contrato', 14, 20);
    doc.setFontSize(12);
    doc.text(`Cliente: ${cliente?.nombre} ${cliente?.apellido}`, 14, 30);
    doc.text(`Documento: ${cliente?.documento}`, 14, 38);
    doc.text(`Contrato: ${contratoSeleccionado}`, 14, 46);

    autoTable(doc, {
      startY: 55,
      head: [['Fecha', 'Monto Total', 'Abonado', 'Restante', 'Método', 'Estado', 'Concepto']],
      body: pagosContrato.map(p => [
        p.fecha,
        `$${p.montoTotal.toLocaleString()}`,
        `$${p.montoAbonado.toLocaleString()}`,
        `$${p.montoRestante.toLocaleString()}`,
        p.metodoPago,
        p.estado,
        p.concepto
      ]),
      styles: { fontSize: 10 }
    });

    doc.save(`Pagos_${contratoSeleccionado}.pdf`);
  };

  const handleAgregarAbono = () => {
    const erroresVal = {
      concepto: !concepto ? 'Campo requerido' : '',
      monto: !monto ? 'Campo requerido' : '',
      metodoPago: !metodoPago ? 'Campo requerido' : ''
    };

    if (erroresVal.concepto || erroresVal.monto || erroresVal.metodoPago) {
      setErrores(erroresVal);
      return;
    }

    const contratoBase = clienteSeleccionado.contratos.find(c => c.numero === contratoSeleccionado);
    const montoTotal = contratoBase?.pagos[0]?.montoTotal || 0;

    const pagosDelContrato = [
      ...(contratoBase?.pagos || []),
      ...pagosPorGuardar.filter(p => p.numeroContrato === contratoSeleccionado),
      ...pagosAgregados.filter(p => p.numeroContrato === contratoSeleccionado)
    ];

    const totalAbonado = pagosDelContrato.reduce((sum, pago) => sum + Number(pago.montoAbonado), 0);
    const montoAbono = Number(monto);
    const restante = Math.max(montoTotal - totalAbonado, 0);

    if (montoAbono > restante) {
      setErrores({ monto: `El monto excede el restante ($${restante.toLocaleString()})` });
      return;
    }

    const nuevo = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString(),
      numeroContrato: contratoSeleccionado,
      nombre: clienteSeleccionado.cliente.nombre,
      apellido: clienteSeleccionado.cliente.apellido,
      montoTotal: Number(montoTotal),
      montoAbonado: Number(monto),
      montoRestante: Math.max(montoTotal - totalAbonado - montoAbono, 0),
      metodoPago,
      estado: 'Registrado',
      concepto
    };

    setPagosPorGuardar(prev => [...prev, nuevo]);
    setConcepto('');
    setMonto('');
    setMetodoPago('');
    setErrores({});
    toast.success('Abono agregado correctamente');
  };

  useEffect(() => {
    if (!isOpen) {
      setClienteSeleccionado(null);
      setContratoSeleccionado('');
      setClienteInput('');
      setPagosContrato([]);
      setPagosPorGuardar([]);
      setConcepto('');
      setMonto('');
      setMetodoPago('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !mockEnviado) {
      const pagosTransformados = [];

      mockPagosIntegrado.forEach(entry => {
        const { cliente, contratos } = entry;
        contratos.forEach(c => {
          c.pagos.forEach(p => {
            pagosTransformados.push({
              ...p,
              numeroContrato: c.numero,
              nombre: cliente.nombre,
              apellido: cliente.apellido,
            });
          });
        });
      });

      onLoadMock(pagosTransformados);
      setMockEnviado(true);
    }
  }, [isOpen, mockEnviado, onLoadMock]);

  const handleGuardar = () => {
    if (pagosPorGuardar.length === 0) return;

    onAddPago([...pagosPorGuardar]);
    setPagosPorGuardar([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="flex justify-center items-start p-6 pt-12 h-full overflow-auto">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6" onClick={(e) => e.stopPropagation()}>

          {/* Título */}
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">Registrar Pagos o Abonos</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl"><FaTimes /></button>
          </div>

          {/* Cliente y contrato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" ref={dropdownRef}>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Buscar Cliente</label>
              <input
                value={clienteInput}
                onChange={e => {
                  setClienteInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className={inputBase}
                placeholder="Nombre, apellido o documento"
              />
              {showDropdown && clientesFiltrados.length > 0 && (
                <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow w-full max-h-48 overflow-auto mt-1">
                  {clientesFiltrados.map(cli => (
                    <li
                      key={cli.cliente.id}
                      onClick={() => {
                        setClienteSeleccionado(cli);
                        setClienteInput(`${cli.cliente.nombre} ${cli.cliente.apellido} - ${cli.cliente.documento}`);
                        setShowDropdown(false);
                        setContratoSeleccionado('');
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {cli.cliente.nombre} {cli.cliente.apellido} - {cli.cliente.documento}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">N° de Contrato</label>
              <select
                value={contratoSeleccionado}
                onChange={e => setContratoSeleccionado(e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar...</option>
                {clienteSeleccionado?.contratos.map(c => (
                  <option key={c.numero} value={c.numero}>{c.numero}</option>
                ))}
              </select>
            </div>
          </div>

          {clienteSeleccionado && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 shadow-sm">
              <h3 className="text-blue-800 font-bold text-lg mb-2">Información del Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <p><span className="font-semibold text-gray-700">Documento:</span> {clienteSeleccionado.cliente.documento}</p>
                <p><span className="font-semibold text-gray-700">Nombre:</span> {clienteSeleccionado.cliente.nombre}</p>
                <p><span className="font-semibold text-gray-700">Apellido:</span> {clienteSeleccionado.cliente.apellido}</p>
              </div>
            </div>
          )}

          {/* Formulario de abono */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Concepto</label>
              <input
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                className={inputBase}
              />
              {errores.concepto && <p className="text-red-600 text-xs mt-1">{errores.concepto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Monto a Abonar</label>
              <input
                type="number"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className={inputBase}
              />
              {errores.monto && <p className="text-red-600 text-xs mt-1">{errores.monto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Método de Pago</label>
              <select
                value={metodoPago}
                onChange={e => setMetodoPago(e.target.value)}
                className={inputBase}
              >
                <option value="">Seleccionar...</option>
                <option>Efectivo</option>
                <option>Transferencia</option>
                <option>PSE</option>
                <option>Cheque</option>
                <option>Tarjeta</option>
              </select>
              {errores.metodoPago && <p className="text-red-600 text-xs mt-1">{errores.metodoPago}</p>}
            </div>

            <button
              type="button"
              onClick={handleAgregarAbono}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <FaPlus /> Agregar
            </button>
          </div>

          {clienteSeleccionado && contratoSeleccionado && pagosContrato.length > 0 && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDescargarPDF}
                className="inline-flex items-center gap-2 text-sm font-semibold text-conv3r-dark bg-blue-50 border border-blue-200 mb-3 px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
              >
                <FaFilePdf size={14} /> Descargar PDF
              </button>
            </div>
          )}

          {/* Tabla de pagos */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  {['Fecha', 'Contrato', 'Monto Total', 'Monto Abonado', 'Restante', 'Método', 'Estado', 'Acciones']
                    .map(h => <th key={h} className="p-2 border">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {pagosContrato.map(p => (
                  <tr key={p.id}>
                    <td className="p-2 border">{p.fecha}</td>
                    <td className="p-2 border">{contratoSeleccionado}</td>
                    <td className="p-2 border">{p.montoTotal.toLocaleString()}</td>
                    <td className="p-2 border">{p.montoAbonado.toLocaleString()}</td>
                    <td className="p-2 border">{p.montoRestante.toLocaleString()}</td>
                    <td className="p-2 border">{p.metodoPago}</td>
                    <td className="p-2 border">{p.estado}</td>
                    <td className="p-2 border">
                      <button className='text-red-600 hover:text-red-800'>Cancelar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Botones finales */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentsModal;
