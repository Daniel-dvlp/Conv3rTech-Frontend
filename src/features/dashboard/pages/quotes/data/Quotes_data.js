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
    monto: 2032000, // total final (subtotal + IVA)
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
          producto: 'Cámara de seguridad',
          descripcion: 'HD 1080p visión nocturna',
          cantidad: 10,
          precioUnitario: 120000,
          total: 1200000, // 10 cámaras a 120000 cada una
        }
      ],
      subtotalProductos: 1200000,
      subtotalServicios: 1121052.63, // 2 servicios de instalación a 300000 cada uno
      iva: 232000, // 19% de 1221052.63 aprox.
      total: 2032000,
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
    monto: 1500000,
    fechaVencimiento: '24/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          producto: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precioUnitario: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 1121052.63, // 2 servicios de instalación a 300000 cada uno
      iva: 250000,
      total: 1500000,
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
    monto: 1800000,
    fechaVencimiento: '20/03/2025',
    estado: 'Rechazada',
    detalleOrden: {
      servicios: [
        {
          nombre: 'Mantenimiento',
          descripcion: 'Red de vigilancia',
          cantidad: 1,
          precio: 1000000,
          total: 1000000,
        }
      ],
      productos: [],
      subtotalProductos: 1000000,
      subtotalServicios: 1121052.63, // 2 servicios de instalación a 300000 cada uno
      iva: 190000,
      total: 1800000,
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
    monto: 1500000,
    fechaVencimiento: '26/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precio: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 1121052.63, // 2 servicios de instalación a 300000 cada uno
      iva: 250000,
      total: 1500000,
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
    monto: 1500000,
    fechaVencimiento: '26/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precio: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 1121052.63, 
      iva: 250000,
      total: 1500000,
    }
  },
  {
    id: 6,
    cliente: 'Daniela Gómez',
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
    monto: 1500000,
    fechaVencimiento: '26/03/2025',
    estado: 'Aprobada',
    detalleOrden: {
      servicios: [],
      productos: [
        {
          nombre: 'Sensor de movimiento',
          descripcion: 'Interior/exterior',
          cantidad: 5,
          precio: 250000,
          total: 1250000,
        }
      ],
      subtotalProductos: 1250000,
      subtotalServicios: 1121052.63, 
      iva: 250000,
      total: 1500000,
    }
  },
];
