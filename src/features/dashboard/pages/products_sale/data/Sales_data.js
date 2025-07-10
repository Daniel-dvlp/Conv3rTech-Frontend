export const mockSales = [
  {
    id: 1,
    numero: 'V-001',
    cliente: 'María Álvarez',
    clienteData: {
      id: 1,
      tipoDocumento: 'CC',
      documento: '1010101010',
      nombre: 'María',
      apellido: 'Álvarez',
      email: 'maria.alvarez@example.com',
      celular: '3001234567',
      estado: 'Activo',
      credito: false,
      direcciones: []
    },
    fechaHora: '05/03/2025 10:30 AM',
    metodoPago: 'Tarjeta',
    estado: 'Registrada',
    subtotal: 200000,
    iva: 38000,
    monto: 238000,
    productos: [
      {
        nombre: 'Cámara de Seguridad',
        modelo: 'CS-100',
        cantidad: 2,
        unidad: 'unidad',
        precio: 100000,
        subtotal: 200000
      }
    ]
  },
  {
    id: 2,
    numero: 'V-002',
    cliente: 'Juan Pérez',
    clienteData: {
      id: 2,
      tipoDocumento: 'CC',
      documento: '2020202020',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@example.com',
      celular: '3009876543',
      estado: 'Activo',
      credito: true,
      direcciones: []
    },
    fechaHora: '05/03/2025 03:15 PM',
    metodoPago: 'Tarjeta',
    estado: 'Anulada',
    subtotal: 180000,
    iva: 34200,
    monto: 214200,
    productos: [
      {
        nombre: 'Sensor de Movimiento',
        modelo: 'SM-300',
        cantidad: 1,
        unidad: 'unidad',
        precio: 100000,
        subtotal: 100000
      },
      {
        nombre: 'Alarma de Seguridad',
        modelo: 'AS-400',
        cantidad: 1,
        unidad: 'unidad',
        precio: 80000,
        subtotal: 80000
      }
    ]
  },
  {
    id: 3,
    numero: 'V-003',
    cliente: 'Luisa Ramírez',
    clienteData: {
      id: 3,
      tipoDocumento: 'CC',
      documento: '3030303030',
      nombre: 'Luisa',
      apellido: 'Ramírez',
      email: 'luisa.ramirez@example.com',
      celular: '3115556666',
      estado: 'Activo',
      credito: false,
      direcciones: []
    },
    fechaHora: '06/03/2025 09:20 AM',
    metodoPago: 'Efectivo',
    estado: 'Registrada',
    subtotal: 150000,
    iva: 28500,
    monto: 178500,
    productos: [
      {
        nombre: 'Cámara de video',
        modelo: 'CV-200',
        cantidad: 1,
        unidad: 'metro',
        precio: 150000,
        subtotal: 150000
      }
    ]
  },
  {
    id: 4,
    numero: 'V-004',
    cliente: 'Carlos Mendoza',
    clienteData: {
      id: 4,
      tipoDocumento: 'CC',
      documento: '4040404040',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      email: 'carlos.mendoza@example.com',
      celular: '3104447777',
      estado: 'Activo',
      credito: false,
      direcciones: []
    },
    fechaHora: '06/03/2025 01:05 PM',
    metodoPago: 'Transferencia',
    estado: 'Registrada',
    subtotal: 250000,
    iva: 47500,
    monto: 297500,
    productos: [
      {
        nombre: 'Control de Acceso',
        modelo: 'CA-500',
        cantidad: 1,
        unidad: 'unidad',
        precio: 250000,
        subtotal: 250000
      }
    ]
  },
  {
    id: 5,
    numero: 'V-005',
    cliente: 'Daniela Gómez',
    clienteData: {
      id: 5,
      tipoDocumento: 'CC',
      documento: '5050505050',
      nombre: 'Daniela',
      apellido: 'Gómez',
      email: 'daniela.gomez@example.com',
      celular: '3008889999',
      estado: 'Activo',
      credito: false,
      direcciones: []
    },
    fechaHora: '07/03/2025 04:40 PM',
    metodoPago: 'Tarjeta',
    estado: 'Registrada',
    subtotal: 180000,
    iva: 34200,
    monto: 214200,
    productos: [
      {
        nombre: 'Cámara de Seguridad',
        modelo: 'CS-100',
        cantidad: 1,
        unidad: 'unidad',
        precio: 100000,
        subtotal: 100000
      },
      {
        nombre: 'Sensor de Movimiento',
        modelo: 'SM-300',
        cantidad: 1,
        unidad: 'unidad',
        precio: 80000,
        subtotal: 80000
      }
    ]
  }
];
