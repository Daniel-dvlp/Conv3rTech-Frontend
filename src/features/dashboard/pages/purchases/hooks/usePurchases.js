// src/features/dashboard/pages/purchases/hooks/usePurchases.js
import { useState, useEffect, useCallback } from 'react';
import { purchasesApi } from '../services/purchasesApi';
import { toast } from 'react-hot-toast';

// Función para transformar datos del backend al formato del frontend
const transformPurchaseFromBackend = (purchase) => {
  const supplier = purchase.supplier || {};
  const details = purchase.purchaseDetails || [];
  
  return {
    id: purchase.id_compra,
    numeroRecibo: purchase.numero_recibo,
    idProveedor: purchase.id_proveedor,
    proveedor: supplier.nombre_empresa || 'Proveedor desconocido',
    fechaRegistro: purchase.fecha_registro,
    fechaCreacion: purchase.fecha_registro, // usar la misma fecha
    creadoPor: 'Sistema', // El backend no tiene este campo, usar valor por defecto
    monto: parseFloat(purchase.monto) || 0,
    estado: purchase.estado || 'Registrada',
    fechaRecibo: purchase.fecha_recibo,
    iva: parseFloat(purchase.iva) || 0,
    // Calcular subtotal
    subtotal: (parseFloat(purchase.monto) || 0) / (1 + (parseFloat(purchase.iva) || 0) / 100),
    // Mantener el total como monto
    total: parseFloat(purchase.monto) || 0,
    productos: details.map(detail => {
      const product = detail.product || {};
      return {
        idProducto: detail.id_producto,
        cantidad: detail.cantidad || 0,
        precioUnitarioCompra: parseFloat(detail.precio_unitario) || 0,
        codigoDeBarra: detail.codigo_barras || 'N/A',
        nombre: product.nombre_producto || 'Producto desconocido',
        modelo: product.modelo_producto || 'N/A',
        unidadDeMedida: product.unidad_medida || 'N/A',
        subtotal_producto: parseFloat(detail.subtotal_producto) || 0
      };
    }),
    observaciones: '', // El backend no tiene este campo
    esActivo: purchase.estado !== 'Anulada',
    motivoAnulacion: '', // El backend no tiene este campo por ahora
    _backendData: purchase
  };
};

// Función para transformar datos del frontend al formato del backend
const transformPurchaseToBackend = (purchase) => {
  const detalles_compras = purchase.productos.map(product => ({
    id_producto: product.idProducto,
    cantidad: product.cantidad,
    precio_unitario: product.precioUnitarioCompra,
    codigo_barras: product.codigoDeBarra || 'N/A'
  }));

  return {
    numero_recibo: purchase.numeroRecibo,
    id_proveedor: purchase.idProveedor,
    fecha_recibo: purchase.fechaRecibo || purchase.fechaRegistro,
    monto: purchase.total || purchase.monto,
    iva: purchase.iva || 0,
    estado: purchase.estado || 'Registrada',
    detalles_compras
  };
};

export const usePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todas las compras
  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchasesApi.getAllPurchases();
      const transformedData = Array.isArray(data) ? data.map(transformPurchaseFromBackend) : [];
      setPurchases(transformedData);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar compras');
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear compra
  const createPurchase = useCallback(async (purchaseData) => {
    try {
      setLoading(true);
      const backendData = transformPurchaseToBackend(purchaseData);
      const newPurchase = await purchasesApi.createPurchase(backendData);
      const transformedPurchase = transformPurchaseFromBackend(newPurchase);
      setPurchases(prev => [...prev, transformedPurchase]);
      toast.success('Compra creada exitosamente');
      return transformedPurchase;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar compra
  const updatePurchase = useCallback(async (id, purchaseData) => {
    try {
      setLoading(true);
      const backendData = transformPurchaseToBackend(purchaseData);
      const updatedPurchase = await purchasesApi.updatePurchase(id, backendData);
      const transformedPurchase = transformPurchaseFromBackend(updatedPurchase);
      setPurchases(prev => 
        prev.map(purchase => 
          purchase.id === id ? transformedPurchase : purchase
        )
      );
      toast.success('Compra actualizada exitosamente');
      return transformedPurchase;
    } catch (err) {
      setError(err.message);
      toast.error('Error al actualizar compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar compra
  const deletePurchase = useCallback(async (id) => {
    try {
      setLoading(true);
      await purchasesApi.deletePurchase(id);
      setPurchases(prev => prev.filter(purchase => purchase.id !== id));
      toast.success('Compra eliminada exitosamente');
    } catch (err) {
      setError(err.message);
      toast.error('Error al eliminar compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar estado de la compra
  const changePurchaseStatus = useCallback(async (id, newStatus) => {
    try {
      setLoading(true);
      await purchasesApi.changePurchaseStatus(id, newStatus);
      setPurchases(prev => 
        prev.map(purchase => 
          purchase.id === id 
            ? { ...purchase, estado: newStatus, esActivo: newStatus !== 'Anulada' } 
            : purchase
        )
      );
      toast.success(`Compra ${newStatus === 'Anulada' ? 'anulada' : 'actualizada'} exitosamente`);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cambiar estado de la compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar compras al montar el componente
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  return {
    purchases,
    loading,
    error,
    loadPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    changePurchaseStatus
  };
};

export default usePurchases;

