// src/features/dashboard/pages/purchases/hooks/usePurchases.js
import { useState, useEffect, useCallback } from 'react';
import { purchasesApi } from '../services/purchasesApi';
import { productsService } from '../../products/services/productsService';
import { suppliersApi } from '../../suppliers/services/suppliersApi';
import { toast } from 'react-hot-toast';

const BACKEND_TO_FRONT_STATUS = {
  Registrada: 'Activa',
  Anulada: 'Anulada',
  Completada: 'Completada'
};

const FRONT_TO_BACKEND_STATUS = {
  Activa: 'Registrada',
  Registrada: 'Registrada',
  Anulada: 'Anulada',
  Completada: 'Completada'
};

const transformSupplierOption = (supplier) => {
  const id = supplier?.id ?? supplier?.id_proveedor ?? supplier?.idProveedor;
  return {
    id,
    nombre: supplier?.nombre ?? supplier?.empresa ?? supplier?.nombre_empresa ?? supplier?.nombre_encargado ?? 'Proveedor sin nombre',
    nit: supplier?.nit ?? supplier?.NIT ?? supplier?.documento ?? '',
    telefono: supplier?.telefono ?? supplier?.celular ?? '',
    direccion: supplier?.direccion ?? '',
    estado: typeof supplier?.estado === 'boolean' ? (supplier.estado ? 'Activo' : 'Inactivo') : (supplier?.estado ?? ''),
    _backendData: supplier
  };
};

const transformProductOption = (product) => {
  const precio = Number(product?.precio ?? product?.precio_venta ?? product?.precio_unitario ?? 0);
  return {
    id_producto: product?.id_producto ?? product?.id ?? product?.productId,
    nombre: product?.nombre ?? product?.nombre_producto ?? product?.descripcion ?? 'Producto sin nombre',
    modelo: product?.modelo ?? product?.modelo_producto ?? product?.referencia ?? 'N/A',
    unidad_medida: product?.unidad_medida ?? product?.unidadMedida ?? 'N/A',
    precio,
    stock: Number(product?.stock ?? product?.cantidad ?? 0),
    codigo_barra: product?.codigo_barra ?? product?.codigoDeBarra ?? product?.codigo ?? 'N/A',
    _backendData: product
  };
};

const toDateOnly = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Función para transformar datos del backend al formato del frontend
const parseObservaciones = (observaciones = '') => {
  const rawText = String(observaciones ?? '').trim();
  if (!rawText) {
    return { observacionesLimpias: '', motivoAnulacion: '' };
  }

  const motivoRegex = /MOTIVO:\s*"([^"]+)"/i;
  const match = rawText.match(motivoRegex);
  if (!match) {
    return { observacionesLimpias: rawText, motivoAnulacion: '' };
  }

  const motivoAnulacion = match[1]?.trim() ?? '';
  const observacionesLimpias = rawText.replace(match[0], '').trim();

  return {
    observacionesLimpias,
    motivoAnulacion
  };
};

