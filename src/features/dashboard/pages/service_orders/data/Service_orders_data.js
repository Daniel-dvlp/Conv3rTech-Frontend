export const mockProductos = [
  { id: 1, nombre: 'Filtro industrial', precio: 10000 },
  { id: 2, nombre: 'Tornillo de acero', precio: 200 },
  { id: 3, nombre: 'Válvula de seguridad', precio: 20000 },
  { id: 4, nombre: 'Sensor de presión', precio: 12000 },
  { id: 5, nombre: 'Bomba hidráulica', precio: 50000 },
  { id: 6, nombre: 'Kit de inspección', precio: 20000 },
  { id: 7, nombre: 'Cable de acero', precio: 8000 },
  { id: 8, nombre: 'Lubricante especial', precio: 5000 },
  { id: 9, nombre: 'Motor eléctrico', precio: 100000 },
  { id: 10, nombre: 'Lámpara LED', precio: 10000 },
  { id: 11, nombre: 'Banda transportadora', precio: 50000 },
  { id: 12, nombre: 'Panel eléctrico', precio: 50000 },
];

export const mockServicios = [
  { id: 1, nombre: 'Mantenimiento preventivo', precio: 30000 },
  { id: 2, nombre: 'Instalación de equipos', precio: 50000 },
  { id: 3, nombre: 'Revisión de caldera', precio: 50000 },
  { id: 4, nombre: 'Diagnóstico de sistema', precio: 60000 },
  { id: 5, nombre: 'Instalación de bomba', precio: 200000 },
  { id: 6, nombre: 'Inspección técnica', precio: 40000 },
  { id: 7, nombre: 'Revisión de ascensores', precio: 50000 },
  { id: 8, nombre: 'Mantenimiento correctivo', precio: 200000 },
  { id: 9, nombre: 'Cambio de luminarias', precio: 20000 },
  { id: 10, nombre: 'Ajuste de bandas transportadoras', precio: 300000 },
  { id: 11, nombre: 'Puesta a punto de sistemas', precio: 150000 },
];

export const mockCotizaciones = [
  { id: '001', fecha: '2025-07-01' },
  { id: '002', fecha: '2025-07-02' },
  { id: '003', fecha: '2025-07-03' },
  { id: '004', fecha: '2025-07-04' },
  { id: '005', fecha: '2025-07-05' },
];

