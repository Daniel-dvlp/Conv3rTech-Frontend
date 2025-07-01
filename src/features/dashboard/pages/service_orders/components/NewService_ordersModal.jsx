// src/features/dashboard/pages/service_orders/components/NewServiceOrderModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const NewServiceOrderModal = ({ isOpen, onClose, onSave }) => {
  const initialState = {
    orderId: `OS-${Date.now()}`,
    clientName: '',
    contact: '',
    requestDate: '',
    identifier: '',
    status: 'En proceso',
    services: [],
    products: [],
    subtotal: 0,
    iva: 0,
    total: 0,
    observations: '',
  };

  const [orderData, setOrderData] = useState(initialState);
  const [newService, setNewService] = useState({ service: '', quantity: '', price: '' });
  const [newProduct, setNewProduct] = useState({ product: '', quantity: '', price: '' });

  useEffect(() => {
    const subtotalServices = orderData.services.reduce(
      (sum, s) => sum + (parseFloat(s.price || 0) * parseFloat(s.quantity || 0)), 0);
    const subtotalProducts = orderData.products.reduce(
      (sum, p) => sum + (parseFloat(p.price || 0) * parseFloat(p.quantity || 0)), 0);
    const subtotal = parseFloat((subtotalServices + subtotalProducts).toFixed(2));
    const ivaCalc = parseFloat((subtotal * 0.19).toFixed(2));
    const ivaFinal = orderData.iva !== '' ? parseFloat(orderData.iva) : ivaCalc;
    const totalCalc = parseFloat((subtotal + ivaFinal).toFixed(2));
    setOrderData(prev => ({
      ...prev,
      subtotal,
      iva: ivaFinal,
      total: totalCalc,
    }));
  }, [orderData.services, orderData.products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = () => {
    if (newService.service && newService.quantity && newService.price) {
      setOrderData(prev => ({
        ...prev,
        services: [...prev.services, newService],
      }));
      setNewService({ service: '', quantity: '', price: '' });
    }
  };

  const handleAddProduct = () => {
    if (newProduct.product && newProduct.quantity && newProduct.price) {
      setOrderData(prev => ({
        ...prev,
        products: [...prev.products, newProduct],
      }));
      setNewProduct({ product: '', quantity: '', price: '' });
    }
  };

  const handleDeleteService = (index) => {
    setOrderData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteProduct = (index) => {
    setOrderData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderData.services.length === 0) {
      alert("Debe agregar al menos un servicio antes de guardar la orden.");
      return;
    }
    onSave(orderData);
    setOrderData({ ...initialState, orderId: `OS-${Date.now()}` });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Crear Nueva Orden de Servicio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300">

          {/* ID Orden y Nombre del Cliente */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 relative">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Orden (generado automáticamente)</label>
              <input type="text" value={orderData.orderId} disabled className={`${inputBaseStyle} bg-gray-100`} />
            </div>

            <div className="flex-1 relative mt-4 sm:mt-0">
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
              <input
                id="clientName"
                type="text"
                name="clientName"
                value={orderData.clientName}
                onChange={handleChange}
                className={inputBaseStyle}
                required
              />
            </div>

            <button
              type="button"
              className="absolute right-0 sm:static sm:ml-auto mt-2 sm:mt-0 text-green-600 hover:text-green-800 text-xl p-2"
              title="Registrar nuevo cliente"
            >
              <FaPlus className="rounded-full border border-green-600 p-1" size={24} />
            </button>
          </div>

          {/* Identificador del Proyecto */}
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Identificador del Proyecto (opcional)
            </label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              value={orderData.identifier}
              onChange={handleChange}
              className={inputBaseStyle}
            />
          </div>

          {/* Contacto */}
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Número de Contacto</label>
            <input id="contact" type="tel" name="contact" value={orderData.contact} onChange={handleChange} className={inputBaseStyle} required />
          </div>

          {/* Fecha de Solicitud */}
          <div>
            <label htmlFor="requestDate" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Solicitud</label>
            <input id="requestDate" type="date" name="requestDate" value={orderData.requestDate} onChange={handleChange} className={inputBaseStyle} required />
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Servicios Solicitados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input type="text" placeholder="Servicio" value={newService.service} onChange={e => setNewService({...newService, service: e.target.value})} className={inputBaseStyle} />
              <input type="number" placeholder="Cantidad" value={newService.quantity} onChange={e => setNewService({...newService, quantity: e.target.value})} className={inputBaseStyle} />
              <input type="number" placeholder="Precio" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className={inputBaseStyle} />
            </div>
            <button type="button" onClick={handleAddService} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 mb-4 flex items-center gap-2"><FaPlus />Agregar Servicio</button>
            {orderData.services.length > 0 && (
              <ul className="space-y-2">
                {orderData.services.map((s, i) => (
                  <li key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span>{s.service} - Cantidad: {s.quantity}, Precio: ${s.price}</span>
                    <button type="button" onClick={() => handleDeleteService(i)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Productos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <input type="text" placeholder="Producto" value={newProduct.product} onChange={e => setNewProduct({...newProduct, product: e.target.value})} className={inputBaseStyle} />
              <input type="number" placeholder="Cantidad" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} className={inputBaseStyle} />
              <input type="number" placeholder="Precio" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className={inputBaseStyle} />
            </div>
            <button type="button" onClick={handleAddProduct} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 mb-4 flex items-center gap-2"><FaPlus />Agregar Producto</button>
            {orderData.products.length > 0 && (
              <ul className="space-y-2">
                {orderData.products.map((p, i) => (
                  <li key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span>{p.product} - Cantidad: {p.quantity}, Precio: ${p.price}</span>
                    <button type="button" onClick={() => handleDeleteProduct(i)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Totales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
              <input type="number" value={orderData.subtotal} disabled className={`${inputBaseStyle} bg-gray-100`} />
            </div>
            <div>
              <label htmlFor="iva" className="block text-sm font-medium text-gray-700 mb-1">IVA (19%)</label>
              <input id="iva" type="number" name="iva" value={orderData.iva} onChange={handleChange} className={inputBaseStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input type="number" value={orderData.total} disabled className={`${inputBaseStyle} bg-gray-100`} />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea id="observations" name="observations" value={orderData.observations} onChange={handleChange} rows={3} className={inputBaseStyle} />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Orden</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewServiceOrderModal;