const transformPurchaseFromBackend = (purchase) => {
  if (!purchase) return null;

  const supplier = purchase?.supplier || purchase?._backendData?.supplier || {};
  const details = Array.isArray(purchase?.purchaseDetails)
    ? purchase.purchaseDetails
    : Array.isArray(purchase?.detalles_compras)
      ? purchase.detalles_compras
      : [];

  const total = Number(purchase?.monto ?? purchase?.total ?? 0) || 0;
  const ivaPercentage = Number(purchase?.iva ?? purchase?.ivaPorcentaje ?? 0) || 0;

  const subtotalFromDetails = details.reduce((acc, detail) => {
    const subtotal = Number(detail?.subtotal_producto ?? 0);
    if (Number.isFinite(subtotal) && subtotal > 0) {
      return acc + subtotal;
    }
    const quantity = Number(detail?.cantidad ?? 0);
    const unitPrice = Number(detail?.precio_unitario ?? 0);
    return acc + (Number.isFinite(quantity) && Number.isFinite(unitPrice) ? quantity * unitPrice : 0);
  }, 0);

  const fallbackSubtotal = ivaPercentage > -100 && ivaPercentage < 1000 && total
    ? total / (1 + ivaPercentage / 100)
    : total;

  const subtotal = subtotalFromDetails > 0 ? subtotalFromDetails : fallbackSubtotal;
  const ivaAmount = Math.max(total - subtotal, 0);

  const { observacionesLimpias, motivoAnulacion } = parseObservaciones(purchase?.observaciones);

  return {
    id: purchase?.id_compra ?? purchase?.id ?? null,
    numeroRecibo: purchase?.numero_recibo ?? purchase?.numeroRecibo ?? '',
    idProveedor: purchase?.id_proveedor ?? null,
    proveedor: supplier?.nombre_empresa
      || supplier?.nombre
      || supplier?.empresa
      || 'Proveedor desconocido',
    fechaRegistro: toDateOnly(purchase?.fecha_registro ?? purchase?.fechaRegistro),
    fechaCreacion: purchase?.fecha_creacion ?? purchase?.fecha_registro ?? null,
    creadoPor: purchase?.creado_por || purchase?.usuario_creacion || 'Sistema',
    monto: total,
    estado: BACKEND_TO_FRONT_STATUS[purchase?.estado] || purchase?.estado || 'Activa',
    fechaRecibo: toDateOnly(purchase?.fecha_recibo ?? purchase?.fechaRecibo),
    iva: ivaAmount,
    ivaPorcentaje: ivaPercentage,
    subtotal,
    total,
    productos: details.map((detail) => {
      const product = detail?.product || detail?.producto || {};
      const unitPrice = Number(detail?.precio_unitario ?? detail?.precioUnitarioCompra ?? product?.precio ?? 0) || 0;
      const quantity = Number(detail?.cantidad ?? detail?.qty ?? 0) || 0;
      const codigoBarras = detail?.codigo_barras
        || detail?.codigoDeBarras
        || product?.codigo_barra
        || product?.codigoBarras
        || 'N/A';

      return {
        idProducto: detail?.id_producto ?? product?.id_producto ?? null,
        cantidad: quantity,
        precioUnitarioCompra: unitPrice,
        codigoDeBarra: codigoBarras,
        nombre: product?.nombre || product?.nombre_producto || detail?.nombre || 'Producto desconocido',
        modelo: product?.modelo || product?.modelo_producto || detail?.modelo || 'N/A',
        unidadDeMedida: product?.unidad_medida || detail?.unidadDeMedida || 'N/A',
        subtotal_producto: Number(detail?.subtotal_producto ?? quantity * unitPrice) || 0
      };
    }),
    observaciones: observacionesLimpias,
    observacionesOriginales: purchase?.observaciones || '',
    esActivo: purchase?.estado !== 'Anulada',
    motivoAnulacion,
    _backendData: purchase
  };
};

// Función para transformar datos del frontend al formato del backend
const transformPurchaseToBackend = (purchase) => {
  const detalles_compras = (purchase?.productos || []).map((product) => ({
    id_producto: Number(product.idProducto),
    cantidad: Number(product.cantidad),
    precio_unitario: Number(product.precioUnitarioCompra),
    codigo_barras: product.codigoDeBarra || product.codigoDeBarras || 'N/A'
  }));

  const total = Number(purchase?.total ?? purchase?.monto ?? 0);
  const subtotalInformado = Number(purchase?.subtotal ?? purchase?.subtotalProductos ?? 0);
  const ivaMonto = Number(purchase?.iva ?? 0);

  let ivaPorcentaje = typeof purchase?.ivaPorcentaje === 'number'
    ? purchase.ivaPorcentaje
    : 0;

  if (!Number.isFinite(ivaPorcentaje) || ivaPorcentaje === 0) {
    if (subtotalInformado > 0) {
      ivaPorcentaje = ((total - subtotalInformado) / subtotalInformado) * 100;
    } else if (total > ivaMonto && ivaMonto > 0) {
      ivaPorcentaje = (ivaMonto / (total - ivaMonto)) * 100;
    }
  }

  const sanitizedIva = Number.isFinite(ivaPorcentaje)
    ? Number(Math.max(ivaPorcentaje, 0).toFixed(2))
    : 0;
  const fechaRecibo = purchase?.fechaRecibo || purchase?.fechaRegistro;

  const observacionesLimpias = purchase?.observaciones?.toString().trim();

  return {
    numero_recibo: purchase?.numeroRecibo?.toString().trim(),
    id_proveedor: Number(purchase?.idProveedor),
    fecha_recibo: toDateOnly(fechaRecibo),
    monto: total,
    iva: sanitizedIva,
    estado: FRONT_TO_BACKEND_STATUS[purchase?.estado] || 'Registrada',
    ...(observacionesLimpias ? { observaciones: observacionesLimpias } : {}),
    detalles_compras
  };
};

