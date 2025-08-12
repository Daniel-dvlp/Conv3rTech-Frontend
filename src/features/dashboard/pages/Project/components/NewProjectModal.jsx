// src/features/dashboard/pages/project/components/NewProjectModal.jsx

import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { useState as useAutocompleteState } from 'react';
import { showToast } from '../../../../../shared/utils/alertas';
import { mockProducts } from '../../products/data/Products_data';
import MockServices from '../../services/data/Services_data';
import { mockClientes } from '../../clients/data/Clientes_data';
import { mockUsuarios } from '../../users/data/User_data';

// Componente reutilizable para las secciones del formulario
const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// Componente reutilizable para las etiquetas
const FormLabel = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

// Estilo base para todos los inputs y selects
const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";


const NewProjectModal = ({ isOpen, onClose, onSave }) => {
  // --- TU LÓGICA DE ESTADO Y MANEJADORES (SIN NINGÚN CAMBIO) ---
  const initialState = {
    nombre: '', numeroContrato: '', cliente: '', responsable: '',
    fechaInicio: '', fechaFin: '', estado: 'Pendiente', prioridad: 'Media',
    descripcion: '', ubicacion: '', observaciones: '',
    empleadosAsociados: [],
    materiales: [],
    servicios: [],
    costos: { manoDeObra: '' },
    sedes: [], // <-- NUEVO
  };
  const [projectData, setProjectData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [empleadoSearch, setEmpleadoSearch] = useState('');
  const [sedeModalOpen, setSedeModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState(null); // null o índice de sede
  const [sedeForm, setSedeForm] = useState({ 
    nombre: '', 
    ubicacion: '', 
    materialesAsignados: [],
    serviciosAsignados: []
  });

  if (!isOpen) return null;

  // Función helper para obtener las sedes de un cliente
  const getSedesFromCliente = (nombreCliente) => {
    const cliente = mockClientes.find(c => c.nombre === nombreCliente);
    return cliente?.direcciones?.map(direccion => ({
      nombre: direccion.nombre,
      ubicacion: `${direccion.direccion}, ${direccion.ciudad}`,
      materialesAsignados: [],
      serviciosAsignados: [],
      presupuesto: {
        materiales: 0,
        servicios: 0,
        total: 0
      }
    })) || [];
  };

  // --- VALIDACIONES EN TIEMPO REAL ---
  const todayStr = new Date().toISOString().split('T')[0];
  const validateField = (name, value) => {
    let error = '';
    if (name === 'nombre' && !value.trim()) error = 'El nombre es obligatorio';
    if (name === 'cliente' && !value) error = 'Selecciona un cliente';
    if (name === 'responsable' && !value) error = 'Selecciona un responsable';
    if (name === 'fechaInicio' && !value) error = 'Selecciona la fecha de inicio';
    if (name === 'fechaInicio' && value && value < todayStr) error = 'La fecha de inicio no puede ser menor al día actual';
    if (name === 'fechaFin' && !value) error = 'Selecciona la fecha de fin';
    if (name === 'fechaFin' && value && projectData.fechaInicio && value < projectData.fechaInicio) error = 'La fecha de fin no puede ser antes que la de inicio';
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'manoDeObra') {
      setProjectData(prev => ({ ...prev, costos: { ...prev.costos, manoDeObra: value }}));
    } else if (name === 'cliente') {
      // Cuando se selecciona un cliente, precargar las sedes basándose en sus direcciones
      const sedesPrecargadas = getSedesFromCliente(value);
      
      setProjectData(prev => ({ 
        ...prev, 
        [name]: value,
        sedes: sedesPrecargadas
      }));
    } else {
      setProjectData(prev => ({ ...prev, [name]: value }));
    }
    // Validación en tiempo real
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    // Validación cruzada para fechas
    if ((name === 'fechaInicio' || name === 'fechaFin')) {
      const fin = name === 'fechaFin' ? value : projectData.fechaFin;
      const inicio = name === 'fechaInicio' ? value : projectData.fechaInicio;
      if (fin && inicio && fin < inicio) {
        setErrors(prev => ({ ...prev, fechaFin: 'La fecha de fin no puede ser antes que la de inicio' }));
      } else {
        setErrors(prev => ({ ...prev, fechaFin: '' }));
      }
    }
  };
  // Forzar re-render al cambiar materiales o sedes para actualizar stock en tiempo real
  // (esto ya ocurre porque el estado projectData cambia, pero aseguramos que handleListChange y handleMaterialAsignadoChange actualicen correctamente)

  // handleListChange ya actualiza el estado y fuerza re-render, pero asegúrate de que la cantidad no supere el stock disponible
  const handleListChange = (index, event, listName) => {
    const { name, value } = event.target;
    const updatedList = [...projectData[listName]];
    if (listName === 'materiales' && name === 'cantidad') {
      const itemName = updatedList[index].item;
      const stockDisponible = getStockDisponible(itemName);
      let val = Number(value);
      if (val > stockDisponible) val = stockDisponible;
      updatedList[index][name] = val;
    } else {
      updatedList[index][name] = value;
    }
    setProjectData((prev) => ({ ...prev, [listName]: updatedList }));
  };
  const addListItem = (listName) => {
    const newItem = listName === 'materiales'
      ? { item: '', cantidad: 1, precio: '' }
      : { servicio: '', cantidad: 1, precio: '' };
    setProjectData((prev) => ({ ...prev, [listName]: [...prev[listName], newItem] }));
  };
  const removeListItem = (index, listName) => {
    const updatedList = [...projectData[listName]];
    updatedList.splice(index, 1);
    setProjectData((prev) => ({ ...prev, [listName]: updatedList }));
  };
  const handleEquipoChange = (e) => {
    const { value, checked } = e.target;
    let newEquipo = [...projectData.empleadosAsociados];
    if (checked) {
      newEquipo.push(value);
    } else {
      newEquipo = newEquipo.filter(emp => emp !== value);
    }
    setProjectData(prev => ({ ...prev, empleadosAsociados: newEquipo }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validaciones
    const newErrors = {};
    if (!projectData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!projectData.cliente) newErrors.cliente = 'Selecciona un cliente';
    if (!projectData.responsable) newErrors.responsable = 'Selecciona un responsable';
    if (!projectData.fechaInicio) newErrors.fechaInicio = 'Selecciona la fecha de inicio';
    if (projectData.fechaInicio && projectData.fechaInicio < todayStr) newErrors.fechaInicio = 'La fecha de inicio no puede ser menor al día actual';
    if (!projectData.fechaFin) newErrors.fechaFin = 'Selecciona la fecha de fin';
    if (projectData.fechaFin && projectData.fechaInicio && projectData.fechaFin < projectData.fechaInicio) newErrors.fechaFin = 'La fecha de fin no puede ser antes que la de inicio';
    if (projectData.empleadosAsociados.length === 0) newErrors.empleadosAsociados = 'Selecciona al menos un empleado';
    if (projectData.materiales.length === 0) newErrors.materiales = 'Agrega al menos un material';
    if (projectData.servicios.length === 0) newErrors.servicios = 'Agrega al menos un servicio';
    // Validar stock de materiales
    for (const mat of projectData.materiales) {
      const prod = productos.find(p => p.nombre === mat.item);
      if (prod) {
        const totalAsignado = Number(mat.cantidad) + projectData.sedes.reduce((acc, sede) => {
          const found = sede.materialesAsignados.find(m => m.item === mat.item);
          return acc + (found ? Number(found.cantidad) : 0);
        }, 0);
        if (totalAsignado > prod.stock) {
          newErrors.materiales = `No puedes asignar más de ${prod.stock} unidades de ${prod.nombre} (stock disponible)`;
        }
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('Por favor, corrige los errores del formulario.', 'error');
      return;
    }
    try {
      onSave({ ...projectData, id: `P-${Date.now()}` });
      showToast('Proyecto creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear el proyecto', 'error');
    }
    setProjectData(initialState);
    setErrors({});
    onClose();
  };
  // -----------------------------------------------------------------

  // --- LÓGICA PARA SEDES Y ASIGNACIÓN DE MATERIALES ---
  const openSedeModal = (sedeIdx = null) => {
    if (sedeIdx !== null) {
      setSedeForm({ 
        ...projectData.sedes[sedeIdx],
        serviciosAsignados: projectData.sedes[sedeIdx].serviciosAsignados || []
      });
      setEditingSede(sedeIdx);
    } else {
      setSedeForm({ nombre: '', ubicacion: '', materialesAsignados: [], serviciosAsignados: [] });
      setEditingSede(null);
    }
    setSedeModalOpen(true);
  };
  const closeSedeModal = () => {
    setSedeModalOpen(false);
    setEditingSede(null);
    setSedeForm({ nombre: '', ubicacion: '', materialesAsignados: [], serviciosAsignados: [] });
  };
  const handleSedeFormChange = (e) => {
    const { name, value } = e.target;
    setSedeForm(prev => ({ ...prev, [name]: value }));
  };
  // handleMaterialAsignadoChange ya actualiza el estado y fuerza re-render, pero asegúrate de que la cantidad no supere el stock disponible
  const handleMaterialAsignadoChange = (idx, value) => {
    setSedeForm(prev => {
      const materialesAsignados = [...prev.materialesAsignados];
      let val = Number(value);
      const mat = materialesAsignados[idx];
      // Calcular stock disponible para este material
      const prod = productos.find(p => p.nombre === mat.item);
      const stockDisponible = prod ? prod.stock - projectData.materiales.filter(m => m.item === mat.item).reduce((acc, m) => acc + Number(m.cantidad), 0) - projectData.sedes.reduce((acc, sede, sidx) => {
        if (editingSede !== null && sidx === editingSede) return acc;
        const found = sede.materialesAsignados.find(m => m.item === mat.item);
        return acc + (found ? Number(found.cantidad) : 0);
      }, 0) : 0;
      const maxDisponible = stockDisponible + (editingSede !== null ? Number(projectData.sedes[editingSede].materialesAsignados.find(m => m.item === mat.item)?.cantidad || 0) : 0);
      if (val > maxDisponible) val = maxDisponible;
      materialesAsignados[idx].cantidad = val;
      return { ...prev, materialesAsignados };
    });
  };
  const handleAddMaterialToSede = (item) => {
    setSedeForm(prev => {
      if (prev.materialesAsignados.some(m => m.item === item.item)) return prev;
      return { ...prev, materialesAsignados: [...prev.materialesAsignados, { item: item.item, cantidad: 0 }] };
    });
  };
  const handleRemoveMaterialFromSede = (idx) => {
    setSedeForm(prev => {
      const materialesAsignados = [...prev.materialesAsignados];
      materialesAsignados.splice(idx, 1);
      return { ...prev, materialesAsignados };
    });
  };

  // Funciones para manejar servicios en sedes
  const handleServicioAsignadoChange = (idx, value) => {
    setSedeForm(prev => {
      const serviciosAsignados = [...prev.serviciosAsignados];
      let val = Number(value);
      const serv = serviciosAsignados[idx];
      // Calcular cantidad disponible para este servicio
      const cantidadDisponible = getServicioDisponible(serv.servicio);
      const maxDisponible = cantidadDisponible + (editingSede !== null ? Number(projectData.sedes[editingSede].serviciosAsignados.find(s => s.servicio === serv.servicio)?.cantidad || 0) : 0);
      if (val > maxDisponible) val = maxDisponible;
      serviciosAsignados[idx].cantidad = val;
      return { ...prev, serviciosAsignados };
    });
  };

  const handleAddServicioToSede = (servicio) => {
    setSedeForm(prev => {
      if (prev.serviciosAsignados.some(s => s.servicio === servicio.servicio)) return prev;
      return { ...prev, serviciosAsignados: [...prev.serviciosAsignados, { servicio: servicio.servicio, cantidad: 0, precio: servicio.precio }] };
    });
  };

  const handleRemoveServicioFromSede = (idx) => {
    setSedeForm(prev => {
      const serviciosAsignados = [...prev.serviciosAsignados];
      serviciosAsignados.splice(idx, 1);
      return { ...prev, serviciosAsignados };
    });
  };

  const getServicioDisponible = (servicioName) => {
    // Total global - suma en todas las sedes (excepto la actual edición)
    const total = (projectData.servicios.find(s => s.servicio === servicioName)?.cantidad) || 0;
    let usado = 0;
    projectData.sedes.forEach((sede, idx) => {
      if (editingSede !== null && idx === editingSede) return;
      const serv = sede.serviciosAsignados?.find(s => s.servicio === servicioName);
      if (serv) usado += Number(serv.cantidad);
    });
    return total - usado;
  };
  const getMaterialDisponible = (itemName) => {
    // Total global - suma en todas las sedes (excepto la actual edición)
    const total = (projectData.materiales.find(m => m.item === itemName)?.cantidad) || 0;
    let usado = 0;
    projectData.sedes.forEach((sede, idx) => {
      if (editingSede !== null && idx === editingSede) return;
      const mat = sede.materialesAsignados.find(m => m.item === itemName);
      if (mat) usado += Number(mat.cantidad);
    });
    return total - usado;
  };
  const handleSedeSubmit = () => {
    // Validar que no se excedan los materiales
    for (const mat of sedeForm.materialesAsignados || []) {
      const disponible = getMaterialDisponible(mat.item) + (editingSede !== null ? Number(projectData.sedes[editingSede].materialesAsignados?.find(m => m.item === mat.item)?.cantidad || 0) : 0);
      if (Number(mat.cantidad) > disponible) {
        showToast(`No puedes asignar más de ${disponible} unidades de ${mat.item} a esta sede.`, 'error');
        return;
      }
    }
    // Validar que no se excedan los servicios
    for (const serv of sedeForm.serviciosAsignados || []) {
      const disponible = getServicioDisponible(serv.servicio) + (editingSede !== null ? Number(projectData.sedes[editingSede].serviciosAsignados?.find(s => s.servicio === serv.servicio)?.cantidad || 0) : 0);
      if (Number(serv.cantidad) > disponible) {
        showToast(`No puedes asignar más de ${disponible} unidades de ${serv.servicio} a esta sede.`, 'error');
        return;
      }
    }
    if (!sedeForm.nombre.trim()) {
      showToast('El nombre de la sede es obligatorio', 'error');
      return;
    }

    // Calcular presupuesto de la sede
    const presupuestoMateriales = (sedeForm.materialesAsignados || []).reduce((sum, mat) => {
      const materialProyecto = projectData.materiales.find(m => m.item === mat.item);
      return sum + (mat.cantidad * (materialProyecto?.precio || 0));
    }, 0);

    const presupuestoServicios = (sedeForm.serviciosAsignados || []).reduce((sum, serv) => {
      const servicioProyecto = projectData.servicios.find(s => s.servicio === serv.servicio);
      return sum + (serv.cantidad * (servicioProyecto?.precio || serv.precio || 0));
    }, 0);

    const sedeConPresupuesto = {
      ...sedeForm,
      presupuesto: {
        materiales: presupuestoMateriales,
        servicios: presupuestoServicios,
        total: presupuestoMateriales + presupuestoServicios
      }
    };

    if (editingSede !== null) {
      // Editar sede existente
      setProjectData(prev => {
        const sedes = [...prev.sedes];
        sedes[editingSede] = sedeConPresupuesto;
        return { ...prev, sedes };
      });
    } else {
      // Agregar nueva sede
      setProjectData(prev => ({ ...prev, sedes: [...prev.sedes, sedeConPresupuesto] }));
    }
    closeSedeModal();
  };
  const handleDeleteSede = (idx) => {
    setProjectData(prev => {
      const sedes = [...prev.sedes];
      sedes.splice(idx, 1);
      return { ...prev, sedes };
    });
  };
  // -----------------------------------------------------------------

  // --- Para materiales: usar productos ---
  const productos = mockProducts;
  // --- Para servicios: usar servicios ---
  const serviciosDisponibles = MockServices;

  // Calcular stock disponible de un producto
  const getStockDisponible = (nombreProducto) => {
    const prod = productos.find(p => p.nombre === nombreProducto);
    if (!prod) return 0;
    // Suma de cantidades asignadas en materiales y sedes
    const cantidadMateriales = projectData.materiales.filter(m => m.item === nombreProducto).reduce((acc, m) => acc + Number(m.cantidad), 0);
    const cantidadSedes = projectData.sedes.reduce((acc, sede) => {
      const found = sede.materialesAsignados.find(m => m.item === nombreProducto);
      return acc + (found ? Number(found.cantidad) : 0);
    }, 0);
    return prod.stock - cantidadMateriales - cantidadSedes;
  };

  const renderListInputs = (listName, label) => {
    const items = projectData[listName];
    const singularLabel = listName === 'materiales' ? 'Material' : 'Servicio';
    return (
      <FormSection title={label}>
        <div className="space-y-4">
          {/* Encabezados para la lista */}
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-3 px-1 text-xs font-bold text-gray-500">
              <span>Nombre del {singularLabel.toLowerCase()}</span>
              <span className="w-20 text-center">Cantidad</span>
              <span className="w-28 text-center">Precio Unitario</span>
              <span className="w-28 text-center">Precio Total</span>
              <span className="w-10 text-center"></span>
          </div>
          {items.map((item, index) => {
            let precioUnitario = item.precio;
            let stockDisponible = undefined;
            if (listName === 'materiales') {
              const prod = productos.find(p => p.nombre === item.item);
              precioUnitario = prod ? prod.precio : '';
              stockDisponible = getStockDisponible(item.item);
            }
            if (listName === 'servicios') {
              const serv = serviciosDisponibles.find(s => s.nombre === item.servicio);
              precioUnitario = serv ? serv.precio : '';
            }
            const cantidad = Number(item.cantidad) || 0;
            const total = cantidad * (Number(precioUnitario) || 0);
            // Color de advertencia para stock
            let stockColor = 'text-green-600';
            if (stockDisponible === 0) stockColor = 'text-red-600 font-bold';
            else if (stockDisponible > 0 && stockDisponible < 10) stockColor = 'text-yellow-500 font-semibold';
            return (
              <div key={index} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-3 items-center">
                {listName === 'materiales' ? (
                  <div className="flex flex-col">
                    <select name="item" value={item.item} onChange={e => handleListChange(index, e, listName)} className={inputBaseStyle} required>
                      <option value="" disabled>Selecciona un producto...</option>
                      {productos.map(p => {
                        const stock = getStockDisponible(p.nombre);
                        let color = 'text-green-600';
                        if (stock === 0) color = 'text-red-600 font-bold';
                        else if (stock > 0 && stock < 10) color = 'text-yellow-500 font-semibold';
                        return (
                          <option key={p.id} value={p.nombre} disabled={stock === 0} className={color}>
                            {p.nombre} (Stock: {stock})
                          </option>
                        );
                      })}
                    </select>
                    {item.item && (
                      <span className={`text-xs mt-1 ${stockColor}`}>
                        {stockDisponible === 0
                          ? 'Sin stock disponible'
                          : stockDisponible < 10
                            ? `¡Advertencia! Solo quedan ${stockDisponible} en stock`
                            : `Stock disponible: ${stockDisponible}`}
                      </span>
                    )}
                  </div>
                ) : (
                  <select name="servicio" value={item.servicio} onChange={e => handleListChange(index, e, listName)} className={inputBaseStyle} required>
                    <option value="" disabled>Selecciona un servicio...</option>
                    {serviciosDisponibles.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                  </select>
                )}
                <input type="number" name="cantidad" value={item.cantidad} onChange={e => {
                  // Validar que no se pueda poner más que el stock disponible
                  let val = Number(e.target.value);
                  if (listName === 'materiales' && stockDisponible !== undefined && val > stockDisponible) {
                    val = stockDisponible;
                  }
                  handleListChange(index, { target: { name: 'cantidad', value: val } }, listName);
                }} className={`${inputBaseStyle} w-20 text-center`} required min="1" max={listName === 'materiales' ? stockDisponible : undefined} disabled={listName === 'materiales' && stockDisponible === 0} />
                <input type="number" name="precio" value={precioUnitario} readOnly className={`${inputBaseStyle} w-28`} required min="0" placeholder="COP" />
                <span className="w-28 text-center font-semibold text-gray-700">{total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                <button type="button" onClick={() => removeListItem(index, listName)} className="p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => addListItem(listName)} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors">
          <FaPlus size={12} /> Agregar {singularLabel}
        </button>
      </FormSection>
    );
  };

  // --- SECCIÓN DE SEDES CON PRESUPUESTO ---
  const renderSedesSection = () => {
    return (
      <FormSection title="Sedes y Presupuesto por Sede">
        <div className="flex gap-2 mb-4">
          <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700" onClick={() => openSedeModal()}>Agregar Sede</button>
          {projectData.cliente && (
            <button 
              type="button" 
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700" 
              onClick={() => {
                const sedesPrecargadas = getSedesFromCliente(projectData.cliente);
                setProjectData(prev => ({ ...prev, sedes: sedesPrecargadas }));
                showToast('Sedes recargadas desde la información del cliente', 'success');
              }}
            >
              Recargar Sedes del Cliente
            </button>
          )}
        </div>
        
        {projectData.cliente && Array.isArray(projectData.sedes) && projectData.sedes.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>ℹ️ Información:</strong> Las sedes se han precargado automáticamente desde la información del cliente "{projectData.cliente}". 
              Puedes editar cada sede para asignar materiales y servicios, o agregar nuevas sedes manualmente.
            </div>
          </div>
        )}
        
        {!(Array.isArray(projectData.sedes) && projectData.sedes.length > 0) && (
          <div className="text-gray-500 italic">
            {projectData.cliente ? 'No hay sedes disponibles para este cliente.' : 'Selecciona un cliente para precargar las sedes automáticamente.'}
          </div>
        )}
        <div className="space-y-4">
          {(Array.isArray(projectData.sedes) ? projectData.sedes : []).map((sede, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-lg text-gray-800">{sede.nombre}</div>
                  <div className="text-gray-600 text-sm">Ubicación: {sede.ubicacion}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-lg font-bold hover:bg-yellow-500" onClick={() => openSedeModal(idx)}>Editar</button>
                  <button type="button" className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600" onClick={() => handleDeleteSede(idx)}>Eliminar</button>
                </div>
              </div>
              
              {/* Materiales asignados */}
              <div className="mb-3">
                <span className="font-semibold text-sm">Materiales asignados:</span>
                {Array.isArray(sede.materialesAsignados) && sede.materialesAsignados.length > 0 ? (
                  <ul className="ml-2 list-disc text-sm mt-1">
                    {sede.materialesAsignados.map((mat, i) => (
                      <li key={i}>{mat.item}: <span className="font-bold">{mat.cantidad}</span></li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-400 italic text-sm">Ninguno</span>
                )}
              </div>

              {/* Servicios asignados */}
              <div className="mb-3">
                <span className="font-semibold text-sm">Servicios asignados:</span>
                {Array.isArray(sede.serviciosAsignados) && sede.serviciosAsignados.length > 0 ? (
                  <ul className="ml-2 list-disc text-sm mt-1">
                    {sede.serviciosAsignados.map((serv, i) => (
                      <li key={i}>{serv.servicio}: <span className="font-bold">{serv.cantidad}</span></li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-400 italic text-sm">Ninguno</span>
                )}
              </div>

              {/* Presupuesto por sede */}
              {sede.presupuesto && (
                <div className="border-t pt-3 mt-3">
                  <div className="font-semibold text-sm mb-2 text-gray-700">Presupuesto de esta sede:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Materiales:</span>
                      <span className="font-semibold">{sede.presupuesto.materiales.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Servicios:</span>
                      <span className="font-semibold">{sede.presupuesto.servicios.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between col-span-2 border-t pt-1 font-bold text-gray-900">
                      <span>Total sede:</span>
                      <span>{sede.presupuesto.total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resumen total de sedes */}
        {projectData.sedes.some(sede => sede.presupuesto) && (
          <div className="border-t-2 border-gray-300 pt-4 mt-4">
            <div className="font-bold text-lg text-gray-800 mb-3">Resumen de Presupuesto por Sedes</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Total Materiales:</span>
                <span className="font-semibold">
                  {projectData.sedes.reduce((sum, sede) => sum + (sede.presupuesto?.materiales || 0), 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Servicios:</span>
                <span className="font-semibold">
                  {projectData.sedes.reduce((sum, sede) => sum + (sede.presupuesto?.servicios || 0), 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between col-span-2 border-t pt-2 font-bold text-lg text-gray-900">
                <span>Total Sedes:</span>
                <span>{projectData.sedes.reduce((sum, sede) => sum + (sede.presupuesto?.total || 0), 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        )}
      </FormSection>
    );
  };

  // --- MODAL PARA AGREGAR/EDITAR SEDE ---
  const renderSedeModal = () => {
    if (!sedeModalOpen) return null;
    // Materiales disponibles para asignar
    const materialesDisponibles = projectData.materiales;
    // Servicios disponibles para asignar
    const serviciosDisponibles = projectData.servicios;
    
    // Nueva función: cantidad asignada al proyecto para cada material
    const getCantidadAsignadaProyecto = (itemName) => {
      return (projectData.materiales.find(m => m.item === itemName)?.cantidad) || 0;
    };
    // Nueva función: cantidad ya asignada a otras sedes (excepto la actual edición)
    const getCantidadAsignadaOtrasSedes = (itemName) => {
      let usado = 0;
      projectData.sedes.forEach((sede, idx) => {
        if (editingSede !== null && idx === editingSede) return;
        const mat = sede.materialesAsignados.find(m => m.item === itemName);
        if (mat) usado += Number(mat.cantidad);
      });
      return usado;
    };

    // Funciones para servicios
    const getCantidadServicioAsignadaProyecto = (servicioName) => {
      return (projectData.servicios.find(s => s.servicio === servicioName)?.cantidad) || 0;
    };
    const getCantidadServicioAsignadaOtrasSedes = (servicioName) => {
      let usado = 0;
      projectData.sedes.forEach((sede, idx) => {
        if (editingSede !== null && idx === editingSede) return;
        const serv = sede.serviciosAsignados?.find(s => s.servicio === servicioName);
        if (serv) usado += Number(serv.cantidad);
      });
      return usado;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={closeSedeModal}><FaTimes /></button>
          <h3 className="text-xl font-bold mb-4">{editingSede !== null ? 'Editar Sede' : 'Agregar Sede'}</h3>
          <div className="space-y-6">
            <div>
              <FormLabel htmlFor="nombre">Nombre de la Sede</FormLabel>
              <input id="nombre" name="nombre" type="text" value={sedeForm.nombre} onChange={handleSedeFormChange} className={inputBaseStyle} required />
            </div>
            <div>
              <FormLabel htmlFor="ubicacion">Ubicación</FormLabel>
              <input id="ubicacion" name="ubicacion" type="text" value={sedeForm.ubicacion} onChange={handleSedeFormChange} className={inputBaseStyle} />
            </div>
            
            {/* Sección de Materiales */}
            <div>
              <FormLabel>Materiales a asignar</FormLabel>
              {materialesDisponibles.length === 0 && <div className="text-gray-400 italic">Primero agrega materiales al proyecto.</div>}
              <div className="space-y-2">
                {materialesDisponibles.map((mat, idx) => {
                  const asignadoIdx = sedeForm.materialesAsignados.findIndex(m => m.item === mat.item);
                  const cantidadAsignada = asignadoIdx !== -1 ? sedeForm.materialesAsignados[asignadoIdx].cantidad : 0;
                  // Cantidad máxima para esta sede: lo asignado al proyecto menos lo ya asignado a otras sedes
                  const cantidadProyecto = Number(getCantidadAsignadaProyecto(mat.item));
                  const cantidadOtrasSedes = Number(getCantidadAsignadaOtrasSedes(mat.item));
                  // Si estamos editando, sumamos lo que ya tenía esta sede
                  const cantidadEstaSede = editingSede !== null ? Number(projectData.sedes[editingSede].materialesAsignados.find(m => m.item === mat.item)?.cantidad || 0) : 0;
                  const maxDisponible = cantidadProyecto - cantidadOtrasSedes + cantidadEstaSede;
                  // Color de advertencia para stock
                  let stockColor = 'text-green-600';
                  if (maxDisponible === 0) stockColor = 'text-red-600 font-bold';
                  else if (maxDisponible > 0 && maxDisponible < 10) stockColor = 'text-yellow-500 font-semibold';
                  return (
                    <div key={mat.item} className="flex items-center gap-2">
                      <span className={`w-32 font-medium ${stockColor}`}>{mat.item} <span className="text-xs">(Asignado al proyecto: {cantidadProyecto})</span></span>
                      <input
                        type="number"
                        min="0"
                        max={maxDisponible}
                        value={cantidadAsignada}
                        onChange={e => {
                          const val = Math.max(0, Math.min(Number(e.target.value), maxDisponible));
                          if (asignadoIdx !== -1) {
                            handleMaterialAsignadoChange(asignadoIdx, val);
                          } else {
                            setSedeForm(prev => ({
                              ...prev,
                              materialesAsignados: [...prev.materialesAsignados, { item: mat.item, cantidad: val }]
                            }));
                          }
                        }}
                        className="w-24 border rounded p-1 text-sm"
                        disabled={maxDisponible === 0}
                      />
                      <span className={`text-xs ${stockColor}`}>/ {maxDisponible} disponibles</span>
                      {asignadoIdx !== -1 && (
                        <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => handleRemoveMaterialFromSede(asignadoIdx)}><FaTrash /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sección de Servicios */}
            <div>
              <FormLabel>Servicios a asignar</FormLabel>
              {serviciosDisponibles.length === 0 && <div className="text-gray-400 italic">Primero agrega servicios al proyecto.</div>}
              <div className="space-y-2">
                {serviciosDisponibles.map((serv, idx) => {
                  const asignadoIdx = sedeForm.serviciosAsignados.findIndex(s => s.servicio === serv.servicio);
                  const cantidadAsignada = asignadoIdx !== -1 ? sedeForm.serviciosAsignados[asignadoIdx].cantidad : 0;
                  // Cantidad máxima para esta sede: lo asignado al proyecto menos lo ya asignado a otras sedes
                  const cantidadProyecto = Number(getCantidadServicioAsignadaProyecto(serv.servicio));
                  const cantidadOtrasSedes = Number(getCantidadServicioAsignadaOtrasSedes(serv.servicio));
                  // Si estamos editando, sumamos lo que ya tenía esta sede
                  const cantidadEstaSede = editingSede !== null ? Number(projectData.sedes[editingSede].serviciosAsignados?.find(s => s.servicio === serv.servicio)?.cantidad || 0) : 0;
                  const maxDisponible = cantidadProyecto - cantidadOtrasSedes + cantidadEstaSede;
                  // Color de advertencia para disponibilidad
                  let stockColor = 'text-green-600';
                  if (maxDisponible === 0) stockColor = 'text-red-600 font-bold';
                  else if (maxDisponible > 0 && maxDisponible < 5) stockColor = 'text-yellow-500 font-semibold';
                  return (
                    <div key={serv.servicio} className="flex items-center gap-2">
                      <span className={`w-32 font-medium ${stockColor}`}>{serv.servicio} <span className="text-xs">(Asignado al proyecto: {cantidadProyecto})</span></span>
                      <input
                        type="number"
                        min="0"
                        max={maxDisponible}
                        value={cantidadAsignada}
                        onChange={e => {
                          const val = Math.max(0, Math.min(Number(e.target.value), maxDisponible));
                          if (asignadoIdx !== -1) {
                            handleServicioAsignadoChange(asignadoIdx, val);
                          } else {
                            setSedeForm(prev => ({
                              ...prev,
                              serviciosAsignados: [...prev.serviciosAsignados, { servicio: serv.servicio, cantidad: val, precio: serv.precio }]
                            }));
                          }
                        }}
                        className="w-24 border rounded p-1 text-sm"
                        disabled={maxDisponible === 0}
                      />
                      <span className={`text-xs ${stockColor}`}>/ {maxDisponible} disponibles</span>
                      {asignadoIdx !== -1 && (
                        <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => handleRemoveServicioFromSede(asignadoIdx)}><FaTrash /></button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-bold hover:bg-gray-300" onClick={closeSedeModal}>Cancelar</button>
              <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700" onClick={handleSedeSubmit}>{editingSede !== null ? 'Guardar Cambios' : 'Agregar Sede'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cambia el overlay para que solo cierre el modal principal si NO está abierto el modal de sede
  const handleOverlayClick = (e) => {
    if (!sedeModalOpen) {
      onClose(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-center items-start z-50 p-4 pt-12" onClick={handleOverlayClick}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Proyecto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
          <FormSection title="Información Principal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="relative">
                  <FormLabel htmlFor="nombre">Nombre del Proyecto <span aria-label="Ayuda" tabIndex="0" role="tooltip" className="ml-1 text-blue-500 cursor-pointer" title="El nombre debe ser único y descriptivo.">ⓘ</span></FormLabel>
                  <input id="nombre" type="text" name="nombre" value={projectData.nombre} onChange={handleChange} className={`${inputBaseStyle} ${errors.nombre ? 'border-red-500 ring-2 ring-red-300' : ''}`} required aria-invalid={!!errors.nombre} aria-describedby="error-nombre" />
                  {errors.nombre && <span id="error-nombre" className="text-red-500 text-xs flex items-center gap-1 mt-1"><span role="img" aria-label="error">❌</span> {errors.nombre}</span>}
                </div>
                <div><FormLabel htmlFor="numeroContrato">Número de Contrato</FormLabel><input id="numeroContrato" type="text" name="numeroContrato" value={projectData.numeroContrato} onChange={handleChange} className={inputBaseStyle} /></div>
                <div><FormLabel htmlFor="cliente">Cliente</FormLabel>
                  <select id="cliente" name="cliente" value={projectData.cliente} onChange={handleChange} className={inputBaseStyle} required>
                    <option value="" disabled>Selecciona un cliente...</option>
                    {mockClientes.map(c => (
                      <option key={c.id} value={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                  <span className="text-red-500 text-xs">{errors.cliente}</span>
                </div>
                <div><FormLabel htmlFor="responsable">Responsable</FormLabel>
                  <select id="responsable" name="responsable" value={projectData.responsable} onChange={handleChange} className={inputBaseStyle} required>
                    <option value="" disabled>Selecciona un responsable...</option>
                    {mockUsuarios.filter(u => u.rol === 'Admin').map(u => (
                      <option key={u.id} value={`${u.nombre} ${u.apellido}`}>{u.nombre} {u.apellido}</option>
                    ))}
                  </select>
                  <span className="text-red-500 text-xs">{errors.responsable}</span>
                </div>
                <div><FormLabel htmlFor="fechaInicio">Fecha de Inicio</FormLabel><input id="fechaInicio" type="date" name="fechaInicio" value={projectData.fechaInicio} onChange={handleChange} className={inputBaseStyle} required /><span className="text-red-500 text-xs">{errors.fechaInicio}</span></div>
                <div><FormLabel htmlFor="fechaFin">Fecha de Fin</FormLabel><input id="fechaFin" type="date" name="fechaFin" value={projectData.fechaFin} onChange={handleChange} className={inputBaseStyle} required /><span className="text-red-500 text-xs">{errors.fechaFin}</span></div>
                <div><FormLabel htmlFor="estado">Estado Inicial</FormLabel><select id="estado" name="estado" value={projectData.estado} onChange={handleChange} className={inputBaseStyle}><option>Pendiente</option><option>En Progreso</option><option>Completado</option></select></div>
                <div><FormLabel htmlFor="prioridad">Prioridad</FormLabel><select id="prioridad" name="prioridad" value={projectData.prioridad} onChange={handleChange} className={inputBaseStyle}><option>Baja</option><option>Media</option><option>Alta</option></select></div>
            </div>
          </FormSection>

          <FormSection title="Detalles del Proyecto">
            <div><FormLabel htmlFor="ubicacion">Ubicación</FormLabel><input id="ubicacion" type="text" name="ubicacion" value={projectData.ubicacion} onChange={handleChange} className={inputBaseStyle} /></div>
            <div><FormLabel htmlFor="descripcion">Descripción del Proyecto</FormLabel><textarea id="descripcion" name="descripcion" value={projectData.descripcion} onChange={handleChange} rows="3" className={inputBaseStyle}></textarea></div>
          </FormSection>

          <FormSection title="Equipo del Proyecto">
            <div>
              <FormLabel htmlFor="empleadosAsociados">Empleados Asociados</FormLabel>
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={empleadoSearch}
                onChange={e => setEmpleadoSearch(e.target.value)}
                className={inputBaseStyle}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {projectData.empleadosAsociados.map(emp => (
                  <span key={emp} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2">
                    {emp}
                    <button type="button" onClick={() => setProjectData(prev => ({ ...prev, empleadosAsociados: prev.empleadosAsociados.filter(e => e !== emp) }))} className="text-blue-500 hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
              <div className="mt-2 max-h-32 overflow-y-auto border rounded bg-white shadow">
                {mockUsuarios
                  .filter(u => u.status === 'Activo')
                  .filter(u => `${u.nombre} ${u.apellido}`.toLowerCase().includes(empleadoSearch.toLowerCase()))
                  .filter(u => !projectData.empleadosAsociados.includes(`${u.nombre} ${u.apellido}`))
                  .map(u => (
                    <div key={u.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => setProjectData(prev => ({ ...prev, empleadosAsociados: [...prev.empleadosAsociados, `${u.nombre} ${u.apellido}`] }))}>
                      {u.nombre} {u.apellido} ({u.rol})
                    </div>
                  ))}
              </div>
              {errors.empleadosAsociados && <span className="text-xs text-red-500">{errors.empleadosAsociados}</span>}
            </div>
          </FormSection>
          
          {renderListInputs('materiales', 'Materiales y Equipos')}
          {renderListInputs('servicios', 'Servicios Incluidos')}
          
          <FormSection title="Costos Adicionales">
            <div><FormLabel htmlFor="manoDeObra">Costo de Mano de Obra (COP)</FormLabel><input id="manoDeObra" type="number" name="manoDeObra" value={projectData.costos.manoDeObra} onChange={handleChange} className={inputBaseStyle} placeholder="Ej: 1500000" min="0" /><span className="text-red-500 text-xs">{errors.manoDeObra}</span></div>
          </FormSection>

          <FormSection title="Observaciones">
            <div><FormLabel htmlFor="observaciones">Notas Adicionales</FormLabel><textarea id="observaciones" name="observaciones" rows="3" value={projectData.observaciones} onChange={handleChange} className={inputBaseStyle} placeholder="Comentarios del cliente, etc." /></div>
          </FormSection>

          {renderSedesSection()}
          {renderSedeModal()}

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Proyecto</button>
            {Object.keys(errors).length > 0 && <div className="text-red-500 text-sm mt-2">Corrige los errores antes de guardar.</div>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;