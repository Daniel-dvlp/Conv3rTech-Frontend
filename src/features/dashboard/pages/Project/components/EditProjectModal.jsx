import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { showToast } from "../../../../../shared/utils/alertas";
import { usersService, servicesService, productsService } from "../../../../../services";
import { clientsApi } from "../../clients/services/clientsApi";
import { useAuth } from "../../../../../shared/contexts/AuthContext";

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

const inputBaseStyle =
  "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const EditProjectModal = ({ isOpen, onClose, onUpdate, project }) => {
  const { user } = useAuth();
  const isAdmin = user?.rol?.nombre_rol === "Administrador" || user?.id_rol === 1;

  const initialState = project || {
    nombre: "",
    numeroContrato: "",
    cliente: "",
    responsable: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "Pendiente",
    prioridad: "Media",
    descripcion: "",
    ubicacion: "",
    observaciones: "",
    empleadosAsociados: [],
    materiales: [],
    servicios: [],
    costos: { manoDeObra: "" },
    sedes: [],
  };
  const [projectData, setProjectData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [empleadoSearch, setEmpleadoSearch] = useState("");
  const [sedeModalOpen, setSedeModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState(null);
  const [sedeForm, setSedeForm] = useState({
    nombre: "",
    ubicacion: "",
    materialesAsignados: [],
    serviciosAsignados: [],
  });
  
  const [coordinadores, setCoordinadores] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [servicioSearch, setServicioSearch] = useState("");

  // Cargar usuarios y clientes desde la API cuando se abra el modal
  const [pauseReason, setPauseReason] = useState("");
  const [showPauseModal, setShowPauseModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const results = await Promise.allSettled([
        usersService.getAllUsers(),
        clientsApi.getAllClients(),
        servicesService.getAllServices({ estado: 'activo' }),
        productsService.getAllProducts()
      ]);

      const [usersResult, clientsResult, servicesResult, productsResult] = results;

      // Manejar respuesta de Servicios
      if (servicesResult.status === 'fulfilled') {
        const servicesResponse = servicesResult.value;
        if (Array.isArray(servicesResponse)) {
          setAvailableServices(servicesResponse);
        } else if (servicesResponse?.data && Array.isArray(servicesResponse.data)) {
          setAvailableServices(servicesResponse.data);
        } else {
          setAvailableServices([]);
        }
      } else {
        console.error("Error cargando servicios:", servicesResult.reason);
        showToast("Error cargando servicios", "error");
      }

      // Manejar respuesta de Productos
      if (productsResult.status === 'fulfilled') {
        const productsResponse = productsResult.value;
        if (Array.isArray(productsResponse)) {
          setAvailableProducts(productsResponse);
        } else if (productsResponse?.data && Array.isArray(productsResponse.data)) {
          setAvailableProducts(productsResponse.data);
        } else {
           setAvailableProducts([]);
        }
      } else {
         console.error("Error cargando productos:", productsResult.reason);
         // No bloquear flujo, pero avisar
         // showToast("Error cargando productos", "error");
      }

      // Manejar respuesta de Usuarios (Coordinadores y Técnicos)
      if (usersResult.status === 'fulfilled') {
        const usersResponse = usersResult.value;
        let allUsers = [];
        
        if (Array.isArray(usersResponse)) {
          allUsers = usersResponse;
        } else if (usersResponse?.data && Array.isArray(usersResponse.data)) {
          allUsers = usersResponse.data;
        } else if (usersResponse?.success && Array.isArray(usersResponse.data)) {
           // Handle { success: true, data: [...] } format if applicable
           allUsers = usersResponse.data;
        }

        // Filtrar Coordinadores y Administradores
        const coords = allUsers.filter(u => 
          u.rol && u.rol.nombre_rol && (
            u.rol.nombre_rol.toLowerCase().includes('coordinador') ||
            u.rol.nombre_rol.toLowerCase().includes('admin')
          ) &&
          u.estado_usuario === 'Activo'
        );
        setCoordinadores(coords);

        // Filtrar Técnicos (con o sin tilde, insensible a mayúsculas/minúsculas) y activos
        const techs = allUsers.filter(u => 
          u.rol && u.rol.nombre_rol && (
            u.rol.nombre_rol.toLowerCase().includes('tecnico') || 
            u.rol.nombre_rol.toLowerCase().includes('técnico')
          ) &&
          u.estado_usuario === 'Activo'
        );
        setTecnicos(techs);

      } else {
         console.error("Error cargando usuarios:", usersResult.reason);
         showToast("Error al cargar usuarios", "error");
      }

      // Manejar respuesta de Clientes
      if (clientsResult.status === 'fulfilled') {
        const clientsData = clientsResult.value;
        if (clientsData) {
          setClientes(clientsData);
        } else {
          showToast("Error al cargar clientes", "error");
        }
      } else {
         console.error("Error cargando clientes:", clientsResult.reason);
         showToast("Error de conexión al cargar clientes", "error");
      }

    } catch (error) {
      console.error("Error loading data:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error de conexión al cargar datos";
      showToast(errorMessage, "error");
    }
    setLoadingData(false);
  };

  useEffect(() => {
    if (project && isOpen) {
      // Helper para buscar nombre de producto por ID
      const findProductNameById = (id) => {
        if (!id) return "";
        const p = availableProducts.find(prod => prod.id_producto === id || prod.id === id);
        return p ? p.nombre : "";
      };

      // Helper para buscar nombre de servicio por ID
      const findServiceNameById = (id) => {
        if (!id) return "";
        const s = availableServices.find(serv => serv.id_servicio === id || serv.id === id);
        return s ? s.nombre : "";
      };

      // Helper para obtener nombre de producto/servicio si solo viene ID
      const getProductName = (m) => {
        let name = m.item || m.nombre_producto || m.nombre || (m.producto?.nombre);
        if (!name && (m.id_producto || m.id)) {
          name = findProductNameById(m.id_producto || m.id);
        }
        return name || "";
      };
      
      const getServiceName = (s) => {
        let name = s.servicio || s.nombre_servicio || s.nombre || (s.servicio_obj?.nombre);
        if (!name && (s.id_servicio || s.id)) {
           name = findServiceNameById(s.id_servicio || s.id);
        }
        return name || "";
      };

      const normalizedProject = {
        ...project,
        // Normalizar fechas para input type="date"
        fechaInicio: project.fechaInicio ? new Date(project.fechaInicio).toISOString().split('T')[0] : "",
        fechaFin: project.fechaFin ? new Date(project.fechaFin).toISOString().split('T')[0] : "",
        
        // Normalizar Cliente: Si es objeto, extraer nombre
        cliente: typeof project.cliente === 'object' ? project.cliente.nombre : (project.cliente || ""),

        // Responsable: Usar ID si está disponible. Manejar varios formatos posibles.
        responsable: project.id_responsable || (project.responsable?.id) || project.responsable || "",
        
        // Empleados: Asegurar array de nombres
        empleadosAsociados: Array.isArray(project.empleadosAsociados)
          ? project.empleadosAsociados.map(emp => 
              typeof emp === 'object' ? (emp.nombre + (emp.apellido ? ` ${emp.apellido}` : '')) : emp
            )
          : [],

        // Normalizar Materiales (nivel proyecto)
        materiales: (project.materiales || []).map(m => ({
          item: getProductName(m),
          cantidad: Number(m.cantidad) || 0,
          precio: Number(m.precio || m.precio_unitario) || 0,
          id_producto: m.id_producto || m.id
        })),

        // Normalizar Servicios (nivel proyecto)
        servicios: (project.servicios || []).map(s => ({
          servicio: getServiceName(s),
          cantidad: Number(s.cantidad) || 0,
          precio: Number(s.precio || s.precio_unitario) || 0,
          id_servicio: s.id_servicio || s.id
        })),

        // Sedes: Asegurar estructura y mapeo correcto
        sedes: (project.sedes || []).map(sede => ({
          ...sede,
          nombre: sede.nombre || sede.nombre_sede,
          ubicacion: sede.ubicacion || sede.direccion,
          // Asegurar que el presupuesto tenga valores numéricos
          presupuesto: {
            materiales: Number(sede.presupuesto?.materiales || sede.presupuesto_materiales) || 0,
            servicios: Number(sede.presupuesto?.servicios || sede.presupuesto_servicios) || 0,
            total: Number(sede.presupuesto?.total || sede.presupuesto_total) || 0,
            restante: Number(sede.presupuesto?.restante || sede.presupuesto_restante) || 0,
          },
          materialesAsignados: (sede.materialesAsignados || sede.materiales_asignados || []).map(mat => ({
            ...mat,
            item: getProductName(mat),
            cantidad: Number(mat.cantidad) || 0,
            precio: Number(mat.precio || mat.precio_unitario) || 0
          })),
          serviciosAsignados: (sede.serviciosAsignados || sede.servicios_asignados || []).map(serv => ({
            ...serv,
            servicio: getServiceName(serv),
            cantidad: Number(serv.cantidad) || 0,
            precio: Number(serv.precio || serv.precio_unitario) || 0
          }))
        }))
      };

      // Si el proyecto no tiene sedes definidas pero tiene un cliente, intentar precargar
      // SOLO si es un proyecto nuevo (sin ID) o si explícitamente no tiene sedes
      // Pero para edición, confiamos en lo que viene del backend.
      if (!project.id && project.cliente && (!project.sedes || project.sedes.length === 0)) {
        const sedesPrecargadas = getSedesFromCliente(project.cliente);
        setProjectData({
          ...normalizedProject,
          sedes: sedesPrecargadas,
        });
      } else {
        setProjectData(normalizedProject);
      }
    }
  }, [project, isOpen, clientes, availableProducts, availableServices]); // Added dependencies for products/services lookup

  // Función helper para obtener las sedes de un cliente
  const getSedesFromCliente = (nombreCliente) => {
    const cliente = clientes.find((c) => c.nombre === nombreCliente);
    // Verificar si el cliente tiene la propiedad 'AddressClients' o 'direcciones'
    const direcciones = cliente?.AddressClients || cliente?.direcciones || [];

    return (
      direcciones.map((direccion) => {
        // Crear copias frescas para cada sede para evitar referencias compartidas
        const materialesHeredados = (projectData.materiales || []).map(mat => ({
            item: mat.item,
            cantidad: 0,
            id_producto: mat.id_producto
        }));
        const serviciosHeredados = (projectData.servicios || []).map(serv => ({
            servicio: serv.servicio,
            cantidad: 0,
            precio: serv.precio,
            id_servicio: serv.id_servicio
        }));

        return {
          nombre: direccion.nombre_direccion || direccion.nombre,
          ubicacion: `${direccion.direccion}, ${direccion.ciudad}`,
          materialesAsignados: materialesHeredados,
          serviciosAsignados: serviciosHeredados,
          presupuesto: {
            materiales: 0,
            servicios: 0,
            total: 0,
          },
        };
      }) || []
    );
  };


  if (!isOpen) return null;

  const handleConfirmPause = () => {
    if (!pauseReason.trim()) {
      showToast("El motivo de pausa es obligatorio", "error");
      return;
    }

    const timestamp = new Date().toLocaleString();
    const pauseNote = `\n\n[ESTADO: PAUSA - ${timestamp}]\nMotivo: ${pauseReason}`;
    
    setProjectData(prev => ({
      ...prev,
      estado: "En Pausa",
      observaciones: (prev.observaciones || "") + pauseNote
    }));
    
    setShowPauseModal(false);
    setPauseReason("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Interceptar cambio de estado a "En Pausa"
    if (name === "estado" && value === "En Pausa") {
      // Verificar permisos
      const userRole = user?.rol?.toLowerCase() || "";
      const isAuthorized = userRole === "administrador" || userRole === "coordinador";
      
      if (!isAuthorized) {
        showToast("Solo administradores o coordinadores pueden pausar un proyecto.", "error");
        return; // No cambiar el estado
      }
      
      // Abrir modal de motivo
      setShowPauseModal(true);
      return; // No cambiar el estado todavía, esperar confirmación
    }

    if (name === "manoDeObra") {
      setProjectData((prev) => ({
        ...prev,
        costos: { ...prev.costos, manoDeObra: value },
      }));
    } else if (name === "cliente") {
      // Cuando se selecciona un cliente, precargar las sedes basándose en sus direcciones
      const sedesPrecargadas = getSedesFromCliente(value);

      setProjectData((prev) => ({
        ...prev,
        [name]: value,
        sedes: sedesPrecargadas,
      }));
    } else {
      setProjectData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleListChange = (index, event, listName) => {
    const { name, value } = event.target;
    const updatedList = [...(projectData[listName] || [])];
    updatedList[index][name] = value;
    setProjectData((prev) => ({ ...prev, [listName]: updatedList }));
  };
  const addListItem = (listName) => {
    const newItem =
      listName === "materiales"
        ? { item: "", cantidad: 1, precio: "" }
        : { servicio: "", cantidad: 1, precio: "" };
    setProjectData((prev) => ({
      ...prev,
      [listName]: [...(prev[listName] || []), newItem],
    }));
  };
  const removeListItem = (index, listName) => {
    const updatedList = [...(projectData[listName] || [])];
    updatedList.splice(index, 1);
    setProjectData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!projectData.nombre.trim())
      newErrors.nombre = "El nombre es obligatorio";
    if (!projectData.cliente) newErrors.cliente = "Selecciona un cliente";
    if (!projectData.responsable)
      newErrors.responsable = "Selecciona un responsable";
    if (!projectData.fechaInicio) {
      newErrors.fechaInicio = "Selecciona la fecha de inicio";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = projectData.fechaInicio.split("-").map(Number);
      const startDate = new Date(year, month - 1, day);

      // Si la fecha es menor a hoy, y es diferente a la fecha original del proyecto (si existe)
      // Validamos. Si es la misma que ya tenía, permitimos (para poder editar proyectos antiguos)
      const originalDate = project?.fechaInicio;
      const isSameAsOriginal = originalDate && projectData.fechaInicio === originalDate;

      if (startDate < today && !isSameAsOriginal) {
        newErrors.fechaInicio = "La fecha de inicio no puede ser menor al día de hoy";
      }
    }
    if (!projectData.fechaFin)
      newErrors.fechaFin = "Selecciona la fecha de fin";
    if (
      !Array.isArray(projectData.empleadosAsociados) ||
      projectData.empleadosAsociados.length === 0
    )
      newErrors.empleadosAsociados = "Selecciona al menos un empleado";
    if (
      !Array.isArray(projectData.materiales) ||
      projectData.materiales.length === 0
    )
      newErrors.materiales = "Agrega al menos un material";
    if (
      !Array.isArray(projectData.servicios) ||
      projectData.servicios.length === 0
    )
      newErrors.servicios = "Agrega al menos un servicio";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast("Por favor, corrige los errores del formulario.", "error");
      return;
    }
    try {
      // --- LOGICA DE RESOLUCIÓN DE IDs PARA CLIENTE Y RESPONSABLE ---

      // 1. Resolver ID de CLIENTE
      let id_cliente = null;
      if (typeof projectData.cliente === 'number') {
        id_cliente = projectData.cliente;
      } else if (typeof projectData.cliente === 'string') {
        // Buscar cliente por nombre en la lista 'clientes'
        const selectedClient = clientes.find(c => 
          c.nombre && c.nombre.trim().toLowerCase() === projectData.cliente.trim().toLowerCase()
        );
        id_cliente = selectedClient ? (selectedClient.id_cliente || selectedClient.id) : null;
      } else if (typeof projectData.cliente === 'object' && projectData.cliente !== null) {
        id_cliente = projectData.cliente.id_cliente || projectData.cliente.id;
      }

      // Si no se encuentra ID de cliente pero es obligatorio, intentar usar el ID original del proyecto si existe
      if (!id_cliente && project && project.id_cliente) {
         id_cliente = project.id_cliente;
      }

      // 2. Resolver ID de RESPONSABLE
      let id_responsable = null;
      // Normalizar input: puede venir como número (ID), string (Nombre) o string numérico ("15")
      const responsableInput = projectData.responsable;

      if (!isNaN(responsableInput) && responsableInput !== "" && responsableInput !== null) {
        // Es un número o string numérico
        id_responsable = Number(responsableInput);
      } else if (typeof responsableInput === 'string') {
        // Es un nombre (ej. "Juan Perez"). Buscar en la lista de usuarios.
        const allUsers = [...tecnicos, ...coordinadores];
        const foundUser = allUsers.find(u => {
          const fullName = `${u.nombre} ${u.apellido || ''}`.trim();
          return fullName.toLowerCase() === responsableInput.trim().toLowerCase() || 
                 u.nombre.toLowerCase() === responsableInput.trim().toLowerCase();
        });
        id_responsable = foundUser ? (foundUser.id_usuario || foundUser.id) : null;
      }

      // 3. Mapear empleados asociados (array de nombres a array de objetos con ID)
      const empleadosIds = (projectData.empleadosAsociados || []).map(empName => {
         const allUsers = [...tecnicos, ...coordinadores];
         // Si empName ya es un objeto con id, usarlo
         if (typeof empName === 'object' && (empName.id || empName.id_usuario)) {
            return { id_usuario: empName.id_usuario || empName.id };
         }
         // Si es string (nombre), buscar ID
         const user = allUsers.find(t => {
           const fullName = `${t.nombre} ${t.apellido || ''}`.trim();
           return fullName.toLowerCase() === String(empName).trim().toLowerCase();
         });
         return user ? { id_usuario: user.id_usuario || user.id } : null;
      }).filter(Boolean);

      // --- FIN LOGICA DE RESOLUCIÓN DE IDs ---

      // Mapear servicios (si es necesario enviar IDs) y filtrar cantidad > 0
      const serviciosMapped = (projectData.servicios || []).map(s => {
        const serviceObj = availableServices.find(serv => serv.nombre === s.servicio);
        const id = serviceObj ? (serviceObj.id_servicio || serviceObj.id) : (s.id_servicio || s.id);
        return {
          id_servicio: Number(id),
          cantidad: Number(s.cantidad) || 0,
          precio_unitario: Number(s.precio || s.precio_unitario) || 0,
          observaciones: s.observaciones || ""
        };
      }).filter(s => s.id_servicio && !isNaN(s.id_servicio) && s.cantidad > 0); 
      
      // Helper para limpiar fechas vacías
      const cleanDate = (dateStr) => (dateStr && dateStr.trim() !== "") ? dateStr : undefined;
      // Helper para limpiar números (costos)
      const cleanNumber = (numStr) => {
        if (numStr === "" || numStr === null || numStr === undefined) return 0;
        return Number(numStr);
      };

      const updatedData = {
        ...projectData,
        fecha_inicio: cleanDate(projectData.fechaInicio),
        fecha_fin: cleanDate(projectData.fechaFin),
        costo_mano_obra: cleanNumber(projectData.costos?.manoDeObra),
        numero_contrato: projectData.numeroContrato || "",
        empleadosAsociados: empleadosIds, // Enviar array de objetos o IDs según espere el backend
        servicios: serviciosMapped,
        // Map materials to backend format (id_producto, cantidad, precio_unitario) y filtrar cantidad > 0
         materiales: (projectData.materiales || []).map(m => {
           // Buscar el producto en la lista cargada para obtener su ID
           const productObj = availableProducts.find(p => p.nombre === m.item);
           // Si no se encuentra por nombre exacto, intentar buscar por similitud o asumir que ya tiene ID si es un objeto completo
           const id = productObj ? (productObj.id_producto || productObj.id) : (m.id_producto || m.id);
           
           return {
             id_producto: Number(id),
             cantidad: Number(m.cantidad) || 0,
             precio_unitario: Number(m.precio || m.precio_unitario) || 0
           };
         }).filter(m => m.id_producto && !isNaN(m.id_producto) && m.cantidad > 0) // Filter out items without valid product ID or zero quantity
       };

      // Aplanar sedes para el backend y limpiar datos
      if (updatedData.sedes && Array.isArray(updatedData.sedes)) {
        updatedData.sedes = updatedData.sedes.map(sede => {
          // Mapear materialesAsignados a IDs y limpiar
          const materialesAsignados = (sede.materialesAsignados || []).map(m => {
            const productObj = availableProducts.find(p => p.nombre === m.item);
            const id = productObj ? (productObj.id_producto || productObj.id) : (m.id_producto || m.id);
            return {
              id_producto: Number(id),
              cantidad: Number(m.cantidad) || 0
            };
          }).filter(m => m.id_producto && !isNaN(m.id_producto) && m.cantidad > 0);

          // Mapear serviciosAsignados a IDs y limpiar
          const serviciosAsignados = (sede.serviciosAsignados || []).map(s => {
            const serviceObj = availableServices.find(serv => serv.nombre === s.servicio);
            const id = serviceObj ? (serviceObj.id_servicio || serviceObj.id) : (s.id_servicio || s.id);
            return {
              id_servicio: Number(id),
              cantidad: Number(s.cantidad) || 0,
              precio_unitario: Number(s.precio || s.precio_unitario) || 0
            };
          }).filter(s => s.id_servicio && !isNaN(s.id_servicio) && s.cantidad > 0);

          // Construir objeto sede limpio, evitando campos nulos o no definidos en validación
          return {
            // Identificadores (si existen)
            ...(sede.id ? { id: sede.id } : {}),
            ...(sede.id_sede ? { id_sede: sede.id_sede } : {}),
            
            nombre: sede.nombre,
            ubicacion: sede.ubicacion || "", // Enviar string vacío si no hay ubicación, es seguro
            
            // Limpiar id_direccion: solo enviar si es un número válido
            ...(sede.id_direccion ? { id_direccion: Number(sede.id_direccion) } : {}),

            materialesAsignados,
            serviciosAsignados,
            
            presupuesto_materiales: Number(sede.presupuesto?.materiales || 0),
            presupuesto_servicios: Number(sede.presupuesto?.servicios || 0),
            presupuesto_total: Number(sede.presupuesto?.total || 0),
            presupuesto_restante: Number(sede.presupuesto?.restante !== undefined ? sede.presupuesto.restante : (sede.presupuesto?.total || 0)),
          };
        });
      }

      // Remove camelCase fields to avoid confusion or send clean object
      delete updatedData.fechaInicio;
      delete updatedData.fechaFin;
      delete updatedData.numeroContrato;

      // Agregar IDs solo si son válidos
      if (id_cliente) {
        updatedData.id_cliente = id_cliente;
      } else {
        console.warn("No se encontró ID para el cliente:", projectData.cliente);
        // Opcional: Mostrar error si el cliente es obligatorio y no se encuentra
        // showToast("Error: No se encontró el cliente seleccionado", "error");
        // return; 
      }

      if (id_responsable) {
        updatedData.id_responsable = id_responsable;
      } else {
        // Si es "Sin asignar" o no se encuentra, no enviamos el campo para evitar error de validación (isInt)
        // El backend mantendrá el valor actual (o null si ya lo era)
        console.warn("No se encontró ID para el responsable (o es Sin asignar):", projectData.responsable);
      }

      // Validar stock de materiales antes de enviar
      for (const mat of updatedData.materiales) {
        const product = availableProducts.find(p => (p.id_producto || p.id) === mat.id_producto);
        if (product) {
            // Calcular delta
            let delta = mat.cantidad;
            
            // Buscar cantidad original
            const originalMat = project.materiales?.find(m => {
                const mId = m.id_producto || m.id;
                return mId === mat.id_producto;
            });
            
            if (originalMat) {
                delta = mat.cantidad - (Number(originalMat.cantidad) || 0);
            }
            
            if (delta > 0 && delta > product.stock) {
                showToast(`Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}, Adicional Requerido: ${delta}`, "error");
                return;
            }
        }
      }

      await onUpdate(updatedData);
    } catch (error) {
      console.error("Error al actualizar:", error);
      // El toast de error ya se muestra en onUpdate si falla la API
      // showToast("Error al actualizar el proyecto", "error");
    }
  };

  const renderMaterialsAndServices = (type) => {
    const isMaterial = type === "materiales";
    const list = projectData[type] || [];
    const availableItems = isMaterial ? availableProducts : availableServices;
    const searchTerm = isMaterial ? materialSearch : servicioSearch;
    const setSearchTerm = isMaterial ? setMaterialSearch : setServicioSearch;
    const label = isMaterial ? "Materiales y Equipos" : "Servicios Incluidos";
    const placeholder = isMaterial ? "Buscar material..." : "Buscar servicio...";
    const idField = isMaterial ? "id_producto" : "id_servicio"; // O "id"
    const nameField = "nombre"; // Asumimos que tanto productos como servicios tienen "nombre" en available...

    // Filtrar items disponibles para búsqueda
    const filteredItems = availableItems.filter(item => {
      const name = item.nombre || item.item || item.servicio;
      const alreadyAdded = list.some(added => added.item === name || added.servicio === name);
      return !alreadyAdded && name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleAddItem = (item) => {
      const newItem = isMaterial 
        ? { 
            item: item.nombre, 
            cantidad: 1, 
            precio: item.precio || 0,
            id_producto: item.id_producto || item.id 
          }
        : { 
            servicio: item.nombre, 
            cantidad: 1, 
            precio: item.precio || 0,
            id_servicio: item.id_servicio || item.id 
          };
      
      setProjectData(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), newItem]
      }));
      setSearchTerm("");
    };

    return (
      <FormSection title={label}>
        {/* Buscador */}
        <div className="mb-4 relative">
          <FormLabel>Agregar {isMaterial ? "Material" : "Servicio"}</FormLabel>
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputBaseStyle}
          />
          {searchTerm && filteredItems.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  onClick={() => handleAddItem(item)}
                >
                  <div className="flex flex-col">
                    <span>{item.nombre}</span>
                    {isMaterial && (
                      <span className={`text-[10px] ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        Stock: {item.stock}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">
                    ${(item.precio || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          {searchTerm && filteredItems.length === 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3 text-gray-500 text-sm">
              No se encontraron resultados.
            </div>
          )}
        </div>

        {/* Lista de Items Agregados */}
        {list.length > 0 ? (
          <div className="space-y-3">
             <div className="grid grid-cols-[1fr,auto,auto,auto] gap-3 px-1 text-xs font-bold text-gray-500 mb-2">
                <span>Nombre</span>
                <span className="w-24 text-center">Cantidad</span>
                <span className="w-32 text-center">Precio Unit.</span>
                <span className="w-8"></span>
             </div>
            {list.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
                <div className="flex-1 font-medium text-gray-800 break-words">
                  {isMaterial ? item.item : item.servicio}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 sm:hidden">Cant.</span>
                    <input
                      type="number"
                      name="cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleListChange(index, e, type)}
                      className={`${inputBaseStyle} w-24 text-center`}
                      min="1"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 sm:hidden">Precio</span>
                    <input
                      type="number"
                      name="precio"
                      value={item.precio}
                      onChange={(e) => handleListChange(index, e, type)}
                      className={`${inputBaseStyle} w-32 text-right`}
                      min="0"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeListItem(index, type)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-gray-400">
            No hay {isMaterial ? "materiales" : "servicios"} agregados.
          </div>
        )}
      </FormSection>
    );
  };

  // --- LÓGICA PARA SEDES Y ASIGNACIÓN DE MATERIALES ---
  const openSedeModal = (sedeIdx = null) => {
    if (
      sedeIdx !== null &&
      Array.isArray(projectData.sedes) &&
      projectData.sedes[sedeIdx]
    ) {
      setSedeForm({
        ...projectData.sedes[sedeIdx],
        serviciosAsignados: projectData.sedes[sedeIdx].serviciosAsignados || [],
      });
      setEditingSede(sedeIdx);
    } else {
      // Crear NUEVA Sede - Heredar materiales y servicios del proyecto (con cantidad 0 por defecto)
      // Esto asegura que la sede tenga la estructura lista para asignar cantidades
      const materialesHeredados = (projectData.materiales || []).map(mat => ({
        item: mat.item,
        cantidad: 0, // Inicialmente 0, el usuario debe asignar
        id_producto: mat.id_producto
      }));

      const serviciosHeredados = (projectData.servicios || []).map(serv => ({
        servicio: serv.servicio,
        cantidad: 0, // Inicialmente 0
        precio: serv.precio,
        id_servicio: serv.id_servicio
      }));

      setSedeForm({
        nombre: "",
        ubicacion: "",
        materialesAsignados: materialesHeredados,
        serviciosAsignados: serviciosHeredados,
      });
      setEditingSede(null);
    }
    setSedeModalOpen(true);
  };
  const closeSedeModal = () => {
    setSedeModalOpen(false);
    setEditingSede(null);
    setSedeForm({
      nombre: "",
      ubicacion: "",
      materialesAsignados: [],
      serviciosAsignados: [],
    });
  };
  const handleSedeFormChange = (e) => {
    const { name, value } = e.target;
    setSedeForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleMaterialAsignadoChange = (idx, value) => {
    setSedeForm((prev) => {
      const materialesAsignados = [...(prev.materialesAsignados || [])];
      materialesAsignados[idx] = { ...materialesAsignados[idx], cantidad: value };
      return { ...prev, materialesAsignados };
    });
  };

  const handleRemoveMaterialFromSede = (idx) => {
    setSedeForm((prev) => {
      const materialesAsignados = [...(prev.materialesAsignados || [])];
      materialesAsignados.splice(idx, 1);
      return { ...prev, materialesAsignados };
    });
  };

  // Funciones para manejar servicios en sedes
  const handleServicioAsignadoChange = (idx, value) => {
    setSedeForm((prev) => {
      const serviciosAsignados = [...(prev.serviciosAsignados || [])];
      let val = Number(value);
      const serv = serviciosAsignados[idx];
      // Calcular cantidad disponible para este servicio
      const cantidadDisponible = getServicioDisponible(serv.servicio);
      const maxDisponible =
        cantidadDisponible +
        (editingSede !== null
          ? Number(
              projectData.sedes[editingSede].serviciosAsignados?.find(
                (s) => s.servicio === serv.servicio
              )?.cantidad || 0
            )
          : 0);
      if (val > maxDisponible) val = maxDisponible;
      serviciosAsignados[idx] = { ...serviciosAsignados[idx], cantidad: val };
      return { ...prev, serviciosAsignados };
    });
  };

  const handleRemoveServicioFromSede = (idx) => {
    setSedeForm((prev) => {
      const serviciosAsignados = [...(prev.serviciosAsignados || [])];
      serviciosAsignados.splice(idx, 1);
      return { ...prev, serviciosAsignados };
    });
  };

  const getServicioDisponible = (servicioName) => {
    // Total global - suma en todas las sedes (excepto la actual edición)
    const total =
      projectData.servicios.find((s) => s.servicio === servicioName)
        ?.cantidad || 0;
    let usado = 0;
    projectData.sedes.forEach((sede, idx) => {
      if (editingSede !== null && idx === editingSede) return;
      const serv = sede.serviciosAsignados?.find(
        (s) => s.servicio === servicioName
      );
      if (serv) usado += Number(serv.cantidad);
    });
    return total - usado;
  };
  const getMaterialDisponible = (itemName) => {
    // Total global - suma en todas las sedes (excepto la actual edición)
    const total =
      projectData.materiales.find((m) => m.item === itemName)?.cantidad || 0;
    let usado = 0;
    projectData.sedes.forEach((sede, idx) => {
      if (editingSede !== null && idx === editingSede) return;
      const mat = sede.materialesAsignados?.find((m) => m.item === itemName);
      if (mat) usado += Number(mat.cantidad);
    });
    return total - usado;
  };
  const handleSedeSubmit = () => {
    // Validar que no se excedan los materiales
    for (const mat of sedeForm.materialesAsignados || []) {
      const disponible =
        getMaterialDisponible(mat.item) +
        (editingSede !== null
          ? Number(
              projectData.sedes[editingSede].materialesAsignados?.find(
                (m) => m.item === mat.item
              )?.cantidad || 0
            )
          : 0);
      if (Number(mat.cantidad) > disponible) {
        showToast(
          `No puedes asignar más de ${disponible} unidades de ${mat.item} a esta sede.`,
          "error"
        );
        return;
      }
    }
    // Validar que no se excedan los servicios
    for (const serv of sedeForm.serviciosAsignados || []) {
      const disponible =
        getServicioDisponible(serv.servicio) +
        (editingSede !== null
          ? Number(
              projectData.sedes[editingSede].serviciosAsignados?.find(
                (s) => s.servicio === serv.servicio
              )?.cantidad || 0
            )
          : 0);
      if (Number(serv.cantidad) > disponible) {
        showToast(
          `No puedes asignar más de ${disponible} unidades de ${serv.servicio} a esta sede.`,
          "error"
        );
        return;
      }
    }
    if (!sedeForm.nombre.trim()) {
      showToast("El nombre de la sede es obligatorio", "error");
      return;
    }

    // Calcular presupuesto de la sede
    const presupuestoMateriales = (sedeForm.materialesAsignados || []).reduce(
      (sum, mat) => {
        const materialProyecto = projectData.materiales.find(
          (m) => m.item === mat.item
        );
        return sum + mat.cantidad * (materialProyecto?.precio || 0);
      },
      0
    );

    const presupuestoServicios = (sedeForm.serviciosAsignados || []).reduce(
      (sum, serv) => {
        const servicioProyecto = projectData.servicios.find(
          (s) => s.servicio === serv.servicio
        );
        return (
          sum + serv.cantidad * (servicioProyecto?.precio || serv.precio || 0)
        );
      },
      0
    );

    const sedeConPresupuesto = {
      ...sedeForm,
      presupuesto: {
        materiales: presupuestoMateriales,
        servicios: presupuestoServicios,
        total: presupuestoMateriales + presupuestoServicios,
      },
    };

    if (editingSede !== null) {
      // Editar sede existente
      setProjectData((prev) => {
        const sedes = [...prev.sedes];
        sedes[editingSede] = sedeConPresupuesto;
        return { ...prev, sedes };
      });
    } else {
      // Agregar nueva sede
      setProjectData((prev) => ({
        ...prev,
        sedes: [...prev.sedes, sedeConPresupuesto],
      }));
    }
    closeSedeModal();
  };
  const handleDeleteSede = (idx) => {
    setProjectData((prev) => {
      const sedes = [...prev.sedes];
      sedes.splice(idx, 1);
      return { ...prev, sedes };
    });
  };
  // --- UI PARA SEDES ---
  const renderSedesSection = () => (
    <FormSection title="Sedes y Presupuesto por Sede">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
          onClick={() => openSedeModal()}
        >
          Agregar Sede
        </button>
        {projectData.cliente && (
          <button
            type="button"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
            onClick={() => {
              const sedesPrecargadas = getSedesFromCliente(projectData.cliente);
              setProjectData((prev) => ({ ...prev, sedes: sedesPrecargadas }));
              showToast(
                "Sedes recargadas desde la información del cliente",
                "success"
              );
            }}
          >
            Recargar Sedes del Cliente
          </button>
        )}
      </div>

      {projectData.cliente &&
        Array.isArray(projectData.sedes) &&
        projectData.sedes.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>ℹ️ Información:</strong> Las sedes se han precargado
              automáticamente desde la información del cliente "
              {projectData.cliente}". Puedes editar cada sede para asignar
              materiales y servicios, o agregar nuevas sedes manualmente.
            </div>
          </div>
        )}

      {!(Array.isArray(projectData.sedes) && projectData.sedes.length > 0) && (
        <div className="text-gray-500 italic">
          {projectData.cliente
            ? "No hay sedes disponibles para este cliente."
            : "Selecciona un cliente para precargar las sedes automáticamente."}
        </div>
      )}
      <div className="space-y-4">
        {(Array.isArray(projectData.sedes) ? projectData.sedes : []).map(
          (sede, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-lg text-gray-800">
                    {sede.nombre}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Ubicación: {sede.ubicacion}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-lg font-bold hover:bg-yellow-500"
                    onClick={() => openSedeModal(idx)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600"
                    onClick={() => handleDeleteSede(idx)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Materiales asignados */}
              <div className="mb-3">
                <span className="font-semibold text-sm">
                  Materiales asignados:
                </span>
                {Array.isArray(sede.materialesAsignados) &&
                sede.materialesAsignados.length > 0 ? (
                  <ul className="ml-2 list-disc text-sm mt-1">
                    {sede.materialesAsignados.map((mat, i) => (
                      <li key={i}>
                        {mat.item}:{" "}
                        <span className="font-bold">{mat.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-400 italic text-sm">
                    Ninguno
                  </span>
                )}
              </div>

              {/* Servicios asignados */}
              <div className="mb-3">
                <span className="font-semibold text-sm">
                  Servicios asignados:
                </span>
                {Array.isArray(sede.serviciosAsignados) &&
                sede.serviciosAsignados.length > 0 ? (
                  <ul className="ml-2 list-disc text-sm mt-1">
                    {sede.serviciosAsignados.map((serv, i) => (
                      <li key={i}>
                        {serv.servicio}:{" "}
                        <span className="font-bold">{serv.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-400 italic text-sm">
                    Ninguno
                  </span>
                )}
              </div>

              {/* Presupuesto por sede */}
              {sede.presupuesto && (
                <div className="border-t pt-3 mt-3">
                  <div className="font-semibold text-sm mb-2 text-gray-700">
                    Presupuesto de esta sede:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Materiales:</span>
                      <span className="font-semibold">
                        {(sede.presupuesto.materiales || 0).toLocaleString(
                          "es-CO",
                          {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Servicios:</span>
                      <span className="font-semibold">
                        {(sede.presupuesto.servicios || 0).toLocaleString(
                          "es-CO",
                          {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between col-span-2 border-t pt-1 font-bold text-gray-900">
                      <span>Total sede:</span>
                      <span>
                        {(sede.presupuesto.total || 0).toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Resumen total de sedes */}
      {projectData.sedes.some((sede) => sede.presupuesto) && (
        <div className="border-t-2 border-gray-300 pt-4 mt-4">
          <div className="font-bold text-lg text-gray-800 mb-3">
            Resumen de Presupuesto por Sedes
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span>Total Materiales:</span>
              <span className="font-semibold">
                {projectData.sedes
                  .reduce(
                    (sum, sede) => sum + (sede.presupuesto?.materiales || 0),
                    0
                  )
                  .toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Servicios:</span>
              <span className="font-semibold">
                {projectData.sedes
                  .reduce(
                    (sum, sede) => sum + (sede.presupuesto?.servicios || 0),
                    0
                  )
                  .toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
              </span>
            </div>
            <div className="flex justify-between col-span-2 border-t pt-2 font-bold text-lg text-gray-900">
              <span>Total Sedes:</span>
              <span>
                {projectData.sedes
                  .reduce(
                    (sum, sede) => sum + (sede.presupuesto?.total || 0),
                    0
                  )
                  .toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
              </span>
            </div>
          </div>
        </div>
      )}
    </FormSection>
  );
  // --- MODAL PARA AGREGAR/EDITAR SEDE ---
  const renderSedeModal = () => {
    if (!sedeModalOpen) return null;
    // Materiales disponibles para asignar
    const materialesDisponibles = projectData.materiales;
    // Servicios disponibles para asignar
    const serviciosDisponibles = projectData.servicios;

    // Nueva función: cantidad asignada al proyecto para cada material
    const getCantidadAsignadaProyecto = (itemName) => {
      return (
        projectData.materiales.find((m) => m.item === itemName)?.cantidad || 0
      );
    };
    // Nueva función: cantidad ya asignada a otras sedes (excepto la actual edición)
    const getCantidadAsignadaOtrasSedes = (itemName) => {
      let usado = 0;
      projectData.sedes.forEach((sede, idx) => {
        if (editingSede !== null && idx === editingSede) return;
        const mat = sede.materialesAsignados?.find((m) => m.item === itemName);
        if (mat) usado += Number(mat.cantidad);
      });
      return usado;
    };

    // Funciones para servicios
    const getCantidadServicioAsignadaProyecto = (servicioName) => {
      return (
        projectData.servicios.find((s) => s.servicio === servicioName)
          ?.cantidad || 0
      );
    };
    const getCantidadServicioAsignadaOtrasSedes = (servicioName) => {
      let usado = 0;
      projectData.sedes.forEach((sede, idx) => {
        if (editingSede !== null && idx === editingSede) return;
        const serv = sede.serviciosAsignados?.find(
          (s) => s.servicio === servicioName
        );
        if (serv) usado += Number(serv.cantidad);
      });
      return usado;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={closeSedeModal}
          >
            <FaTimes />
          </button>
          <h3 className="text-xl font-bold mb-4">
            {editingSede !== null ? "Editar Sede" : "Agregar Sede"}
          </h3>
          <div className="space-y-6">
            <div>
              <FormLabel htmlFor="nombre">Nombre de la Sede</FormLabel>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={sedeForm.nombre}
                onChange={handleSedeFormChange}
                className={inputBaseStyle}
                required
              />
            </div>
            <div>
              <FormLabel htmlFor="ubicacion">Ubicación</FormLabel>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                value={sedeForm.ubicacion}
                onChange={handleSedeFormChange}
                className={inputBaseStyle}
              />
            </div>

            {/* Sección de Materiales */}
            <div>
              <FormLabel>Materiales a asignar</FormLabel>
              {materialesDisponibles.length === 0 && (
                <div className="text-gray-400 italic">
                  Primero agrega materiales al proyecto.
                </div>
              )}
              <div className="space-y-2">
                {materialesDisponibles.map((mat) => {
                  const asignadoIdx = (
                    sedeForm.materialesAsignados || []
                  ).findIndex((m) => m.item === mat.item);
                  const cantidadAsignada =
                    asignadoIdx !== -1
                      ? sedeForm.materialesAsignados[asignadoIdx].cantidad
                      : 0;
                  // Cantidad máxima para esta sede: lo asignado al proyecto menos lo ya asignado a otras sedes
                  const cantidadProyecto = Number(
                    getCantidadAsignadaProyecto(mat.item)
                  );
                  const cantidadOtrasSedes = Number(
                    getCantidadAsignadaOtrasSedes(mat.item)
                  );
                  // Si estamos editando, sumamos lo que ya tenía esta sede
                  const cantidadEstaSede =
                    editingSede !== null
                      ? Number(
                          projectData.sedes[
                            editingSede
                          ].materialesAsignados?.find(
                            (m) => m.item === mat.item
                          )?.cantidad || 0
                        )
                      : 0;
                  const maxDisponible =
                    cantidadProyecto - cantidadOtrasSedes + cantidadEstaSede;
                  // Color de advertencia para stock
                  let stockColor = "text-green-600";
                  if (maxDisponible === 0)
                    stockColor = "text-red-600 font-bold";
                  else if (maxDisponible > 0 && maxDisponible < 10)
                    stockColor = "text-yellow-500 font-semibold";
                  return (
                    <div key={mat.item} className="flex items-center gap-2">
                      <span className={`w-32 font-medium ${stockColor}`}>
                        {mat.item}{" "}
                        <span className="text-xs">
                          (Asignado al proyecto: {cantidadProyecto})
                        </span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={maxDisponible}
                        value={cantidadAsignada}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            Math.min(Number(e.target.value), maxDisponible)
                          );
                          if (asignadoIdx !== -1) {
                            handleMaterialAsignadoChange(asignadoIdx, val);
                          } else {
                            setSedeForm((prev) => ({
                              ...prev,
                              materialesAsignados: [
                                ...prev.materialesAsignados,
                                { item: mat.item, cantidad: val },
                              ],
                            }));
                          }
                        }}
                        className="w-24 border rounded p-1 text-sm"
                        disabled={maxDisponible === 0}
                      />
                      <span className={`text-xs ${stockColor}`}>
                        / {maxDisponible} disponibles
                      </span>
                      {asignadoIdx !== -1 && (
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handleRemoveMaterialFromSede(asignadoIdx)
                          }
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección de Servicios */}
            <div>
              <FormLabel>Servicios a asignar</FormLabel>
              {serviciosDisponibles.length === 0 && (
                <div className="text-gray-400 italic">
                  Primero agrega servicios al proyecto.
                </div>
              )}
              <div className="space-y-2">
                {serviciosDisponibles.map((serv) => {
                  const asignadoIdx = (
                    sedeForm.serviciosAsignados || []
                  ).findIndex((s) => s.servicio === serv.servicio);
                  const cantidadAsignada =
                    asignadoIdx !== -1
                      ? sedeForm.serviciosAsignados[asignadoIdx].cantidad
                      : 0;
                  // Cantidad máxima para esta sede: lo asignado al proyecto menos lo ya asignado a otras sedes
                  const cantidadProyecto = Number(
                    getCantidadServicioAsignadaProyecto(serv.servicio)
                  );
                  const cantidadOtrasSedes = Number(
                    getCantidadServicioAsignadaOtrasSedes(serv.servicio)
                  );
                  // Si estamos editando, sumamos lo que ya tenía esta sede
                  const cantidadEstaSede =
                    editingSede !== null
                      ? Number(
                          projectData.sedes[
                            editingSede
                          ].serviciosAsignados?.find(
                            (s) => s.servicio === serv.servicio
                          )?.cantidad || 0
                        )
                      : 0;
                  const maxDisponible =
                    cantidadProyecto - cantidadOtrasSedes + cantidadEstaSede;
                  // Color de advertencia para disponibilidad
                  let stockColor = "text-green-600";
                  if (maxDisponible === 0)
                    stockColor = "text-red-600 font-bold";
                  else if (maxDisponible > 0 && maxDisponible < 5)
                    stockColor = "text-yellow-500 font-semibold";
                  return (
                    <div
                      key={serv.servicio}
                      className="flex items-center gap-2"
                    >
                      <span className={`w-32 font-medium ${stockColor}`}>
                        {serv.servicio}{" "}
                        <span className="text-xs">
                          (Asignado al proyecto: {cantidadProyecto})
                        </span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={maxDisponible}
                        value={cantidadAsignada}
                        onChange={(e) => {
                          const val = Math.max(
                            0,
                            Math.min(Number(e.target.value), maxDisponible)
                          );
                          if (asignadoIdx !== -1) {
                            handleServicioAsignadoChange(asignadoIdx, val);
                          } else {
                            setSedeForm((prev) => ({
                              ...prev,
                              serviciosAsignados: [
                                ...prev.serviciosAsignados,
                                {
                                  servicio: serv.servicio,
                                  cantidad: val,
                                  precio: serv.precio,
                                },
                              ],
                            }));
                          }
                        }}
                        className="w-24 border rounded p-1 text-sm"
                        disabled={maxDisponible === 0}
                      />
                      <span className={`text-xs ${stockColor}`}>
                        / {maxDisponible} disponibles
                      </span>
                      {asignadoIdx !== -1 && (
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handleRemoveServicioFromSede(asignadoIdx)
                          }
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-300"
                onClick={closeSedeModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
                onClick={handleSedeSubmit}
              >
                {editingSede !== null ? "Guardar Cambios" : "Agregar Sede"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const selectedClient = projectData.cliente 
    ? clientes.find(c => c.nombre === projectData.cliente)
    : null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Editar Proyecto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl p-2"
          >
            <FaTimes />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300"
        >
          <FormSection title="Información Principal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="relative">
                <FormLabel htmlFor="nombre">
                  Nombre del Proyecto{" "}
                  <span
                    aria-label="Ayuda"
                    tabIndex="0"
                    role="tooltip"
                    className="ml-1 text-blue-500 cursor-pointer"
                    title="El nombre debe ser único y descriptivo."
                  >
                    ⓘ
                  </span>
                </FormLabel>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={projectData.nombre}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${
                    errors.nombre ? "border-red-500 ring-2 ring-red-300" : ""
                  }`}
                  required
                  aria-invalid={!!errors.nombre}
                  aria-describedby="error-nombre"
                />
                {errors.nombre && (
                  <span
                    id="error-nombre"
                    className="text-red-500 text-xs flex items-center gap-1 mt-1"
                  >
                    <span role="img" aria-label="error">
                      ❌
                    </span>{" "}
                    {errors.nombre}
                  </span>
                )}
              </div>
              <div>
                <FormLabel htmlFor="numeroContrato">
                  Número de Contrato
                </FormLabel>
                <input
                  id="numeroContrato"
                  type="text"
                  name="numeroContrato"
                  value={projectData.numeroContrato}
                  onChange={handleChange}
                  className={inputBaseStyle}
                />
              </div>
              <div>
                <FormLabel htmlFor="cliente">Cliente</FormLabel>
                <select
                  id="cliente"
                  name="cliente"
                  value={projectData.cliente}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                >
                  <option value="" disabled>
                    Selecciona un cliente...
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id || c.nombre} value={c.nombre}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {selectedClient && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm">
                    <div className="font-semibold text-blue-800 mb-2 border-b border-blue-200 pb-1">
                      Información del Cliente
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-gray-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Documento:</span>
                        <span>{selectedClient.documento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tipo:</span>
                        <span>{selectedClient.tipo_documento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Correo:</span>
                        <span className="truncate max-w-[150px]" title={selectedClient.correo}>
                          {selectedClient.correo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Teléfono:</span>
                        <span>{selectedClient.telefono}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <FormLabel htmlFor="responsable">Responsable</FormLabel>
                <select
                  id="responsable"
                  name="responsable"
                  value={projectData.responsable}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                >
                  <option value="" disabled>
                    Selecciona un responsable...
                  </option>
                  {coordinadores.map((u) => (
                    <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>
                      {u.nombre} {u.apellido}
                    </option>
                  ))}
                </select>
                <span className="text-red-500 text-xs">
                  {errors.responsable}
                </span>
              </div>
              <div>
                <FormLabel htmlFor="fechaInicio">Fecha de Inicio</FormLabel>
                <input
                  id="fechaInicio"
                  type="date"
                  name="fechaInicio"
                  value={projectData.fechaInicio}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${
                    errors.fechaInicio ? "border-red-500 ring-2 ring-red-300" : ""
                  }`}
                  required
                />
                {errors.fechaInicio && (
                  <span className="text-red-500 text-xs flex items-center gap-1 mt-1">
                    <span role="img" aria-label="error">❌</span> {errors.fechaInicio}
                  </span>
                )}
              </div>
              <div>
                <FormLabel htmlFor="fechaFin">Fecha de Fin</FormLabel>
                <input
                  id="fechaFin"
                  type="date"
                  name="fechaFin"
                  value={projectData.fechaFin}
                  onChange={handleChange}
                  className={inputBaseStyle}
                  required
                />
              </div>
              <div>
                <FormLabel htmlFor="estado">Estado Inicial</FormLabel>
                <select
                  id="estado"
                  name="estado"
                  value={projectData.estado}
                  onChange={handleChange}
                  className={inputBaseStyle}
                >
                  <option>Pendiente</option>
                  <option>En Progreso</option>
                  <option>En Pausa</option>
                  <option>Completado</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div>
                <FormLabel htmlFor="prioridad">Prioridad</FormLabel>
                <select
                  id="prioridad"
                  name="prioridad"
                  value={projectData.prioridad}
                  onChange={handleChange}
                  className={inputBaseStyle}
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                </select>
              </div>
              <div>
                <FormLabel htmlFor="progreso">Progreso (%)</FormLabel>
                <input
                  id="progreso"
                  type="number"
                  name="progreso"
                  value={projectData.progreso || 0}
                  onChange={handleChange}
                  className={`${inputBaseStyle} ${!isAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  min="0"
                  max="100"
                  disabled={!isAdmin}
                  title={!isAdmin ? "Solo el administrador puede editar el progreso" : ""}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Detalles del Proyecto">
            <div>
              <FormLabel htmlFor="ubicacion">Ubicación</FormLabel>
              <input
                id="ubicacion"
                type="text"
                name="ubicacion"
                value={projectData.ubicacion}
                onChange={handleChange}
                className={inputBaseStyle}
              />
            </div>
            <div>
              <FormLabel htmlFor="descripcion">
                Descripción del Proyecto
              </FormLabel>
              <textarea
                id="descripcion"
                name="descripcion"
                value={projectData.descripcion}
                onChange={handleChange}
                rows="3"
                className={inputBaseStyle}
              ></textarea>
            </div>
          </FormSection>

          <FormSection title="Equipo del Proyecto">
            <div>
              <FormLabel htmlFor="empleadosAsociados">
                Empleados Asociados
              </FormLabel>
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={empleadoSearch}
                onChange={(e) => setEmpleadoSearch(e.target.value)}
                className={inputBaseStyle}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {projectData.empleadosAsociados.map((emp) => (
                  <span
                    key={emp}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {emp}
                    <button
                      type="button"
                      onClick={() =>
                        setProjectData((prev) => ({
                          ...prev,
                          empleadosAsociados: prev.empleadosAsociados.filter(
                            (e) => e !== emp
                          ),
                        }))
                      }
                      className="text-blue-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded bg-white shadow">
                {tecnicos
                  .map((t) => `${t.nombre} ${t.apellido}`)
                  .filter(
                    (emp) =>
                      emp
                        .toLowerCase()
                        .includes(empleadoSearch.toLowerCase()) &&
                      !projectData.empleadosAsociados.includes(emp)
                  )
                  .map((emp, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        setProjectData((prev) => ({
                          ...prev,
                          empleadosAsociados: [...prev.empleadosAsociados, emp],
                        }))
                      }
                    >
                      {emp}
                    </div>
                  ))}
              </div>
              {errors.empleadosAsociados && (
                <span className="text-xs text-red-500">
                  {errors.empleadosAsociados}
                </span>
              )}
            </div>
          </FormSection>

          {renderMaterialsAndServices("materiales")}
          {renderMaterialsAndServices("servicios")}

          <FormSection title="Costos Adicionales">
            <div>
              <FormLabel htmlFor="manoDeObra">
                Costo de Mano de Obra (COP)
              </FormLabel>
              <input
                id="manoDeObra"
                type="number"
                name="manoDeObra"
                value={projectData.costos.manoDeObra}
                onChange={handleChange}
                className={inputBaseStyle}
                placeholder="Ej: 1500000"
                min="0"
              />
            </div>
          </FormSection>

          <FormSection title="Observaciones">
            <div>
              <FormLabel htmlFor="observaciones">Notas Adicionales</FormLabel>
              <textarea
                id="observaciones"
                name="observaciones"
                rows="3"
                value={projectData.observaciones}
                onChange={handleChange}
                className={inputBaseStyle}
                placeholder="Comentarios del cliente, etc."
              />
            </div>
          </FormSection>

          {renderSedesSection()}
          {renderSedeModal()}

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105"
            >
              Guardar Cambios
            </button>
            {Object.keys(errors).length > 0 && (
              <div className="text-red-500 text-sm mt-2">
                Corrige los errores antes de guardar.
              </div>
            )}
          </div>
        </form>
      </div>
      {/* Modal para motivo de pausa */}
      {showPauseModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4"
          onClick={(e) => e.stopPropagation()} // Detener propagación para no cerrar el modal padre
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()} // Detener propagación
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Pausar Proyecto
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Por favor, ingrese el motivo por el cual se pausa el proyecto (ej. falta de pago).
            </p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              rows="4"
              placeholder="Escriba el motivo aquí..."
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setPauseReason("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPause}
                className="px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 font-medium"
              >
                Confirmar Pausa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProjectModal;
