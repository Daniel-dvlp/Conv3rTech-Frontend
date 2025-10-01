// src/features/dashboard/pages/purchases/data/Purchases_data.js

export const mockProveedores = [
  { id: 1, nombre: 'Distribuidora Central', nit: '900123456' },
  { id: 2, nombre: 'Suministros del Norte', nit: '900654321' },
  { id: 3, nombre: 'Importaciones Globales', nit: '900987654' },
  { id: 4, nombre: 'Comercializadora Express', nit: '900321654' },
  { id: 5, nombre: 'Ferro Materiales Ltda.', nit: '900789123' },
  { id: 6, nombre: 'Proveedora Andina', nit: '900456789' },
  { id: 7, nombre: 'Herramientas y Más', nit: '900111222' },
  { id: 8, nombre: 'Suministros Eléctricos', nit: '900333444' },
  { id: 9, nombre: 'Materiales del Pacífico', nit: '900555666' },
  { id: 10, nombre: 'Global Proveedores', nit: '900777888' },
];

export const mockProductosParaCompra = [
  { id: 1, nombre: 'Filtro de aceite', precioUnitario: 5000, modelo: 'FX-100', unidadDeMedida: 'Unidad' },
  { id: 2, nombre: 'Aceite lubricante', precioUnitario: 3000, modelo: 'SYN-5W30', unidadDeMedida: 'Litros' },
  { id: 3, nombre: 'Tornillos galvanizados', precioUnitario: 100, modelo: 'M8x50', unidadDeMedida: 'Unidad' },
  { id: 4, nombre: 'Arandelas', precioUnitario: 50, modelo: 'Plana M8', unidadDeMedida: 'Unidad' },
  { id: 5, nombre: 'Panel eléctrico', precioUnitario: 35000, modelo: 'PX-200', unidadDeMedida: 'Unidad' },
  { id: 6, nombre: 'Cable industrial', precioUnitario: 800, modelo: 'CU-3x2.5', unidadDeMedida: 'Metros' },
  { id: 7, nombre: 'Guantes de seguridad', precioUnitario: 1500, modelo: 'NITRILE-L', unidadDeMedida: 'Pares' },
  { id: 8, nombre: 'Vigas de acero', precioUnitario: 120000, modelo: 'IPE-200', unidadDeMedida: 'Metros' },
  { id: 9, nombre: 'Placas metálicas', precioUnitario: 15000, modelo: 'ACERO-A36', unidadDeMedida: 'Unidad' },
  { id: 10, nombre: 'Lámpara LED', precioUnitario: 8000, modelo: 'LEDFLOOD-50W', unidadDeMedida: 'Unidad' },
  { id: 11, nombre: 'Interruptor eléctrico', precioUnitario: 5000, modelo: 'SW-16A', unidadDeMedida: 'Unidad' },
  { id: 12, nombre: 'Taladro industrial', precioUnitario: 180000, modelo: 'BOSCH-GBH', unidadDeMedida: 'Unidad' },
  { id: 13, nombre: 'Brocas metálicas', precioUnitario: 4000, modelo: 'HSS-SET', unidadDeMedida: 'Kit' },
  { id: 14, nombre: 'Cables de cobre', precioUnitario: 1500, modelo: 'CU-AWG12', unidadDeMedida: 'Metros' },
  { id: 15, nombre: 'Cinta aislante', precioUnitario: 300, modelo: 'PVC-BLK', unidadDeMedida: 'Unidad' },
  { id: 16, nombre: 'Tubería PVC', precioUnitario: 4000, modelo: 'PVC-1/2', unidadDeMedida: 'Tramo 3 metros' },
  { id: 17, nombre: 'Codos PVC', precioUnitario: 1500, modelo: 'CPVC-90', unidadDeMedida: 'Unidad' },
  { id: 18, nombre: 'Detector de humo', precioUnitario: 22000, modelo: 'FIRE-PRO', unidadDeMedida: 'Unidad' },
  { id: 19, precioUnitario: 75000, modelo: 'ABC-5KG', unidadDeMedida: 'Unidad', nombre: 'Extintor de fuego' }, // 'cantidad' eliminada y 'nombre' añadido para consistencia
];

