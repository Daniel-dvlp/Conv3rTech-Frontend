export const mockQuotes = [
  {
    id: 1,
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
    ordenServicio: 'OS-001',
    fechaVencimiento: '14/03/2025',
    estado: 'Pendiente',
    detalleOrden: {
      servicios: [
        {
          servicio: 'Instalación',
          descripcion: 'Cámaras de seguridad',
          cantidad: 2,
          precioUnitario: 300000,
          total: 600000,
        }
      ],
      productos: [
        {
          nombre: 'Cámara de seguridad',
          descripcion: 'HD 1080p visión nocturna',
          cantidad: 10,
          precioUnitario: 120000,
          total: 1200000,
        }
      ],
      subtotalServicios: 600000,
      subtotalProductos: 1200000,
      iva: 342000, // 19% de 1800000
      total: 2142000
    }
  },
  {
    id: 2,
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
    ordenServicio: 'OS-002',
    fechaVencimiento: '24/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precioUnitario: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 0,
      iva: 237500, // 19% de 1250000
      total: 1487500
    }
  },
  {
    id: 3,
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
    ordenServicio: 'OS-003',
    fechaVencimiento: '20/03/2025',
    estado: 'Rechazada',
    detalleOrden: {
      servicios: [
        {
          servicio: 'Mantenimiento',
          descripcion: 'Red de vigilancia',
          cantidad: 1,
          precioUnitario: 1000000,
          total: 1000000,
        }
      ],
      productos: [],
      subtotalProductos: 0,
      subtotalServicios: 1000000,
      iva: 190000, // 19% de 1000000
      total: 1190000
    }
  },
  {
    id: 4,
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
    ordenServicio: 'OS-004',
    fechaVencimiento: '26/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precioUnitario: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 0,
      iva: 237500,
      total: 1487500
    }
  },
  {
    id: 5,
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
    ordenServicio: 'OS-005',
    fechaVencimiento: '26/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precioUnitario: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 0,
      iva: 237500,
      total: 1487500
    }
  },
  {
    id: 6,
    cliente: 'Pablo Gómez',
    clienteData: {
      id: 6,
      tipoDocumento: 'PPT',
      documento: '5234678',
      nombre: 'Pablo',
      apellido: 'Gómez',
      email: 'pablo.gomez@example.com',
      celular: '3008889999',
      estado: 'Activo',
      credito: true,
      direcciones: []
    },
    ordenServicio: 'OS-006',
    fechaVencimiento: '26/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precioUnitario: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 0,
      iva: 237500,
      total: 1487500
    }
  },
];