export const usePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Cargar todas las compras
  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchasesApi.getAllPurchases();
      const transformedData = Array.isArray(data)
        ? data
            .map(transformPurchaseFromBackend)
            .filter(Boolean)
        : [];
      setPurchases(transformedData);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar compras');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proveedores y productos
  const loadSuppliersAndProducts = useCallback(async () => {
    try {
      const [suppliersData, productsData] = await Promise.all([
        suppliersApi.getAllSuppliers(),
        productsService.getAllProducts()
      ]);
      const normalizedSuppliers = Array.isArray(suppliersData)
        ? suppliersData
            .map(transformSupplierOption)
            .filter((supplier) => supplier.id)
        : [];
      const normalizedProducts = Array.isArray(productsData)
        ? productsData
            .map(transformProductOption)
            .filter((product) => product.id_producto)
        : [];
      setSuppliers(normalizedSuppliers);
      setProducts(normalizedProducts);
    } catch (err) {
      console.error('Error al cargar proveedores y productos:', err);
      toast.error('Error al cargar datos adicionales');
    }
  }, []);

  // Crear compra
  const createPurchase = useCallback(async (purchaseData) => {
    try {
      setLoading(true);
      const backendData = transformPurchaseToBackend(purchaseData);
      const createdPurchase = await purchasesApi.createPurchase(backendData);
      const purchaseId = createdPurchase?.id_compra ?? createdPurchase?.id;

      if (purchaseId) {
        try {
          const freshPurchase = await purchasesApi.getPurchaseById(purchaseId);
          const transformedPurchase = transformPurchaseFromBackend(freshPurchase);
          if (transformedPurchase) {
            setPurchases(prev => [...prev, transformedPurchase]);
          }
        } catch (fetchError) {
          console.warn('No fue posible refrescar la compra recién creada, recargando listado completo.', fetchError);
          await loadPurchases();
        }
      } else {
        await loadPurchases();
      }
      toast.success('Compra creada exitosamente');
      return purchaseId;
    } catch (err) {
      setError(err.message);
      toast.error('Error al crear compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPurchases]);

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
  const changePurchaseStatus = useCallback(async (id, newStatus, motivo) => {
    try {
      setLoading(true);
      const backendStatus = FRONT_TO_BACKEND_STATUS[newStatus] || newStatus;
      await purchasesApi.changePurchaseStatus(id, backendStatus, motivo);
      await loadPurchases();
      toast.success(`Compra ${newStatus === 'Anulada' ? 'anulada' : 'actualizada'} exitosamente`);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cambiar estado de la compra');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadPurchases]);

  // Cargar compras, proveedores y productos al montar el componente
  useEffect(() => {
    loadPurchases();
    loadSuppliersAndProducts();
  }, [loadPurchases, loadSuppliersAndProducts]);

  return {
    purchases,
    loading,
    error,
    suppliers,
    products,
    loadPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    changePurchaseStatus
  };
};

export default usePurchases;

