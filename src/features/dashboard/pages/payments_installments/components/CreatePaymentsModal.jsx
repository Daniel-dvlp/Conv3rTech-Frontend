import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const inputBase = "w-full p-2.5 border rounded-lg text-sm focus:ring-conv3r-gold focus:border-conv3r-gold";

const CreatePaymentsModal = ({ isOpen, onClose }) => {
    const [clienteInput, setClienteInput] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [contratoSeleccionado, setContratoSeleccionado] = useState('');
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [pagosContrato, setPagosContrato] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

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
                            estado: 'En curso',
                            concepto: 'Mantenimiento Cámaras'
                        }
                    ]
                },
                {
                    numero: 'VD-00001',
                    pagos: [
                        {
                            id: 1,
                            fecha: '02/03/2025',
                            montoTotal: 5000000,
                            montoAbonado: 1000000,
                            montoRestante: 4000000,
                            metodoPago: 'Tarjeta',
                            estado: 'En curso',
                            concepto: 'Mantenimiento Cámaras'
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
                            id: 2,
                            fecha: '10/03/2025',
                            montoTotal: 3000000,
                            montoAbonado: 3000000,
                            montoRestante: 0,
                            metodoPago: 'Transferencia',
                            estado: 'Pagado',
                            concepto: 'Instalación DVR'
                        }
                    ]
                }
            ]
        }
    ];

    const clientesFiltrados = mockPagosIntegrado.filter(p => {
        const busqueda = clienteInput.toLowerCase();
        return (
            p.cliente.nombre.toLowerCase().includes(busqueda) ||
            p.cliente.apellido.toLowerCase().includes(busqueda) ||
            p.cliente.documento.includes(busqueda)
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
            setPagosContrato(contrato ? contrato.pagos : []);
        } else {
            setPagosContrato([]);
        }
    }, [clienteSeleccionado, contratoSeleccionado]);

    const handleAgregarAbono = () => {
        if (!concepto || !monto || !metodoPago || !clienteSeleccionado || !contratoSeleccionado) return;
        const nuevo = {
            id: Date.now(),
            fecha: new Date().toLocaleDateString(),
            montoTotal: 0,
            montoAbonado: Number(monto),
            montoRestante: 0,
            metodoPago,
            estado: 'Registrado',
            concepto
        };
        const updated = clienteSeleccionado.contratos.map(c => {
            if (c.numero === contratoSeleccionado) {
                return { ...c, pagos: [...c.pagos, nuevo] };
            }
            return c;
        });
        setClienteSeleccionado({ ...clienteSeleccionado, contratos: updated });
        setPagosContrato(prev => [...prev, nuevo]);
        setMonto('');
        setConcepto('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-6 pt-12 z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold">Registrar Pagos o Abonos</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">
                        <FaTimes />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" ref={dropdownRef}>
                    <div className="relative">
                        <label className="block text-sm font-medium mb-1">Buscar Cliente</label>
                        <input
                            type="text"
                            value={clienteInput}
                            onChange={e => {
                                setClienteInput(e.target.value);
                                setShowDropdown(true);
                            }}
                            className={inputBase}
                            placeholder="Nombre, apellido o documento"
                            onFocus={() => setShowDropdown(true)}
                        />
                        {showDropdown && clientesFiltrados.length > 0 && (
                            <ul className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow w-full max-h-48 overflow-auto mt-1">
                                {clientesFiltrados.map((cliente) => (
                                    <li
                                        key={cliente.cliente.id}
                                        onClick={() => {
                                            setClienteSeleccionado(cliente);
                                            setClienteInput(`${cliente.cliente.nombre} ${cliente.cliente.apellido} - ${cliente.cliente.documento}`);
                                            setMostrarSugerencias(false);
                                            setContratoSeleccionado('');
                                        }}
                                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                    >
                                        {cliente.cliente.nombre} {cliente.cliente.apellido} - {cliente.cliente.documento}
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
                    <div className="bg-gray-50 p-4 rounded-md border mb-6">
                        <p><strong>Documento:</strong> {clienteSeleccionado.cliente.documento}</p>
                        <p><strong>Nombre:</strong> {clienteSeleccionado.cliente.nombre}</p>
                        <p><strong>Apellido:</strong> {clienteSeleccionado.cliente.apellido}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Concepto</label>
                        <input
                            type="text"
                            value={concepto}
                            onChange={e => setConcepto(e.target.value)}
                            className={inputBase}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Monto a Abonar</label>
                        <input
                            type="number"
                            value={monto}
                            onChange={e => setMonto(e.target.value)}
                            className={inputBase}
                        />
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
                    </div>

                    <button
                        type="button"
                        onClick={handleAgregarAbono}
                        className="bg-blue-600 hover:brightness-95 px-4 py-2 rounded text-white font-bold flex items-center justify-center gap-2"
                    >
                        <FaPlus /> Agregar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Fecha</th>
                                <th className="p-2 border">N° Contrato</th>
                                <th className="p-2 border">Monto Total</th>
                                <th className="p-2 border">Monto Abonado</th>
                                <th className="p-2 border">Monto Restante</th>
                                <th className="p-2 border">Método de Pago</th>
                                <th className="p-2 border">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagosContrato.map(p => (
                                <tr key={p.id}>
                                    <td className="p-2 border">{p.id}</td>
                                    <td className="p-2 border">{p.fecha}</td>
                                    <td className="p-2 border">{contratoSeleccionado}</td>
                                    <td className="p-2 border">{p.montoTotal?.toLocaleString()}</td>
                                    <td className="p-2 border">{p.montoAbonado?.toLocaleString()}</td>
                                    <td className="p-2 border">{p.montoRestante?.toLocaleString()}</td>
                                    <td className="p-2 border">{p.metodoPago}</td>
                                    <td className="p-2 border">{p.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => console.log("Guardar pagos:", pagosContrato)}
                        className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePaymentsModal;