export const initialMockCompras = [
  {
    id: 1,
    numeroRecibo: '45892',
    idProveedor: 1,
    fechaRegistro: '2025-03-12',
    fechaCreacion: '2025-03-12T08:30:00Z',
    creadoPor: 'juan.perez',
    productos: [
      { idProducto: 1, cantidad: 5, precioUnitarioCompra: 4800, codigoDeBarra: '1234567890' },
      { idProducto: 2, cantidad: 10, precioUnitarioCompra: 2900, codigoDeBarras: 'N/A' },
    ],
    observaciones: 'Entrega parcial, falta un filtro por despachar.',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 2,
    numeroRecibo: 'S/N',
    idProveedor: 2,
    fechaRegistro: '2025-03-12',
    fechaCreacion: '2025-03-12T09:00:00Z',
    creadoPor: 'maria.gomez',
    productos: [
      { idProducto: 3, cantidad: 100, precioUnitarioCompra: 90, codigoDeBarras: '2345678901' },
      { idProducto: 4, cantidad: 200, precioUnitarioCompra: 45, codigoDeBarras: '3456789012' },
    ],
    observaciones: '',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 3,
    numeroRecibo: '75894',
    idProveedor: 3,
    fechaRegistro: '2025-03-12',
    fechaCreacion: '2025-03-12T09:45:00Z',
    creadoPor: 'andres.lopez',
    productos: [
      { idProducto: 5, cantidad: 2, precioUnitarioCompra: 34000, codigoDeBarras: '4567890123' },
      { idProducto: 6, cantidad: 50, precioUnitarioCompra: 750, codigoDeBarras: 'N/A' },
    ],
    observaciones: 'Entrega completa y revisada.',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 4,
    numeroRecibo: 'S/N',
    idProveedor: 4,
    fechaRegistro: '2025-03-13',
    fechaCreacion: '2025-03-13T10:15:00Z',
    creadoPor: 'maria.gomez',
    productos: [
      { idProducto: 7, cantidad: 20, precioUnitarioCompra: 1400, codigoDeBarras: '5678901234' },
    ],
    observaciones: '',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 5,
    numeroRecibo: '89456',
    idProveedor: 5,
    fechaRegistro: '2025-03-13',
    fechaCreacion: '2025-03-13T11:00:00Z',
    creadoPor: 'juan.perez',
    productos: [
      { idProducto: 8, cantidad: 3, precioUnitarioCompra: 115000, codigoDeBarras: 'N/A' },
      { idProducto: 9, cantidad: 10, precioUnitarioCompra: 14500, codigoDeBarras: '6789012345' },
    ],
    observaciones: 'Requiere transporte especializado.',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 6,
    numeroRecibo: 'S/N',
    idProveedor: 6,
    fechaRegistro: '2025-03-14',
    fechaCreacion: '2025-03-14T08:50:00Z',
    creadoPor: 'andres.lopez',
    productos: [
      { idProducto: 10, cantidad: 25, precioUnitarioCompra: 7800, codigoDeBarras: '7890123456' },
      { idProducto: 11, cantidad: 10, precioUnitarioCompra: 4800, codigoDeBarras: '8901234567' },
    ],
    observaciones: '',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 7,
    numeroRecibo: '21478',
    idProveedor: 7,
    fechaRegistro: '2025-03-14',
    fechaCreacion: '2025-03-14T09:30:00Z',
    creadoPor: 'maria.gomez',
    productos: [
      { idProducto: 12, cantidad: 1, precioUnitarioCompra: 175000, codigoDeBarras: '9012345678' },
      { idProducto: 13, cantidad: 15, precioUnitarioCompra: 3800, codigoDeBarras: '0123456789' },
    ],
    observaciones: 'Incluye garantía de 1 año.',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 8,
    numeroRecibo: 'S/N',
    idProveedor: 8,
    fechaRegistro: '2025-03-15',
    fechaCreacion: '2025-03-15T10:05:00Z',
    creadoPor: 'juan.perez',
    productos: [
      { idProducto: 14, cantidad: 100, precioUnitarioCompra: 1450, codigoDeBarras: 'N/A' },
      { idProducto: 15, cantidad: 50, precioUnitarioCompra: 280, codigoDeBarras: '1122334455' },
    ],
    observaciones: '',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 9,
    numeroRecibo: '55987',
    idProveedor: 9,
    fechaRegistro: '2025-03-15',
    fechaCreacion: '2025-03-15T11:00:00Z',
    creadoPor: 'andres.lopez',
    productos: [
      { idProducto: 16, cantidad: 30, precioUnitarioCompra: 3900, codigoDeBarras: 'N/A' },
      { idProducto: 17, cantidad: 20, precioUnitarioCompra: 1400, codigoDeBarras: '2233445566' },
    ],
    observaciones: 'Entrega urgente solicitada.',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 10,
    numeroRecibo: 'S/N',
    idProveedor: 10,
    fechaRegistro: '2025-03-16',
    fechaCreacion: '2025-03-16T08:45:00Z',
    creadoPor: 'maria.gomez',
    productos: [
      { idProducto: 18, cantidad: 5, precioUnitarioCompra: 21000, codigoDeBarras: '3344556677' },
      { idProducto: 19, cantidad: 3, precioUnitarioCompra: 72000, codigoDeBarras: '4455667788' },
    ],
    observaciones: 'Equipos certificados según norma internacional.',
    estado: 'Activa',
    esActivo: true,
    motivoAnulacion: ''
  },
  {
    id: 11,
    numeroRecibo: '99999',
    idProveedor: 1,
    fechaRegistro: '2025-03-17',
    fechaCreacion: '2025-03-17T12:00:00Z',
    creadoPor: 'system.admin',
    productos: [
      { idProducto: 1, cantidad: 1, precioUnitarioCompra: 950, codigoDeBarras: '5566778899' },
    ],
    observaciones: 'Orden de compra anulada para pruebas.',
    estado: 'Anulada',
    esActivo: false,
    motivoAnulacion: 'Error en la cantidad de producto solicitada inicialmente.'
  },
];