import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import SearchSelector from '../../products_sale/components/SearchSelector';

const inputBaseStyle = 'block w-full text-sm text-gray-500 border rounded-lg shadow-sm p-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const NewQuoteModal = ({ isOpen, onClose, onSave, clients, products, services }) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(parsedNum) ? '0' : new Intl.NumberFormat('es-ES').format(parsedNum);
  };

  const today = new Date().toISOString().split('T')[0];
  const [nombreCotizacion, setNombreCotizacion] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [cliente, setCliente] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [metodoProductoSeleccionado, setMetodoProductoSeleccionado] = useState('');
  const [productoSel, setProductoSel] = useState(null);
  const [cantidadProducto, setCantidadProducto] = useState('');
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [servicioSel, setServicioSel] = useState(null);
  const [cantidadServicio, setCantidadServicio] = useState('');
  const [serviciosAgregados, setServiciosAgregados] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    const newErrors = { ...errores };
    // Limpiar errores del servidor cuando el usuario modifica campos
    if (newErrors.servidor) delete newErrors.servidor;
    
    switch (name) {
      case 'nombreCotizacion':
        if (!value?.trim()) {
          newErrors.nombre = 'El nombre de la cotización es obligatorio';
        } else if (value.trim().length < 3) {
          newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
        } else {
          delete newErrors.nombre;
        }
        break;
      case 'clienteSeleccionado':
        if (!value) {
          newErrors.cliente = 'Selecciona un cliente';
        } else {
          delete newErrors.cliente;
        }
        break;
      case 'fechaVencimiento':
        if (!value) {
          newErrors.fecha = 'Selecciona la fecha de vencimiento';
        } else if (new Date(value) < new Date(new Date().setHours(0, 0, 0, 0))) {
          newErrors.fecha = 'La fecha de vencimiento no puede ser anterior a hoy';
        } else {
          delete newErrors.fecha;
        }
        break;
      case 'cantidadProducto':
        if (value && Number(value) <= 0) {
          newErrors.cantidadProducto = 'La cantidad debe ser mayor a 0';
        } else {
          delete newErrors.cantidadProducto;
        }
        break;
      case 'cantidadServicio':
        if (value && Number(value) <= 0) {
          newErrors.cantidadServicio = 'La cantidad debe ser mayor a 0';
        } else {
          delete newErrors.cantidadServicio;
        }
        break;
      default:
        break;
    }
    setErrores(newErrors);
  };

  useEffect(() => {
    if (!isOpen) {
      // Limpiar estado al cerrar
      setNombreCotizacion('');
      setClienteSeleccionado('');
      setCliente(null);
      setFechaVencimiento('');
      setProductosAgregados([]);
      setServiciosAgregados([]);
      setObservaciones('');
      setErrores({});
      return;
    }
    // Fecha de vencimiento por defecto +7 días
    const today = new Date();
    const plus7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const y = plus7.getFullYear();
    const m = String(plus7.getMonth() + 1).padStart(2, '0');
    const d = String(plus7.getDate()).padStart(2, '0');
    setFechaVencimiento(`${y}-${m}-${d}`);
  }, [isOpen]);

  // Cliente seleccionado (objeto)
  useEffect(() => {
    if (clienteSeleccionado === '') {
      setCliente(null);
      return;
    }
    const found = clients?.find(c => c.id_cliente === Number(clienteSeleccionado));
    setCliente(found || null);
  }, [clienteSeleccionado, clients]);

  // Producto seleccionado (objeto)
  useEffect(() => {
    if (metodoProductoSeleccionado === '') {
      setProductoSel(null);
      return;
    }
    const found = products?.find(p => p.id_producto === Number(metodoProductoSeleccionado));
    setProductoSel(found || null);
  }, [metodoProductoSeleccionado, products]);

  // Servicio seleccionado (objeto)
  useEffect(() => {
    if (servicioSeleccionado === '') {
      setServicioSel(null);
      return;
    }
    // servicios vienen con id_servicio
    const found = services?.find(s => s.id_servicio === Number(servicioSeleccionado) || s.id === Number(servicioSeleccionado));
    setServicioSel(found || null);
  }, [servicioSeleccionado, services]);

  if (!isOpen) return null;

  const handleAgregarProducto = () => {
    // Validar producto seleccionado
    if (!productoSel) {
      setErrores(prev => ({ ...prev, producto: 'Selecciona un producto' }));
      return;
    }
    
    // Validar cantidad
    if (!cantidadProducto || Number(cantidadProducto) <= 0) {
      setErrores(prev => ({ ...prev, producto: 'Ingresa una cantidad válida mayor a 0' }));
      validateField('cantidadProducto', cantidadProducto);
      return;
    }

    const cantidad = Number(cantidadProducto);
    
    // Validar stock
    if (productoSel.stock !== undefined && productoSel.stock < cantidad) {
      setErrores(prev => ({ ...prev, producto: `Stock insuficiente. Disponible: ${productoSel.stock}` }));
      return;
    }
    
    const idx = productosAgregados.findIndex(p => p.id_producto === productoSel.id_producto);
    if (idx !== -1) {
      const copy = [...productosAgregados];
      const exist = copy[idx];
      const nuevaCantidad = exist.cantidad + cantidad;
      
      // Validar stock con la nueva cantidad total
      if (productoSel.stock !== undefined && productoSel.stock < nuevaCantidad) {
        setErrores(prev => ({ ...prev, producto: `Stock insuficiente. Disponible: ${productoSel.stock}, ya agregado: ${exist.cantidad}` }));
        return;
      }
      
      copy[idx] = { ...exist, cantidad: nuevaCantidad, subtotal: nuevaCantidad * exist.precio };
      setProductosAgregados(copy);
    } else {
      setProductosAgregados(prev => ([
        ...prev,
        {
          id_producto: productoSel.id_producto,
          nombre: productoSel.nombre,
          modelo: productoSel.modelo,
          precio: productoSel.precio,
          cantidad: cantidad,
          subtotal: cantidad * productoSel.precio,
          unidad_medida: productoSel.unidad_medida,
        }
      ]));
    }
    
    // Limpiar campos y errores
    setMetodoProductoSeleccionado('');
    setProductoSel(null);
    setCantidadProducto('');
    setErrores(prev => {
      const newErrs = { ...prev };
      delete newErrs.producto;
      delete newErrs.cantidadProducto;
      return newErrs;
    });
  };

  const handleAgregarServicio = () => {
    // Validar servicio seleccionado
    if (!servicioSel) {
      setErrores(prev => ({ ...prev, servicio: 'Selecciona un servicio' }));
      return;
    }
    
    // Validar cantidad
    if (!cantidadServicio || Number(cantidadServicio) <= 0) {
      setErrores(prev => ({ ...prev, servicio: 'Ingresa una cantidad válida mayor a 0' }));
      validateField('cantidadServicio', cantidadServicio);
      return;
    }

    const cantidad = Number(cantidadServicio);
    const idx = serviciosAgregados.findIndex(s => (s.id_servicio ?? s.id) === (servicioSel.id_servicio ?? servicioSel.id));
    
    if (idx !== -1) {
      const copy = [...serviciosAgregados];
      const exist = copy[idx];
      const nuevaCantidad = exist.cantidad + cantidad;
      copy[idx] = { ...exist, cantidad: nuevaCantidad, subtotal: nuevaCantidad * exist.precio };
      setServiciosAgregados(copy);
    } else {
      const idServicio = servicioSel.id_servicio ?? servicioSel.id;
      setServiciosAgregados(prev => ([
        ...prev,
        {
          id_servicio: idServicio,
          nombre: servicioSel.nombre,
          precio: servicioSel.precio,
          cantidad: cantidad,
          subtotal: cantidad * servicioSel.precio,
        }
      ]));
    }
    
    // Limpiar campos y errores
    setServicioSeleccionado('');
    setServicioSel(null);
    setCantidadServicio('');
    setErrores(prev => {
      const newErrs = { ...prev };
      delete newErrs.servicio;
      delete newErrs.cantidadServicio;
      return newErrs;
    });
  };

  const subtotalProductos = useMemo(() => productosAgregados.reduce((acc, p) => acc + p.subtotal, 0), [productosAgregados]);
  const subtotalServicios = useMemo(() => serviciosAgregados.reduce((acc, s) => acc + s.subtotal, 0), [serviciosAgregados]);
  const iva = useMemo(() => (subtotalProductos + subtotalServicios) * 0.19, [subtotalProductos, subtotalServicios]);
  const total = useMemo(() => subtotalProductos + subtotalServicios + iva, [subtotalProductos, subtotalServicios, iva]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpiar errores previos del servidor
    setErrores(prev => {
      const newErrs = { ...prev };
      delete newErrs.servidor;
      return newErrs;
    });

    // Validar todos los campos
    const errs = {};
    if (!nombreCotizacion?.trim()) {
      errs.nombre = 'El nombre de la cotización es obligatorio';
    } else if (nombreCotizacion.trim().length < 3) {
      errs.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!cliente || !clienteSeleccionado) {
      errs.cliente = 'Selecciona un cliente';
    }
    
    if (!fechaVencimiento) {
      errs.fecha = 'Selecciona la fecha de vencimiento';
    } else if (new Date(fechaVencimiento) < new Date(new Date().setHours(0, 0, 0, 0))) {
      errs.fecha = 'La fecha de vencimiento no puede ser anterior a hoy';
    }
    
    if (productosAgregados.length === 0) {
      errs.productos = 'Agrega al menos un producto';
    }
    if (serviciosAgregados.length === 0) {
      errs.servicios = 'Agrega al menos un servicio';
    }

    // Si hay errores, mostrarlos y NO continuar
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      
      // Hacer scroll al primer error después de que se actualice el DOM
      setTimeout(() => {
        const firstErrorField = document.querySelector('.border-red-500');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Si no hay campo con borde rojo, buscar el primer mensaje de error
          const firstErrorMsg = document.querySelector('.text-red-500');
          if (firstErrorMsg) {
            firstErrorMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
      
      // NO continuar - el formulario NO se enviará
      return;
    }

    // Si llegamos aquí, no hay errores de validación
    setLoading(true);
    
    try {
      const payload = {
        nombre_cotizacion: nombreCotizacion.trim(),
        id_cliente: Number(clienteSeleccionado),
        fecha_vencimiento: new Date(fechaVencimiento).toISOString(),
        estado: 'Pendiente',
        observaciones: observaciones.trim() || undefined,
        detalles: [
          ...productosAgregados.map(p => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
          ...serviciosAgregados.map(s => ({ id_servicio: s.id_servicio, cantidad: s.cantidad })),
        ],
      };

      await onSave(payload);
      // Si onSave no lanza error, el modal se cerrará desde el componente padre
    } catch (error) {
      // Manejar errores del servidor
      const errorMessage = error?.response?.data?.message || error?.message || 'Ocurrió un error al crear la cotización';
      setErrores(prev => ({
        ...prev,
        servidor: errorMessage
      }));
      
      // Hacer scroll al error del servidor
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error-servidor]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scroll" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">Crear Cotización</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2">
            <FaTimes />
          </button>
        </header>

        <form className="p-6 space-y-6" onSubmit={handleGuardar} noValidate>
          {/* Mensaje de error del servidor */}
          {errores.servidor && (
            <div 
              data-error-servidor
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{errores.servidor}</p>
                </div>
              </div>
            </div>
          )}

          <FormSection title="Información General">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <FormLabel htmlFor="nombreCotizacion">Nombre de la cotización <span className="text-red-500">*</span></FormLabel>
                <input
                  id="nombreCotizacion"
                  type="text"
                  value={nombreCotizacion}
                  onChange={(e) => { setNombreCotizacion(e.target.value); validateField('nombreCotizacion', e.target.value); }}
                  className={`${inputBaseStyle} ${errores.nombre ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ej. Sistema CCTV para Sede Norte"
                />
                {errores.nombre && <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>}
              </div>
              <div className="md:col-span-1">
                <SearchSelector
                  options={clients || []}
                  value={clienteSeleccionado}
                  onChange={(value) => { setClienteSeleccionado(value); validateField('clienteSeleccionado', value); }}
                  placeholder="Buscar cliente por nombre o documento..."
                  displayKey={(client) => `${client.nombre} ${client.apellido}`}
                  searchKeys={[ 'nombre', 'apellido', 'documento' ]}
                  error={errores.cliente}
                  label="Cliente"
                  required={true}
                />
              </div>
              <div className="md:col-span-1">
                <FormLabel htmlFor="fechaVenc">Fecha de vencimiento <span className="text-red-500">*</span></FormLabel>
                <input
                  id="fechaVenc"
                  type="date"
                  value={fechaVencimiento}
                  min={today}
                  onChange={(e) => { setFechaVencimiento(e.target.value); validateField('fechaVencimiento', e.target.value); }}
                  className={`${inputBaseStyle} ${errores.fecha ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errores.fecha && <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>}
              </div>
            </div>
            {cliente && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Nombre:</strong> {cliente.nombre} {cliente.apellido}</p>
                <p><strong>Documento:</strong> {cliente.documento}</p>
                <p><strong>Email:</strong> {cliente.correo}</p>
                <p><strong>Celular:</strong> {cliente.telefono}</p>
              </div>
            )}
          </FormSection>

          <FormSection title="Productos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SearchSelector
                  options={products || []}
                  value={metodoProductoSeleccionado}
                  onChange={(value) => { setMetodoProductoSeleccionado(value); setErrores(prev => ({ ...prev, producto: null })); }}
                  placeholder="Buscar producto por nombre, modelo o código..."
                  displayKey={(product) => `${product.nombre} - ${product.modelo}`}
                  searchKeys={[ 'nombre', 'modelo', 'codigo_barra' ]}
                  error={errores.producto}
                  label="Producto"
                  required={false}
                />
              </div>
              <div>
                <FormLabel htmlFor="cantidadProducto">Cantidad</FormLabel>
                <div className="flex gap-2">
                  <input
                    id="cantidadProducto"
                    type="number"
                    min="1"
                    value={cantidadProducto}
                    onChange={(e) => { 
                      setCantidadProducto(e.target.value); 
                      validateField('cantidadProducto', e.target.value);
                      setErrores(prev => {
                        const newErrs = { ...prev };
                        if (newErrs.producto && e.target.value && Number(e.target.value) > 0) {
                          delete newErrs.producto;
                        }
                        return newErrs;
                      });
                    }}
                    className={`${inputBaseStyle} ${errores.producto || errores.cantidadProducto ? 'border-red-500' : 'border-gray-300'}`}
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
              {errores.cantidadProducto && (
                <p className="text-red-500 text-sm mt-1">{errores.cantidadProducto}</p>
              )}
            </div>
            {productoSel && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Producto:</strong> {productoSel.nombre}</p>
                <p><strong>Modelo:</strong> {productoSel.modelo}</p>
                <p><strong>Precio:</strong> ${productoSel.precio?.toLocaleString?.() ?? productoSel.precio}</p>
                {productoSel.stock !== undefined && <p><strong>Stock disponible:</strong> {productoSel.stock}</p>}
                <p><strong>Código:</strong> {productoSel.codigo_barra || 'Sin código'}</p>
              </div>
            )}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-center border border-gray-200">
                <thead className="bg-conv3r-dark text-white">
                  <tr>
                    <th className="p-3 font-semibold">Producto</th>
                    <th className="font-semibold">Modelo</th>
                    <th className="font-semibold">Unidad</th>
                    <th className="font-semibold">Cantidad</th>
                    <th className="font-semibold">Precio Unitario</th>
                    <th className="font-semibold">Subtotal</th>
                    <th className="p-3">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-gray-700">
                  {productosAgregados.map((p, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="p-3">{p.nombre}</td>
                      <td className="p-3">{p.modelo}</td>
                      <td className="p-3">{p.unidad_medida || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...productosAgregados];
                              if (copy[idx].cantidad > 1) {
                                copy[idx].cantidad -= 1;
                                copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                                setProductosAgregados(copy);
                                // Limpiar errores al modificar cantidad
                                setErrores(prev => {
                                  const newErrs = { ...prev };
                                  delete newErrs.producto;
                                  return newErrs;
                                });
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
                              const copy = [...productosAgregados];
                              const productoOriginal = products?.find(p => p.id_producto === copy[idx].id_producto);
                              
                              // Validar stock antes de incrementar
                              if (productoOriginal?.stock !== undefined) {
                                const nuevaCantidad = copy[idx].cantidad + 1;
                                if (productoOriginal.stock < nuevaCantidad) {
                                  setErrores(prev => ({ 
                                    ...prev, 
                                    producto: `Stock insuficiente. Disponible: ${productoOriginal.stock}` 
                                  }));
                                  return;
                                }
                              }
                              
                              copy[idx].cantidad += 1;
                              copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                              setProductosAgregados(copy);
                              // Limpiar errores al modificar cantidad
                              setErrores(prev => {
                                const newErrs = { ...prev };
                                delete newErrs.producto;
                                return newErrs;
                              });
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">${formatNumber(p.precio)}</td>
                      <td className="p-3">${formatNumber(p.subtotal)}</td>
                      <td className="w-12">
                        <button
                          type="button"
                          onClick={() => { 
                            const copy = [...productosAgregados]; 
                            copy.splice(idx, 1); 
                            setProductosAgregados(copy);
                            // Limpiar error de detalles si ya hay servicios o productos
                            setErrores(prev => {
                              const newErrs = { ...prev };
                              if (newErrs.detalles && (copy.length > 0 || serviciosAgregados.length > 0)) {
                                delete newErrs.detalles;
                              }
                              return newErrs;
                            });
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
                    <td colSpan="6" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                    <td className="font-bold px-4 py-2 text-right text-conv3r-gold">
                      ${subtotalProductos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {errores.productos && <p className="text-red-500 text-sm mt-2">{errores.productos}</p>}
              {errores.producto && <p className="text-red-500 text-sm mt-2">{errores.producto}</p>}
            </div>
          </FormSection>

          <FormSection title="Servicios">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <SearchSelector
                  options={services || []}
                  value={servicioSeleccionado}
                  onChange={(value) => { setServicioSeleccionado(value); setErrores(prev => ({ ...prev, servicio: null })); }}
                  placeholder="Buscar servicio por nombre..."
                  displayKey={(s) => `${s.nombre}`}
                  searchKeys={[ 'nombre', 'descripcion' ]}
                  error={errores.servicio}
                  label="Servicio"
                  required={false}
                />
              </div>
              <div>
                <FormLabel htmlFor="cantidadServicio">Cantidad</FormLabel>
                <div className="flex gap-2">
                  <input
                    id="cantidadServicio"
                    type="number"
                    min="1"
                    value={cantidadServicio}
                    onChange={(e) => { 
                      setCantidadServicio(e.target.value); 
                      validateField('cantidadServicio', e.target.value);
                      setErrores(prev => {
                        const newErrs = { ...prev };
                        if (newErrs.servicio && e.target.value && Number(e.target.value) > 0) {
                          delete newErrs.servicio;
                        }
                        return newErrs;
                      });
                    }}
                    className={`${inputBaseStyle} ${errores.servicio || errores.cantidadServicio ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Cantidad"
                  />
                  <button
                    type="button"
                    onClick={handleAgregarServicio}
                    className="inline-flex items-center justify-center w-10 h-10 text-sm font-semibold text-white bg-conv3r-dark hover:bg-conv3r-dark-700 px-2 py-2 rounded-lg shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              {errores.cantidadServicio && (
                <p className="text-red-500 text-sm mt-1">{errores.cantidadServicio}</p>
              )}
            </div>
            {servicioSel && (
              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Servicio:</strong> {servicioSel.nombre}</p>
                <p><strong>Precio:</strong> ${servicioSel.precio?.toLocaleString?.() ?? servicioSel.precio}</p>
                <p><strong>Descripción:</strong> {servicioSel.descripcion}</p>
              </div>
            )}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-center border border-gray-200">
                <thead className="bg-conv3r-dark text-white">
                  <tr>
                    <th className="p-3 font-semibold">Servicio</th>
                    <th className="font-semibold">Cantidad</th>
                    <th className="font-semibold">Precio Unitario</th>
                    <th className="font-semibold">Subtotal</th>
                    <th className="p-3">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-gray-700">
                  {serviciosAgregados.map((s, idx) => (
                    <tr key={idx} className="border-t border-gray-200">
                      <td className="p-3">{s.nombre}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...serviciosAgregados];
                              if (copy[idx].cantidad > 1) {
                                copy[idx].cantidad -= 1;
                                copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                                setServiciosAgregados(copy);
                              }
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="w-8 text-center">{s.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...serviciosAgregados];
                              copy[idx].cantidad += 1;
                              copy[idx].subtotal = copy[idx].cantidad * copy[idx].precio;
                              setServiciosAgregados(copy);
                            }}
                            className="text-gray-600 hover:text-gray-800 p-1"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="p-3">${formatNumber(s.precio)}</td>
                      <td className="p-3">${formatNumber(s.subtotal)}</td>
                      <td className="w-12">
                        <button
                          type="button"
                          onClick={() => { 
                            const copy = [...serviciosAgregados]; 
                            copy.splice(idx, 1); 
                            setServiciosAgregados(copy);
                            // Limpiar error de detalles si ya hay servicios o productos
                            setErrores(prev => {
                              const newErrs = { ...prev };
                              if (newErrs.detalles && (copy.length > 0 || productosAgregados.length > 0)) {
                                delete newErrs.detalles;
                              }
                              return newErrs;
                            });
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
                    <td colSpan="4" className="text-right font-semibold px-4 py-2">Subtotal:</td>
                    <td className="font-bold px-4 py-2 text-right text-conv3r-gold">
                      ${subtotalServicios.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
              {errores.servicios && <p className="text-red-500 text-sm mt-2">{errores.servicios}</p>}
              {errores.servicio && <p className="text-red-500 text-sm mt-2">{errores.servicio}</p>}
            </div>
          </FormSection>

          <FormSection title="Observaciones">
            <div>
              <FormLabel htmlFor="observaciones">Observaciones (opcional)</FormLabel>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingresa observaciones adicionales sobre la cotización..."
                rows="4"
                style={{ resize: 'none' }}
                className={`${inputBaseStyle} resize-none`}
              />
            </div>
          </FormSection>

          <FormSection title="Resumen de Cotización">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Productos:</span>
                <span className="font-semibold text-gray-800">${formatNumber(subtotalProductos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Servicios:</span>
                <span className="font-semibold text-gray-800">${formatNumber(subtotalServicios)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal de cotización:</span>
                <span className="font-semibold text-gray-800">${formatNumber(subtotalProductos + subtotalServicios)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (19%):</span>
                <span className="font-semibold text-gray-800">${formatNumber(iva)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600 font-bold">Total:</span>
                <span className="font-bold text-conv3r-gold">${formatNumber(total)}</span>
              </div>
            </div>
          </FormSection>


          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Guardando...' : 'Guardar cotización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewQuoteModal;


