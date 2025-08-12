// src/features/dashboard/pages/project/data/projects.data.js

export const mockProjects = [
  {
    id: 'P-001',
    numeroContrato: 'CT-2025-001',
    nombre: 'Instalación Sistema CCTV',
    cliente: 'Constructora XYZ',
    responsable: { nombre: 'Daniela V.', avatarSeed: 'Daniela' },
    fechaInicio: '2025-06-01',
    fechaFin: '2025-07-15',
    estado: 'En Progreso',
    progreso: 75,
    prioridad: 'Alta',
    ubicacion: 'Carrera 48 #20-115, Oficinas 801-805, Medellín',
    empleadosAsociados: [
        { nombre: 'Daniela V.', avatarSeed: 'Daniela' },
        { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
        { nombre: 'Luis P.', avatarSeed: 'Luis' },
    ],
    descripcion: 'Instalación completa de 32 cámaras de seguridad IP, DVR y centro de monitoreo para las nuevas oficinas de la constructora.',
    materiales: [
      { item: 'Cámara IP Domo 4MP', cantidad: 32, precio: 150000 },
      { item: 'DVR 32 Canales', cantidad: 1, precio: 800000 },
      { item: 'Cable UTP Cat 6 (caja)', cantidad: 5, precio: 100000 },
    ],
    servicios: [
      { servicio: 'Instalación por punto de cámara', cantidad: 32, precio: 50000 },
      { servicio: 'Configuración de red y DVR', cantidad: 1, precio: 300000 },
    ],
    costos: { manoDeObra: 500000 },
    observaciones: 'El cliente solicitó añadir 2 cámaras exteriores adicionales. Pendiente de cotización.',
    sedes: [
      {
        nombre: 'Oficina Principal',
        ubicacion: 'Carrera 48 #20-115, Oficina 801',
        materialesAsignados: [
          { item: 'Cámara IP Domo 4MP', cantidad: 20 },
          { item: 'DVR 32 Canales', cantidad: 1 },
          { item: 'Cable UTP Cat 6 (caja)', cantidad: 3 },
        ],
        serviciosAsignados: [
          { servicio: 'Instalación por punto de cámara', cantidad: 20, precio: 50000 },
          { servicio: 'Configuración de red y DVR', cantidad: 1, precio: 300000 },
        ],
        presupuesto: {
          materiales: 3500000, // 20*150000 + 1*800000 + 3*100000
          servicios: 1300000,  // 20*50000 + 1*300000
          total: 4800000
        },
        salidasMaterial: [
          {
            id: 'SM-001',
            fecha: '2025-01-15T10:30:00',
            material: 'Cámara IP Domo 4MP',
            cantidad: 5,
            entregador: 'Carlos R.',
            receptor: 'Juan Pérez',
            observaciones: 'Entrega para instalación inicial'
          },
          {
            id: 'SM-002',
            fecha: '2025-01-16T14:15:00',
            material: 'Cable UTP Cat 6 (caja)',
            cantidad: 1,
            entregador: 'Luis P.',
            receptor: 'María González',
            observaciones: 'Material adicional para ampliación'
          }
        ]
      },
      {
        nombre: 'Oficina Secundaria',
        ubicacion: 'Carrera 48 #20-115, Oficina 805',
        materialesAsignados: [
          { item: 'Cámara IP Domo 4MP', cantidad: 12 },
          { item: 'Cable UTP Cat 6 (caja)', cantidad: 2 },
        ],
        serviciosAsignados: [
          { servicio: 'Instalación por punto de cámara', cantidad: 12, precio: 50000 },
        ],
        presupuesto: {
          materiales: 2000000, // 12*150000 + 2*100000
          servicios: 600000,   // 12*50000
          total: 2600000
        },
        salidasMaterial: [
          {
            id: 'SM-003',
            fecha: '2025-01-17T09:45:00',
            material: 'Cámara IP Domo 4MP',
            cantidad: 8,
            entregador: 'Daniela V.',
            receptor: 'Ana López',
            observaciones: 'Entrega para oficina secundaria'
          }
        ]
      }
    ]
  },
  {
    id: 'P-002',
    numeroContrato: 'CT-2025-002',
    nombre: 'Mantenimiento Red Eléctrica',
    cliente: 'Hospital Central',
    responsable: { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
    fechaInicio: '2025-05-20',
    fechaFin: '2025-06-30',
    estado: 'Completado',
    progreso: 100,
    prioridad: 'Alta',
    ubicacion: 'Calle 10 # 43A-50, Bello, Antioquia',
    empleadosAsociados: [
        { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
    ],
    descripcion: 'Mantenimiento preventivo y correctivo de la red eléctrica del ala de emergencias del hospital.',
    materiales: [
      { item: 'Breakers 20A', cantidad: 15, precio: 10000 },
      { item: 'Terminales de Cobre', cantidad: 50, precio: 2000 },
    ],
    servicios: [
      { servicio: 'Revisión por punto eléctrico', cantidad: 150, precio: 15000 },
    ],
    costos: { manoDeObra: 800000 },
    observaciones: 'Se completó el trabajo sin contratiempos y dentro del presupuesto.',
    sedes: [
      {
        nombre: 'Ala de Emergencias',
        ubicacion: 'Piso 1',
        materialesAsignados: [
          { item: 'Breakers 20A', cantidad: 10 },
          { item: 'Terminales de Cobre', cantidad: 30 },
        ],
        serviciosAsignados: [
          { servicio: 'Revisión por punto eléctrico', cantidad: 100, precio: 15000 },
        ],
        presupuesto: {
          materiales: 160000, // 10*10000 + 30*2000
          servicios: 1500000, // 100*15000
          total: 1660000
        },
        salidasMaterial: [
          {
            id: 'SM-004',
            fecha: '2025-01-18T08:00:00',
            material: 'Breakers 20A',
            cantidad: 5,
            entregador: 'Carlos R.',
            receptor: 'Dr. Roberto Silva',
            observaciones: 'Entrega para mantenimiento preventivo'
          },
          {
            id: 'SM-005',
            fecha: '2025-01-19T11:20:00',
            material: 'Terminales de Cobre',
            cantidad: 25,
            entregador: 'Carlos R.',
            receptor: 'Ing. Patricia Morales',
            observaciones: 'Material para conexiones eléctricas'
          }
        ]
      },
      {
        nombre: 'Ala de Hospitalización',
        ubicacion: 'Piso 2',
        materialesAsignados: [
          { item: 'Breakers 20A', cantidad: 5 },
          { item: 'Terminales de Cobre', cantidad: 20 },
        ],
        serviciosAsignados: [
          { servicio: 'Revisión por punto eléctrico', cantidad: 50, precio: 15000 },
        ],
        presupuesto: {
          materiales: 90000,  // 5*10000 + 20*2000
          servicios: 750000,  // 50*15000
          total: 840000
        },
        salidasMaterial: [
          {
            id: 'SM-006',
            fecha: '2025-01-20T13:45:00',
            material: 'Breakers 20A',
            cantidad: 3,
            entregador: 'Carlos R.',
            receptor: 'Dr. Laura Martínez',
            observaciones: 'Entrega para ala de hospitalización'
          }
        ]
      }
    ]
  },
  {
    id: 'P-003',
    numeroContrato: 'CT-2025-003',
    nombre: 'Diseño de Iluminación LED',
    cliente: 'Oficinas BigCorp',
    responsable: { nombre: 'Ana G.', avatarSeed: 'Ana' },
    fechaInicio: '2025-07-01',
    fechaFin: '2025-08-01',
    estado: 'Pendiente',
    progreso: 10,
    prioridad: 'Media',
    ubicacion: 'Avenida El Poblado, Km 17, Envigado',
    empleadosAsociados: [
        { nombre: 'Ana G.', avatarSeed: 'Ana' },
        { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
    ],
    descripcion: 'Diseño e implementación de un sistema de iluminación LED de bajo consumo para 3 pisos de oficinas.',
    materiales: [
      { item: 'Panel LED 60x60', cantidad: 200, precio: 45000 },
      { item: 'Tira LED 5m', cantidad: 50, precio: 25000 },
    ],
    servicios: [
      { servicio: 'Diseño de Iluminación', cantidad: 1, precio: 1000000 },
      { servicio: 'Instalación por punto de luz', cantidad: 250, precio: 20000 },
    ],
    costos: { manoDeObra: 1200000 },
    observaciones: 'Pendiente de aprobación final del diseño por parte del cliente.',
    sedes: [
      {
        nombre: 'Piso 1',
        ubicacion: 'Oficinas A',
        materialesAsignados: [
          { item: 'Panel LED 60x60', cantidad: 100 },
          { item: 'Tira LED 5m', cantidad: 25 },
        ]
      },
      {
        nombre: 'Piso 2',
        ubicacion: 'Oficinas B',
        materialesAsignados: [
          { item: 'Panel LED 60x60', cantidad: 100 },
          { item: 'Tira LED 5m', cantidad: 25 },
        ]
      }
    ]
  },
  {
    id: 'P-004',
    numeroContrato: 'CT-2025-004',
    nombre: 'Auditoría de Seguridad',
    cliente: 'Banco Nacional',
    responsable: { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
    fechaInicio: '2025-06-10',
    fechaFin: '2025-07-10',
    estado: 'En Progreso',
    progreso: 50,
    prioridad: 'Alta',
    ubicacion: 'Carrera 43A #7-50, Medellín',
    empleadosAsociados: [
        { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
        { nombre: 'Daniela V.', avatarSeed: 'Daniela' },
    ],
    descripcion: 'Auditoría completa de los sistemas de seguridad física y digital de la sede principal del banco.',
    materiales: [
      { item: 'Licencia Software de Vulnerabilidades', cantidad: 1, precio: 2000000 }
    ],
    servicios: [
      { servicio: 'Análisis de Vulnerabilidades de Red', cantidad: 1, precio: 3000000 },
      { servicio: 'Revisión de protocolo de CCTV', cantidad: 1, precio: 1500000 },
    ],
    costos: { manoDeObra: 2500000 },
    observaciones: 'Se encontraron 3 vulnerabilidades críticas. Se entregó informe detallado.',
    sedes: [
      {
        nombre: 'Sede Principal',
        ubicacion: 'Calle 43A #7-50, Medellín',
        materialesAsignados: [
          { item: 'Licencia Software de Vulnerabilidades', cantidad: 1 },
        ]
      },
      {
        nombre: 'Sucursal Norte',
        ubicacion: 'Carrera 43A #7-50, Medellín',
        materialesAsignados: [
          { item: 'Licencia Software de Vulnerabilidades', cantidad: 1 },
        ]
      }
    ]
  },
  {
    id: 'P-005',
    numeroContrato: 'CT-2025-005',
    nombre: 'Instalación de Paneles Solares',
    cliente: 'Granja "El Sol"',
    responsable: { nombre: 'Luis P.', avatarSeed: 'Luis' },
    fechaInicio: '2025-04-15',
    fechaFin: '2025-06-15',
    estado: 'Completado',
    progreso: 100,
    prioridad: 'Media',
    ubicacion: 'Vereda El Salado, Copacabana, Antioquia',
    empleadosAsociados: [
        { nombre: 'Luis P.', avatarSeed: 'Luis' },
        { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
    ],
    descripcion: 'Instalación de un sistema de 20 paneles solares para alimentar el sistema de riego de la granja.',
    materiales: [
      { item: 'Panel Solar 550W', cantidad: 20, precio: 700000 },
      { item: 'Inversor de Corriente 10kW', cantidad: 1, precio: 4000000 },
      { item: 'Batería de Litio', cantidad: 4, precio: 2500000 },
    ],
    servicios: [
      { servicio: 'Instalación de estructura y paneles', cantidad: 20, precio: 150000 },
      { servicio: 'Conexión e interconexión del sistema', cantidad: 1, precio: 2000000 },
    ],
    costos: { manoDeObra: 3000000 },
    observaciones: 'El sistema está generando un 15% más de la energía proyectada.',
    sedes: [
      {
        nombre: 'Granja Principal',
        ubicacion: 'Vereda El Salado, Copacabana',
        materialesAsignados: [
          { item: 'Panel Solar 550W', cantidad: 20 },
          { item: 'Inversor de Corriente 10kW', cantidad: 1 },
          { item: 'Batería de Litio', cantidad: 4 },
        ]
      },
      {
        nombre: 'Granja Secundaria',
        ubicacion: 'Vereda El Salado, Copacabana',
        materialesAsignados: [
          { item: 'Panel Solar 550W', cantidad: 20 },
          { item: 'Inversor de Corriente 10kW', cantidad: 1 },
          { item: 'Batería de Litio', cantidad: 4 },
        ]
      }
    ]
  },
  {
    id: 'P-006',
    numeroContrato: 'CT-2025-006',
    nombre: 'Automatización de Acceso',
    cliente: 'Edificio "El Roble"',
    responsable: { nombre: 'Daniela V.', avatarSeed: 'Daniela' },
    fechaInicio: '2025-07-05',
    fechaFin: '2025-07-25',
    estado: 'Pendiente',
    progreso: 0,
    prioridad: 'Baja',
    ubicacion: 'Calle 50 # 52-21, Itagüí, Antioquia',
    empleadosAsociados: [
        { nombre: 'Daniela V.', avatarSeed: 'Daniela' },
        { nombre: 'Ana G.', avatarSeed: 'Ana' },
    ],
    descripcion: 'Instalación de sistema de control de acceso con tarjetas RFID para todas las áreas comunes y oficinas.',
    materiales: [
      { item: 'Lector de Tarjetas RFID', cantidad: 12, precio: 120000 },
      { item: 'Cerradura Electromagnética', cantidad: 12, precio: 90000 },
      { item: 'Controlador de Acceso', cantidad: 1, precio: 1500000 },
    ],
    servicios: [
      { servicio: 'Instalación por punto de acceso', cantidad: 12, precio: 80000 },
      { servicio: 'Configuración de software y tarjetas', cantidad: 1, precio: 400000 },
    ],
    costos: { manoDeObra: 600000 },
    observaciones: 'A la espera del primer pago para comprar los materiales.',
    sedes: [
      {
        nombre: 'Edificio Principal',
        ubicacion: 'Calle 50 # 52-21, Itagüí',
        materialesAsignados: [
          { item: 'Lector de Tarjetas RFID', cantidad: 12 },
          { item: 'Cerradura Electromagnética', cantidad: 12 },
          { item: 'Controlador de Acceso', cantidad: 1 },
        ]
      },
      {
        nombre: 'Edificio Secundario',
        ubicacion: 'Calle 50 # 52-21, Itagüí',
        materialesAsignados: [
          { item: 'Lector de Tarjetas RFID', cantidad: 12 },
          { item: 'Cerradura Electromagnética', cantidad: 12 },
          { item: 'Controlador de Acceso', cantidad: 1 },
        ]
      }
    ]
  },
  {
    id: 'P-007',
    numeroContrato: 'CT-2025-007',
    nombre: 'Red de Fibra Óptica',
    cliente: 'Universidad del Norte',
    responsable: { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
    fechaInicio: '2025-01-10',
    fechaFin: '2025-06-10',
    estado: 'Completado',
    progreso: 100,
    prioridad: 'Media',
    ubicacion: 'Campus Principal, Km 5 Vía a Puerto Colombia',
    empleadosAsociados: [
        { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
        { nombre: 'Luis P.', avatarSeed: 'Luis' },
        { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
    ],
    descripcion: 'Tendido y certificación de 2km de fibra óptica para interconectar los edificios del campus universitario.',
    materiales: [
      { item: 'Cable Fibra Óptica (metro)', cantidad: 2000, precio: 3000 },
      { item: 'Switch de Fibra 24-Port', cantidad: 4, precio: 2500000 },
      { item: 'Conectores LC', cantidad: 96, precio: 5000 },
    ],
    servicios: [
      { servicio: 'Tendido de fibra subterránea', cantidad: 2000, precio: 4000 },
      { servicio: 'Fusión de hilos de fibra', cantidad: 96, precio: 25000 },
      { servicio: 'Certificación de Red', cantidad: 1, precio: 1800000 },
    ],
    costos: { manoDeObra: 5000000 },
    observaciones: 'Proyecto entregado exitosamente dos semanas antes de la fecha límite.',
    sedes: [
      {
        nombre: 'Campus Principal',
        ubicacion: 'Campus Principal, Km 5 Vía a Puerto Colombia',
        materialesAsignados: [
          { item: 'Cable Fibra Óptica (metro)', cantidad: 2000 },
          { item: 'Switch de Fibra 24-Port', cantidad: 4 },
          { item: 'Conectores LC', cantidad: 96 },
        ]
      },
      {
        nombre: 'Edificio A',
        ubicacion: 'Edificio A, Campus Principal',
        materialesAsignados: [
          { item: 'Cable Fibra Óptica (metro)', cantidad: 1000 },
          { item: 'Switch de Fibra 24-Port', cantidad: 2 },
          { item: 'Conectores LC', cantidad: 48 },
        ]
      }
    ]
  },
    {
    id: 'P-008',
    numeroContrato: 'CT-2025-008',
    nombre: 'Implementación de Red WiFi Empresarial',
    cliente: 'Empresa T&T',
    responsable: { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
    fechaInicio: '2025-06-01',
    fechaFin: '2025-07-01',
    estado: 'En Progreso',
    progreso: 60,
    prioridad: 'Alta',
    ubicacion: 'Parque Industrial Zona Franca, Rionegro',
    empleadosAsociados: [
      { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
      { nombre: 'Carlos R.', avatarSeed: 'Carlos' }
    ],
    descripcion: 'Diseño e instalación de red WiFi de alta velocidad para cubrir 4 pisos de oficinas y áreas comunes.',
    materiales: [
      { item: 'Access Point WiFi 6', cantidad: 20, precio: 400000 },
      { item: 'Router Empresarial', cantidad: 2, precio: 1200000 }
    ],
    servicios: [
      { servicio: 'Instalación y configuración por punto', cantidad: 20, precio: 70000 }
    ],
    costos: { manoDeObra: 1600000 },
    observaciones: 'Se requiere visita técnica para optimizar cobertura en bodegas.',
    sedes: [
      {
        nombre: 'Parque Industrial Zona Franca',
        ubicacion: 'Parque Industrial Zona Franca, Rionegro',
        materialesAsignados: [
          { item: 'Access Point WiFi 6', cantidad: 20 },
          { item: 'Router Empresarial', cantidad: 2 },
        ]
      },
      {
        nombre: 'Edificio B',
        ubicacion: 'Edificio B, Parque Industrial Zona Franca',
        materialesAsignados: [
          { item: 'Access Point WiFi 6', cantidad: 10 },
          { item: 'Router Empresarial', cantidad: 1 },
        ]
      }
    ]
  },
  {
    id: 'P-009',
    numeroContrato: 'CT-2025-009',
    nombre: 'Sistema de Alarmas Inteligentes',
    cliente: 'Residencial Altos del Norte',
    responsable: { nombre: 'Luis P.', avatarSeed: 'Luis' },
    fechaInicio: '2025-05-10',
    fechaFin: '2025-06-20',
    estado: 'En Progreso',
    progreso: 80,
    prioridad: 'Media',
    ubicacion: 'Calle 24 #65-100, Medellín',
    empleadosAsociados: [
      { nombre: 'Luis P.', avatarSeed: 'Luis' }
    ],
    descripcion: 'Implementación de alarmas con sensores de movimiento y control desde app móvil.',
    materiales: [
      { item: 'Sensor Movimiento Inalámbrico', cantidad: 25, precio: 100000 },
      { item: 'Central de Alarma', cantidad: 1, precio: 850000 }
    ],
    servicios: [
      { servicio: 'Instalación de sensores', cantidad: 25, precio: 30000 }
    ],
    costos: { manoDeObra: 1000000 },
    observaciones: 'El cliente pidió incluir sensores perimetrales adicionales.',
    sedes: [
      {
        nombre: 'Residencial Altos del Norte',
        ubicacion: 'Calle 24 #65-100, Medellín',
        materialesAsignados: [
          { item: 'Sensor Movimiento Inalámbrico', cantidad: 25 },
          { item: 'Central de Alarma', cantidad: 1 },
        ]
      },
      {
        nombre: 'Residencial Centro',
        ubicacion: 'Calle 24 #65-100, Medellín',
        materialesAsignados: [
          { item: 'Sensor Movimiento Inalámbrico', cantidad: 25 },
          { item: 'Central de Alarma', cantidad: 1 },
        ]
      }
    ]
  },
  {
    id: 'P-010',
    numeroContrato: 'CT-2025-010',
    nombre: 'Modernización de Tableros Eléctricos',
    cliente: 'Centro Comercial La Estación',
    responsable: { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
    fechaInicio: '2025-06-20',
    fechaFin: '2025-07-25',
    estado: 'Pendiente',
    progreso: 0,
    prioridad: 'Alta',
    ubicacion: 'Cra. 49 #33-50, Itagüí',
    empleadosAsociados: [
      { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
      { nombre: 'Daniela V.', avatarSeed: 'Daniela' }
    ],
    descripcion: 'Reemplazo de tableros eléctricos obsoletos por modelos inteligentes con monitoreo.',
    materiales: [
      { item: 'Tablero Inteligente 3F', cantidad: 10, precio: 600000 }
    ],
    servicios: [
      { servicio: 'Desmonte e instalación de tableros', cantidad: 10, precio: 150000 }
    ],
    costos: { manoDeObra: 2000000 },
    observaciones: 'Esperando aprobación de planos eléctricos actualizados.',
    sedes: [
      {
        nombre: 'Centro Comercial La Estación',
        ubicacion: 'Cra. 49 #33-50, Itagüí',
        materialesAsignados: [
          { item: 'Tablero Inteligente 3F', cantidad: 10 },
        ]
      },
      {
        nombre: 'Centro Comercial Sur',
        ubicacion: 'Cra. 49 #33-50, Itagüí',
        materialesAsignados: [
          { item: 'Tablero Inteligente 3F', cantidad: 10 },
        ]
      }
    ]
  },
  {
    id: 'P-011',
    numeroContrato: 'CT-2025-011',
    nombre: 'Instalación de Iluminación Solar',
    cliente: 'Parque Ecológico El Encanto',
    responsable: { nombre: 'Ana G.', avatarSeed: 'Ana' },
    fechaInicio: '2025-05-15',
    fechaFin: '2025-06-30',
    estado: 'Completado',
    progreso: 100,
    prioridad: 'Media',
    ubicacion: 'Kilómetro 6, Vía Las Palmas',
    empleadosAsociados: [
      { nombre: 'Ana G.', avatarSeed: 'Ana' },
      { nombre: 'Luis P.', avatarSeed: 'Luis' }
    ],
    descripcion: 'Instalación de postes solares autónomos para senderos del parque natural.',
    materiales: [
      { item: 'Poste Solar Autónomo', cantidad: 40, precio: 750000 }
    ],
    servicios: [
      { servicio: 'Instalación de postes', cantidad: 40, precio: 80000 }
    ],
    costos: { manoDeObra: 2500000 },
    observaciones: 'Proyecto completado antes de temporada vacacional.',
    sedes: [
      {
        nombre: 'Parque Ecológico El Encanto',
        ubicacion: 'Kilómetro 6, Vía Las Palmas',
        materialesAsignados: [
          { item: 'Poste Solar Autónomo', cantidad: 40 },
        ]
      },
      {
        nombre: 'Parque Sur',
        ubicacion: 'Kilómetro 6, Vía Las Palmas',
        materialesAsignados: [
          { item: 'Poste Solar Autónomo', cantidad: 40 },
        ]
      }
    ]
  },
  {
    id: 'P-012',
    numeroContrato: 'CT-2025-012',
    nombre: 'Sistema de Control de Acceso Biométrico',
    cliente: 'Torre Empresarial Nova',
    responsable: { nombre: 'Daniela V.', avatarSeed: 'Daniela' },
    fechaInicio: '2025-07-01',
    fechaFin: '2025-07-20',
    estado: 'Pendiente',
    progreso: 0,
    prioridad: 'Alta',
    ubicacion: 'Calle 50 # 36-40, Medellín',
    empleadosAsociados: [
      { nombre: 'Daniela V.', avatarSeed: 'Daniela' }
    ],
    descripcion: 'Control de acceso mediante huella y reconocimiento facial para empleados y visitantes.',
    materiales: [
      { item: 'Lector Biométrico Facial', cantidad: 10, precio: 900000 }
    ],
    servicios: [
      { servicio: 'Instalación y configuración por punto', cantidad: 10, precio: 100000 }
    ],
    costos: { manoDeObra: 1200000 },
    observaciones: 'Requiere conexión con software interno de la empresa.',
    sedes: [
      {
        nombre: 'Torre Empresarial Nova',
        ubicacion: 'Calle 50 # 36-40, Medellín',
        materialesAsignados: [
          { item: 'Lector Biométrico Facial', cantidad: 10 },
        ]
      },
      {
        nombre: 'Edificio A',
        ubicacion: 'Edificio A, Torre Empresarial Nova',
        materialesAsignados: [
          { item: 'Lector Biométrico Facial', cantidad: 5 },
        ]
      }
    ]
  },
  {
    id: 'P-013',
    numeroContrato: 'CT-2025-013',
    nombre: 'Monitoreo Remoto de Energía',
    cliente: 'Fábrica de Plásticos Norte',
    responsable: { nombre: 'Luis P.', avatarSeed: 'Luis' },
    fechaInicio: '2025-06-05',
    fechaFin: '2025-07-10',
    estado: 'En Progreso',
    progreso: 40,
    prioridad: 'Alta',
    ubicacion: 'Zona Industrial Norte, Medellín',
    empleadosAsociados: [
      { nombre: 'Luis P.', avatarSeed: 'Luis' },
      { nombre: 'Carlos R.', avatarSeed: 'Carlos' }
    ],
    descripcion: 'Instalación de medidores inteligentes para monitoreo y ahorro de consumo eléctrico.',
    materiales: [
      { item: 'Medidor Inteligente Trifásico', cantidad: 15, precio: 500000 }
    ],
    servicios: [
      { servicio: 'Instalación y calibración', cantidad: 15, precio: 70000 }
    ],
    costos: { manoDeObra: 1800000 },
    observaciones: 'Se realizará capacitación al personal interno.',
    sedes: [
      {
        nombre: 'Fábrica de Plásticos Norte',
        ubicacion: 'Zona Industrial Norte, Medellín',
        materialesAsignados: [
          { item: 'Medidor Inteligente Trifásico', cantidad: 15 },
        ]
      },
      {
        nombre: 'Almacén Central',
        ubicacion: 'Almacén Central, Zona Industrial Norte',
        materialesAsignados: [
          { item: 'Medidor Inteligente Trifásico', cantidad: 15 },
        ]
      }
    ]
  },
  {
    id: 'P-014',
    numeroContrato: 'CT-2025-014',
    nombre: 'Integración de Domótica en Vivienda',
    cliente: 'Cliente Particular - Casa Campestre',
    responsable: { nombre: 'Ana G.', avatarSeed: 'Ana' },
    fechaInicio: '2025-06-10',
    fechaFin: '2025-07-15',
    estado: 'En Progreso',
    progreso: 30,
    prioridad: 'Media',
    ubicacion: 'Vereda El Tablazo, Rionegro',
    empleadosAsociados: [
      { nombre: 'Ana G.', avatarSeed: 'Ana' }
    ],
    descripcion: 'Integración de control inteligente de luces, persianas y climatización vía app.',
    materiales: [
      { item: 'Controlador Smart Home', cantidad: 3, precio: 600000 }
    ],
    servicios: [
      { servicio: 'Instalación y programación', cantidad: 3, precio: 200000 }
    ],
    costos: { manoDeObra: 1000000 },
    observaciones: 'Pendiente integración con asistentes de voz.',
    sedes: [
      {
        nombre: 'Vereda El Tablazo, Rionegro',
        ubicacion: 'Vereda El Tablazo, Rionegro',
        materialesAsignados: [
          { item: 'Controlador Smart Home', cantidad: 3 },
        ]
      },
      {
        nombre: 'Vereda Sur',
        ubicacion: 'Vereda Sur, Rionegro',
        materialesAsignados: [
          { item: 'Controlador Smart Home', cantidad: 3 },
        ]
      }
    ]
  },
  {
    id: 'P-015',
    numeroContrato: 'CT-2025-015',
    nombre: 'Revisión General de CCTV',
    cliente: 'Colegio San Rafael',
    responsable: { nombre: 'Carlos R.', avatarSeed: 'Carlos' },
    fechaInicio: '2025-05-01',
    fechaFin: '2025-05-30',
    estado: 'Completado',
    progreso: 100,
    prioridad: 'Baja',
    ubicacion: 'Calle 12 #34-89, Bello',
    empleadosAsociados: [
      { nombre: 'Carlos R.', avatarSeed: 'Carlos' }
    ],
    descripcion: 'Revisión completa y mantenimiento de 24 cámaras existentes en las instalaciones.',
    materiales: [
      { item: 'Cable Coaxial RG6', cantidad: 10, precio: 80000 }
    ],
    servicios: [
      { servicio: 'Revisión por cámara', cantidad: 24, precio: 30000 }
    ],
    costos: { manoDeObra: 900000 },
    observaciones: 'Se reemplazaron 2 cámaras por fallas técnicas.',
    sedes: [
      {
        nombre: 'Colegio San Rafael',
        ubicacion: 'Calle 12 #34-89, Bello',
        materialesAsignados: [
          { item: 'Cable Coaxial RG6', cantidad: 10 },
        ]
      },
      {
        nombre: 'Edificio A',
        ubicacion: 'Edificio A, Colegio San Rafael',
        materialesAsignados: [
          { item: 'Cable Coaxial RG6', cantidad: 5 },
        ]
      }
    ]
  },
  {
    id: 'P-016',
    numeroContrato: 'CT-2025-016',
    nombre: 'Instalación de Sensores de Inundación',
    cliente: 'Centro de Datos NetPro',
    responsable: { nombre: 'Sofía M.', avatarSeed: 'Sofia' },
    fechaInicio: '2025-07-10',
    fechaFin: '2025-07-25',
    estado: 'Pendiente',
    progreso: 13,
    prioridad: 'Alta',
    ubicacion: 'Carrera 42 #8-35, Medellín',
    empleadosAsociados: [
      { nombre: 'Sofía M.', avatarSeed: 'Sofia' }
    ],
    descripcion: 'Implementación de sistema de detección temprana de fugas e inundaciones en el área de servidores.',
    materiales: [
      { item: 'Sensor de Inundación', cantidad: 10, precio: 350000 }
    ],
    servicios: [
      { servicio: 'Instalación y prueba por punto', cantidad: 10, precio: 90000 }
    ],
    costos: { manoDeObra: 1200000 },
    observaciones: 'Importante integrarlo con alarma general del edificio.',
    sedes: [
      {
        nombre: 'Centro de Datos NetPro',
        ubicacion: 'Carrera 42 #8-35, Medellín',
        materialesAsignados: [
          { item: 'Sensor de Inundación', cantidad: 10 },
        ]
      },
      {
        nombre: 'Servidor Principal',
        ubicacion: 'Servidor Principal, Carrera 42 #8-35',
        materialesAsignados: [
          { item: 'Sensor de Inundación', cantidad: 10 },
        ]
      }
    ]
  }
];