export const mockServiceOrders = [
  {
    id: 1,
    orderId: 'OS-1001',
    quoteId: '001',
    clientName: 'Cliente Corporativo S.A.',
    contact: '312-456-7890',
    projectName: 'Instalación de CCTV corporativo',
    status: 'Pendiente',
    services: [
      { serviceId: 1, quantity: 2 },
      { serviceId: 2, quantity: 1 },
    ],
    products: [
      { productId: 1, quantity: 3 },
      { productId: 2, quantity: 50 },
    ],
    observations: 'Se requiere visita adicional para la instalación final.',
    requestDate: '2025-07-01',
    isActividad: true
  },
  {
    id: 2,
    orderId: 'OS-1002',
    quoteId: null,
    clientName: 'Residencial Los Pinos',
    contact: '315-678-9012',
    projectName: 'Revisión de caldera residencial',
    status: 'En proceso',
    services: [
      { serviceId: 3, quantity: 1 },
    ],
    products: [
      { productId: 3, quantity: 2 },
    ],
    observations: '',
    requestDate: '2025-07-02',
    isActividad: true
  },
  {
    id: 3,
    orderId: 'OS-1003',
    quoteId: '002',
    clientName: 'Empresa Industrial XYZ',
    contact: '310-987-6543',
    projectName: 'Diagnóstico sistema industrial',
    status: 'Esperando repuestos',
    services: [
      { serviceId: 4, quantity: 1 },
    ],
    products: [
      { productId: 4, quantity: 5 },
    ],
    observations: 'Esperando llegada del sensor especial.',
    requestDate: '2025-07-03',
    isActividad: true
  },
  {
    id: 4,
    orderId: 'OS-1004',
    quoteId: null,
    clientName: 'Condominio Altomira',
    contact: '320-789-1234',
    projectName: 'Instalación bomba hidrosanitaria',
    status: 'Completado',
    services: [
      { serviceId: 5, quantity: 1 },
    ],
    products: [
      { productId: 5, quantity: 1 },
    ],
    observations: 'Trabajo finalizado con éxito.',
    requestDate: '2025-07-04',
    isActividad: true
  },
  {
    id: 5,
    orderId: 'OS-1005',
    quoteId: '003',
    clientName: 'Corporación Delta',
    contact: '311-234-5678',
    projectName: 'Inspección técnica planta industrial',
    status: 'Pendiente',
    services: [
      { serviceId: 6, quantity: 3 },
    ],
    products: [
      { productId: 6, quantity: 3 },
    ],
    observations: 'Requiere autorización del cliente.',
    requestDate: '2025-07-05',
    isActividad: true
  },
  {
    id: 6,
    orderId: 'OS-1006',
    quoteId: null,
    clientName: 'Edificio Mirador',
    contact: '313-345-6789',
    projectName: 'Revisión de ascensores edificio',
    status: 'En proceso',
    services: [
      { serviceId: 7, quantity: 2 },
    ],
    products: [
      { productId: 7, quantity: 10 },
      { productId: 8, quantity: 2 },
    ],
    observations: '',
    requestDate: '2025-07-06',
    isActividad: true
  },
  {
    id: 7,
    orderId: 'OS-1007',
    quoteId: '004',
    clientName: 'Servicios Integrales Ltda.',
    contact: '316-456-7890',
    projectName: 'Mantenimiento correctivo motor',
    status: 'Esperando repuestos',
    services: [
      { serviceId: 8, quantity: 1 },
    ],
    products: [
      { productId: 9, quantity: 1 },
    ],
    observations: 'Se programará instalación al recibir el repuesto.',
    requestDate: '2025-07-07',
    isActividad: true
  },
  {
    id: 8,
    orderId: 'OS-1008',
    quoteId: null,
    clientName: 'Residencial La Campiña',
    contact: '317-567-8901',
    projectName: 'Cambio de luminarias comunes',
    status: 'Completado',
    services: [
      { serviceId: 9, quantity: 15 },
    ],
    products: [
      { productId: 10, quantity: 15 },
    ],
    observations: '',
    requestDate: '2025-07-08',
    isActividad: true
  },
  {
    id: 9,
    orderId: 'OS-1009',
    quoteId: '005',
    clientName: 'Logística Express S.A.',
    contact: '318-678-9012',
    projectName: 'Ajuste banda transportadora',
    status: 'Pendiente',
    services: [
      { serviceId: 10, quantity: 1 },
    ],
    products: [
      { productId: 11, quantity: 1 },
    ],
    observations: 'Cliente solicitó repuesto original.',
    requestDate: '2025-07-09',
    isActividad: true
  },
  {
    id: 10,
    orderId: 'OS-1010',
    quoteId: null,
    clientName: 'Urbanización El Lago',
    contact: '319-789-0123',
    projectName: 'Puesta a punto sistemas eléctricos',
    status: 'En proceso',
    services: [
      { serviceId: 11, quantity: 2 },
    ],
    products: [
      { productId: 12, quantity: 2 },
    ],
    observations: '',
    requestDate: '2025-07-10',
    isActividad: true
  },
  // Ejemplo de una orden inactiva para pruebas
  {
    id: 11,
    orderId: 'OS-1011',
    quoteId: null,
    clientName: 'Pruebas Inactividad S.A.',
    contact: '300-111-2222',
    projectName: 'Prueba de sistema de actividad',
    status: 'Inactiva',
    services: [
      { serviceId: 1, quantity: 1 },
    ],
    products: [
      { productId: 1, quantity: 1 },
    ],
    observations: 'Orden de prueba para verificar estado inactivo',
    requestDate: '2025-07-11',
    isActividad: false
  }
];