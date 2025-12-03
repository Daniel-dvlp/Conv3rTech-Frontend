import React, { useState, useEffect } from 'react';
import { FaTrash, FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { clientsService } from '../services/salesService';
import SearchSelector from './SearchSelector';

const FormSection = ({ title, children }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const FormLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const NewProductSaleModal = ({ isOpen, onClose, onSave, clients, products }) => {
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [cliente, setCliente] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState('');
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState('');
    const [productosAgregados, setProductosAgregados] = useState([]);
    const [metodoPago, setMetodoPago] = useState('');
    const [fechaVenta, setFechaVenta] = useState('');
    const [errores, setErrores] = useState({});

    const handleKeyDown = (e) => {
        // Prevenir entrada de 'e', 'E', '+', '-' en campos numéricos
        if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
            e.preventDefault();
        }
    };

    // Inicializar fecha y hora con la fecha actual cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setFechaVenta(`${year}-${month}-${day}T${hours}:${minutes}`);
        }
    }, [isOpen]);

    // 🔍 Buscar cliente automáticamente
    useEffect(() => {
        if (clienteSeleccionado === '') {
            setCliente(null);
            return;
        }

        const encontrado = clients?.find(c => c.id_cliente === Number(clienteSeleccionado));
        setCliente(encontrado || null);
        setErrores(prev => ({
            ...prev,
            cliente: encontrado ? null : 'Cliente no encontrado',
        }));
    }, [clienteSeleccionado, clients]);

    // 🔍 Buscar producto automáticamente
    useEffect(() => {
        if (productoSeleccionado === '') {
            setProducto(null);
            return;
        }

        const encontrado = products?.find(p => p.id_producto === Number(productoSeleccionado));
        setProducto(encontrado || null);
        setErrores(prev => ({
            ...prev,
            producto: encontrado ? null : 'Producto no encontrado',
        }));
    }, [productoSeleccionado, products]);

    if (!isOpen) return null;


    const handleAgregarProducto = () => {
        if (producto && cantidad > 0) {
            // Verificar stock disponible
            if (producto.stock < Number(cantidad)) {
                setErrores(prev => ({
                    ...prev,
                    producto: `Stock insuficiente. Disponible: ${producto.stock}`
                }));
                return;
            }

            const indexExistente = productosAgregados.findIndex(p => p.id_producto === producto.id_producto);

            if (indexExistente !== -1) {
                const copia = [...productosAgregados];
                const productoExistente = copia[indexExistente];
                const nuevaCantidad = productoExistente.cantidad + Number(cantidad);

                // Verificar stock total
                if (producto.stock < nuevaCantidad) {
                    setErrores(prev => ({
                        ...prev,
                        producto: `Stock insuficiente. Disponible: ${producto.stock}`
                    }));
                    return;
                }

                copia[indexExistente] = {
                    ...productoExistente,
                    cantidad: nuevaCantidad,
                    subtotal: nuevaCantidad * productoExistente.precio,
                    stock: producto.stock,
                };
                setProductosAgregados(copia);
            } else {
                const nuevo = {
                    id_producto: producto.id_producto,
                    nombre: producto.nombre,
                    modelo: producto.modelo,
                    unidad: producto.unidad_medida,
                    precio: producto.precio,
                    cantidad: Number(cantidad),
                    subtotal: producto.precio * Number(cantidad),
                    stock: producto.stock,
                };
                setProductosAgregados(prev => [...prev, nuevo]);
            }

            setProductoSeleccionado('');
            setProducto(null);
            setCantidad('');
            setErrores(prev => ({ ...prev, producto: null }));
        } else {
            setErrores(prev => ({ ...prev, producto: 'Completa todos los campos del producto' }));
        }
    };


    const subtotal = productosAgregados.reduce((acc, p) => acc + p.subtotal, 0);
    const iva = subtotal * 0.19;
    const monto = subtotal + iva;

    const handleGuardar = () => {
        const nuevosErrores = {};
        if (!cliente) nuevosErrores.cliente = 'Selecciona un cliente';
        if (!metodoPago) nuevosErrores.metodoPago = 'Selecciona un método de pago';
        if (!fechaVenta) nuevosErrores.fechaVenta = 'Selecciona una fecha de venta';
        if (productosAgregados.length === 0) nuevosErrores.productos = 'Agrega al menos un producto';

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length === 0) {
            // Preparar datos para el backend
            const nuevaVenta = {
                id_cliente: Number(clienteSeleccionado),
                metodo_pago: metodoPago,
                fecha_venta: new Date(fechaVenta).toISOString(), // Fecha seleccionada por el usuario
                estado: 'Registrada', // Cambiar a 'Registrada' según el enum del backend
                detalles: productosAgregados.map(prod => ({
                    id_producto: prod.id_producto,
                    cantidad: prod.cantidad
                }))
            };

            console.log('Datos a enviar al backend:', nuevaVenta);
            onSave(nuevaVenta);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Crear Venta</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
                        <FaTimes />
                    </button>
                </header>

                <form className="p-6 space-y-6">
                    <FormSection title="Cliente">
                        <SearchSelector
                            options={clients || []}
                            value={clienteSeleccionado}
                            onChange={(value) => {
                                setClienteSeleccionado(value);
                                setErrores(prev => ({ ...prev, cliente: null }));
                            }}
                            placeholder="Buscar cliente por nombre o documento..."
                            displayKey={(client) => `${client.nombre} ${client.apellido}`}
                            searchKeys={['nombre', 'apellido', 'documento']}
                            error={errores.cliente}
                            label=" Cliente:"
                            required={true}
                        />
                        {cliente && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <p><strong>Nombre:</strong> {cliente.nombre} {cliente.apellido}</p>
                                <p><strong>Documento:</strong> {cliente.documento}</p>
                                <p><strong>Email:</strong> {cliente.correo}</p>
                                <p><strong>Celular:</strong> {cliente.telefono}</p>
                            </div>
                        )}
                    </FormSection>

                    <FormSection title="Información de la venta">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <FormLabel htmlFor="fechaVenta"><span className="text-red-500">*</span> Fecha y hora de venta:</FormLabel>
                                <input
                                    type="datetime-local"
                                    id="fechaVenta"
                                    value={fechaVenta}
                                    max={new Date().toISOString().slice(0, 16)}
                                    onChange={(e) => {
                                        const selectedDateTime = new Date(e.target.value);
                                        const now = new Date();

                                        if (selectedDateTime > now) {
                                            setErrores(prev => ({ ...prev, fechaVenta: 'La fecha y hora no pueden ser futuras' }));
                                            return;
                                        }

                                        setFechaVenta(e.target.value);
                                        setErrores(prev => ({ ...prev, fechaVenta: null }));
                                    }}
                                    onBlur={(e) => {
                                        const selectedDateTime = new Date(e.target.value);
                                        const now = new Date();

                                        if (selectedDateTime > now) {
                                            setErrores(prev => ({ ...prev, fechaVenta: 'La fecha y hora no pueden ser futuras' }));
                                        } else {
                                            setErrores(prev => ({ ...prev, fechaVenta: null }));
                                        }
                                    }}
                                    className={`${inputBaseStyle} ${errores.fechaVenta ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errores.fechaVenta && <p className="text-red-500 text-sm mt-1">{errores.fechaVenta}</p>}
                            </div>
                            <div>
                                <FormLabel htmlFor="metodoPago"><span className="text-red-500">*</span> Método de pago:</FormLabel>
                                <div className="relative">
                                    <select
                                        id="metodoPago"
                                        value={metodoPago}
                                        onChange={(e) => {
                                            setMetodoPago(e.target.value);
                                            setErrores(prev => ({ ...prev, metodoPago: null }));
                                        }}
                                        className={`${inputBaseStyle} appearance-none pr-10 ${errores.metodoPago ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Seleccionar método</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                        <option value="Transferencia">Transferencia</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                {errores.metodoPago && <p className="text-red-500 text-sm mt-1">{errores.metodoPago}</p>}
                            </div>
                        </div>
                    </FormSection>

                    <FormSection title="Productos">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <SearchSelector
                                    options={products || []}
                                    value={productoSeleccionado}
                                    onChange={(value) => {
                                        setProductoSeleccionado(value);
                                        setErrores(prev => ({ ...prev, producto: null }));
                                    }}
                                    placeholder="Buscar producto por nombre, modelo o código..."
                                    displayKey={(product) => `${product.nombre} - ${product.modelo}`}
                                    searchKeys={['nombre', 'modelo', 'codigo_barra']}
                                    error={errores.producto}
                                    label=" Producto:"
                                    required={true}
                                />
                            </div>
                            <div>
                                <FormLabel htmlFor="cantidad">Cantidad:</FormLabel>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        id="cantidad"
                                        value={cantidad}
                                        onChange={(e) => {
                                            setCantidad(e.target.value);
                                            setErrores(prev => ({ ...prev, producto: null }));
                                        }}
                                        onKeyDown={handleKeyDown}
                                        className={`${inputBaseStyle} ${errores.producto ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Cantidad"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAgregarProducto}
                                        className="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-2 py-2 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                            </div>
                        </div>


                        {producto && (
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <p><strong>Producto:</strong> {producto.nombre}</p>
                                <p><strong>Modelo:</strong> {producto.modelo}</p>
                                <p><strong>Precio:</strong> ${producto.precio.toLocaleString()}</p>
                                <p><strong>Stock disponible:</strong> {producto.stock}</p>
                                <p><strong>Código:</strong> {producto.codigo_barra || 'Sin código'}</p>
                            </div>
                        )}

                        <div className="overflow-x-auto mt-6">
                            <table className="w-full text-sm text-center border border-gray-200">
                                <thead className="bg-conv3r-dark text-white">
                                    <tr>
                                        <th className="p-3 font-semibold">Producto</th>
                                        <th className="font-semibold">Modelo</th>
                                        <th className="font-semibold">Unidad</th>
                                        <th className="font-semibold">Cantidad</th>
                                        <th className="font-semibold">Precio Unitario</th>
                                        <th className="p-3">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white text-gray-700">
                                    {productosAgregados.map((p, index) => (
                                        <tr key={index} className="border-t border-gray-200">
                                            <td className="p-3">{p.nombre}</td>
                                            <td className="p-3">{p.modelo}</td>
                                            <td className="p-3">{p.unidad}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const copia = [...productosAgregados];
                                                            if (copia[index].cantidad > 1) {
                                                                copia[index].cantidad -= 1;
                                                                copia[index].subtotal = copia[index].cantidad * copia[index].precio;
                                                                setProductosAgregados(copia);
                                                            }
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 p-1"
                                                    >
                                                        <FaMinus size={12} />
                                                    </button>
                                                    <span className="w-8 text-center">{p.cantidad}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const copia = [...productosAgregados];
                                                            if (copia[index].cantidad < p.stock) {
                                                                copia[index].cantidad += 1;
                                                                copia[index].subtotal = copia[index].cantidad * copia[index].precio;
                                                                setProductosAgregados(copia);
                                                            }
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 p-1"
                                                    >
                                                        <FaPlus size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3">${p.precio.toLocaleString('es-CO')}</td>
                                            <td className="w-12">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const copia = [...productosAgregados];
                                                        copia.splice(index, 1);
                                                        setProductosAgregados(copia);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 border-t text-sm text-gray-700">
                                    <tr>
                                        <td colSpan="5" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                                        <td className="font-bold px-4 py-2 text-right text-conv3r-dark">
                                            ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className="text-right font-semibold px-4 py-2">IVA (19%):</td>
                                        <td className="font-bold px-4 py-2 text-right text-conv3r-dark">
                                            ${iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5" className="text-right font-semibold px-4 py-2">Total:</td>
                                        <td className="font-bold text-conv3r-gold text-lg px-4 py-2 text-right">
                                            ${monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>

                            </table>
                            {errores.productos && <p className="text-red-500 text-sm mt-2">{errores.productos}</p>}
                            {errores.producto && <p className="text-red-500 text-sm mt-2">{errores.producto}</p>}
                        </div>
                    </FormSection>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleGuardar}
                            className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 hover:scale-105 transition-transform"
                        >
                            Guardar y finalizar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProductSaleModal;

