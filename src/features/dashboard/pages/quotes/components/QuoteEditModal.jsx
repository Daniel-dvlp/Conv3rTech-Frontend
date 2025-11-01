import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import SearchSelector from '../../products_sale/components/SearchSelector';
import { quotesService } from '../services/quotesService';

const inputStyle =
  'block w-full text-sm text-gray-700 border border-gray-300 rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-conv3r-gold transition-all';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 mb-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const QuoteEditModal = ({ isOpen, onClose, onSave, quoteToEdit, products, services, clients }) => {
  const [quoteData, setQuoteData] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');

  useEffect(() => {
    if (quoteToEdit) {
      setQuoteData(JSON.parse(JSON.stringify(quoteToEdit))); // deep clone
      // Si viene de backend, precargar selección de cliente (si posible)
      const idCliente = quoteToEdit.id_cliente || quoteToEdit.cliente?.id_cliente || quoteToEdit.clienteData?.id_cliente;
      if (idCliente) setClienteSeleccionado(String(idCliente));
    }
  }, [quoteToEdit]);

  const handleChange = (section, index, field, value) => {
    const updated = [...quoteData.detalleOrden[section]];

    if (field === 'producto' || field === 'servicio') {
      const dataSource = section === 'productos' ? products : services;
      const selected = dataSource.find((item) => item.nombre === value);

      updated[index] = {
        ...updated[index],
        ...(section === 'productos' ? { nombre: value } : { servicio: value }),
        descripcion: selected?.descripcion || '',
        precioUnitario: selected?.precio || 0,
      };
    } else {
      updated[index][field] = field === 'cantidad' ? Number(value) : value;
    }

    const updatedServicios = section === 'servicios' ? updated : quoteData.detalleOrden.servicios;
    const updatedProductos = section === 'productos' ? updated : quoteData.detalleOrden.productos;

    const subtotalServicios = updatedServicios.reduce(
      (acc, item) => acc + item.precioUnitario * item.cantidad,
      0
    );
    const subtotalProductos = updatedProductos.reduce(
      (acc, item) => acc + item.precioUnitario * item.cantidad,
      0
    );
    const iva = Math.round((subtotalServicios + subtotalProductos) * 0.19);
    const total = subtotalServicios + subtotalProductos + iva;

    setQuoteData((prev) => ({
      ...prev,
      detalleOrden: {
        ...prev.detalleOrden,
        [section]: updated,
        subtotalServicios,
        subtotalProductos,
        iva,
        total,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Si es una cotización del backend, actualizar vía API sólo campos base
    if (quoteData?.id_cotizacion) {
      try {
        const payload = {
          nombre_cotizacion: quoteData.nombre_cotizacion,
          id_cliente: clienteSeleccionado ? Number(clienteSeleccionado) : (quoteData.id_cliente || undefined),
          fecha_vencimiento: quoteData.fecha_vencimiento || undefined,
          estado: quoteData.estado,
        };
        const cleaned = Object.fromEntries(Object.entries(payload).filter(([, v]) => typeof v !== 'undefined'));
        await quotesService.updateQuote(quoteData.id_cotizacion, cleaned);
        onSave({ ...quoteData, ...cleaned });
      } catch (err) {
        console.error('Error actualizando cotización', err);
      }
      onClose();
      return;
    }
    // Compatibilidad con mocks
    onSave(quoteData);
    onClose();
  };

  if (!isOpen || !quoteData) return null;

  const renderClientInfo = () => {
    const { clienteData } = quoteData;
    return (
      <FormSection title="Información general">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p>Cliente: {`${clienteData.nombre} ${clienteData.apellido}`}</p>
          <p>Documento: {clienteData.documento}</p>
          <p>Correo electrónico: {clienteData.email}</p>
        </div>
      </FormSection>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <header className="flex justify-between items-center p-4 border-b">
            <h2 className="text-3xl font-bold text-gray-800">
              Editar Cotización #{quoteData.ordenServicio}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl p-2"
            >
              <FaTimes />
            </button>
          </header>

          <div className="p-6 space-y-6">
            {/* Si viene de backend, permitir cambiar datos base; con mocks mostrar info de cliente */}
            {quoteData.id_cotizacion ? (
              <FormSection title="Información general">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la cotización</label>
                    <input
                      type="text"
                      value={quoteData.nombre_cotizacion || ''}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, nombre_cotizacion: e.target.value }))}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <SearchSelector
                      options={clients || []}
                      value={clienteSeleccionado}
                      onChange={(value) => setClienteSeleccionado(value)}
                      placeholder="Buscar cliente por nombre o documento..."
                      displayKey={(client) => `${client.nombre} ${client.apellido}`}
                      searchKeys={['nombre', 'apellido', 'documento']}
                      label="Cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                    <input
                      type="date"
                      value={(quoteData.fecha_vencimiento || '').slice(0, 10)}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={quoteData.estado}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, estado: e.target.value }))}
                      className={inputStyle}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobada">Aprobada</option>
                      <option value="Rechazada">Rechazada</option>
                    </select>
                  </div>
                </div>
              </FormSection>
            ) : (
              renderClientInfo()
            )}

            {!quoteData.id_cotizacion && (
            <FormSection title="Servicios">
              {quoteData.detalleOrden.servicios.map((serv, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                >
                  <select
                    value={serv.servicio}
                    onChange={(e) =>
                      handleChange('servicios', index, 'servicio', e.target.value)
                    }
                    className={inputStyle}
                  >
                    <option value="">Selecciona un servicio</option>
                    {services.map((s, i) => (
                      <option key={i} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                  <input type="text" value={serv.descripcion} className={inputStyle} disabled />
                  <input
                    type="number"
                    value={serv.cantidad}
                    onChange={(e) =>
                      handleChange('servicios', index, 'cantidad', e.target.value)
                    }
                    className={inputStyle}
                  />
                  <input type="number" value={serv.precioUnitario} className={inputStyle} disabled />
                  <p className="text-left font-semibold text-conv3r-dark">
                    ${(serv.precioUnitario * serv.cantidad).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setQuoteData((prev) => ({
                    ...prev,
                    detalleOrden: {
                      ...prev.detalleOrden,
                      servicios: [
                        ...prev.detalleOrden.servicios,
                        { servicio: '', descripcion: '', cantidad: 1, precioUnitario: 0 },
                      ],
                    },
                  }))
                }
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark px-4 py-2 rounded-lg"
              >
                <FaPlus size={12} /> Agregar servicio
              </button>
            </FormSection>
            )}

            {!quoteData.id_cotizacion && (
            <FormSection title="Productos">
              {quoteData.detalleOrden.productos.map((prod, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                >
                  <select
                    value={prod.nombre}
                    onChange={(e) =>
                      handleChange('productos', index, 'producto', e.target.value)
                    }
                    className={inputStyle}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((p, i) => (
                      <option key={i} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={prod.cantidad}
                    onChange={(e) =>
                      handleChange('productos', index, 'cantidad', e.target.value)
                    }
                    className={inputStyle}
                  />
                  <input type="number" value={prod.precioUnitario} className={inputStyle} disabled />
                  <p className="text-left font-semibold text-conv3r-dark">
                    ${(prod.precioUnitario * prod.cantidad).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setQuoteData((prev) => ({
                    ...prev,
                    detalleOrden: {
                      ...prev.detalleOrden,
                      productos: [
                        ...prev.detalleOrden.productos,
                        { nombre: '', cantidad: 1, precioUnitario: 0 },
                      ],
                    },
                  }))
                }
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-white bg-conv3r-dark px-4 py-2 rounded-lg"
              >
                <FaPlus size={12} /> Agregar producto
              </button>
            </FormSection>
            )}

            {!quoteData.id_cotizacion && (
            <FormSection title="Totales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800 text-sm">
                <p>
                  <strong>Subtotal productos:</strong>{' '}
                  ${quoteData.detalleOrden.subtotalProductos.toLocaleString('es-CO')}
                </p>
                <p>
                  <strong>Subtotal servicios:</strong>{' '}
                  ${quoteData.detalleOrden.subtotalServicios.toLocaleString('es-CO')}
                </p>
                <p>
                  <strong>IVA (19%):</strong> ${quoteData.detalleOrden.iva.toLocaleString('es-CO')}
                </p>
                <p className="text-conv3r-gold font-bold text-lg">
                  <strong>Total:</strong> ${quoteData.detalleOrden.total.toLocaleString('es-CO')}
                </p>
              </div>
            </FormSection>
            )}

            {!quoteData.id_cotizacion && (
              <FormSection title="Estado de la Cotización">
                <select
                  value={quoteData.estado}
                  onChange={(e) =>
                    setQuoteData((prev) => ({ ...prev, estado: e.target.value }))
                  }
                  className={inputStyle}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobada">Aprobada</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </FormSection>
            )}
          </div>

          <div className="flex justify-end gap-4 p-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 hover:scale-105 transition-transform"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteEditModal;
