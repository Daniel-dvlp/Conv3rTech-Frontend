export const mockQuotes = [
  {
    id: 1,
    cliente: 'Empresa Alpha',
    ordenServicio: 'OS-001',
    monto: 2000000,
    fechaVencimiento: '14/03/2025',
    estado: 'Pendiente', // Cotización recién creada
  },
  {
    id: 2,
    cliente: 'Empresa Beta',
    ordenServicio: 'OS-002',
    monto: 1500000,
    fechaVencimiento: '24/03/2025',
    estado: 'Aprobada', // Cliente la aprueba
  },
  {
    id: 3,
    cliente: 'Empresa Gamma',
    ordenServicio: 'OS-003',
    monto: 1800000,
    fechaVencimiento: '20/03/2025',
    estado: 'Rechazada', // Cliente no la aprueba
  },
  {
    id: 4,
    cliente: 'Empresa Delta',
    ordenServicio: 'OS-004',
    monto: 1300000,
    fechaVencimiento: '28/03/2025',
    estado: 'Cerrada', // Cliente solicita cancelación
  },
  {
    id: 5,
    cliente: 'Empresa Épsilon',
    ordenServicio: 'OS-005',
    monto: 2500000,
    fechaVencimiento: '10/03/2025',
    estado: 'Servicio en ejecución', // Cotización pagada
  },
  {
    id: 6,
    cliente: 'Empresa Épsilon',
    ordenServicio: 'OS-006',
    monto: 2700000,
    fechaVencimiento: '10/03/2025',
    estado: 'Cerrada', // Cotización pagada
  }
];
