import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { showToast } from '../../../../../shared/utils/alertas';
import { mockUsuarios } from '../../users/data/User_data';
import { mockClientes } from '../../clients/data/Clientes_data';

const FormSection = ({ title, children }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6">
    <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const FormLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const inputBaseStyle = "block w-full text-sm border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-conv3r-gold focus:border-conv3r-gold";

const EditProjectModal = ({ isOpen, onClose, onUpdate, project }) => {
  const initialState = project || {
    nombre: '', numeroContrato: '', cliente: '', responsable: '',
    fechaInicio: '', fechaFin: '', estado: 'Pendiente', prioridad: 'Media',
    descripcion: '', ubicacion: '', observaciones: '',
    empleadosAsociados: [], materiales: [], servicios: [], costos: { manoDeObra: '' },
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

  useEffect(() => {
    if (project && isOpen) {
      // Si el proyecto no tiene sedes definidas pero tiene un cliente, precargar las sedes
      if (project.cliente && (!project.sedes || project.sedes.length === 0)) {
        const sedesPrecargadas = getSedesFromCliente(project.cliente);
        
        setProjectData({
          ...project,
          sedes: sedesPrecargadas
        });
      } else {
        setProjectData(project);
      }
    }
  }, [project, isOpen]);

  const clientesList = mockClientes.map(c => c.nombre);
  const mockResponsables = ['Daniela V.', 'Carlos R.', 'Ana G.', 'Sofía M.'];
  const mockEmpleados = [...mockResponsables, 'Luis P.'];

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

  if (!isOpen) return null;

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
  };
  const handleListChange = (index, event, listName) => {
    const { name, value } = event.target;
    const updatedList = [...(projectData[listName] || [])];
    updatedList[index][name] = value;
    setProjectData((prev) => ({ ...prev, [listName]: updatedList }));
  };
  const addListItem = (listName) => {
    const newItem = listName === 'materiales'
      ? { item: '', cantidad: 1, precio: '' }
      : { servicio: '', cantidad: 1, precio: '' };
    setProjectData((prev) => ({ ...prev, [listName]: [...(prev[listName] || []), newItem] }));
  };
  const removeListItem = (index, listName) => {
    const updatedList = [...(projectData[listName] || [])];
    updatedList.splice(index, 1);
    setProjectData((prev) => ({ ...prev, [listName]: updatedList }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!projectData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!projectData.cliente) newErrors.cliente = 'Selecciona un cliente';
    if (!projectData.responsable) newErrors.responsable = 'Selecciona un responsable';
    if (!projectData.fechaInicio) newErrors.fechaInicio = 'Selecciona la fecha de inicio';
    if (!projectData.fechaFin) newErrors.fechaFin = 'Selecciona la fecha de fin';
    if (!Array.isArray(projectData.empleadosAsociados) || projectData.empleadosAsociados.length === 0) newErrors.empleadosAsociados = 'Selecciona al menos un empleado';
    if (!Array.isArray(projectData.materiales) || projectData.materiales.length === 0) newErrors.materiales = 'Agrega al menos un material';
    if (!Array.isArray(projectData.servicios) || projectData.servicios.length === 0) newErrors.servicios = 'Agrega al menos un servicio';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showToast('Por favor, corrige los errores del formulario.', 'error');
      return;
    }
    try {
      onUpdate({ ...projectData });
      showToast('Proyecto actualizado exitosamente', 'success');
    } catch {
      showToast('Error al actualizar el proyecto', 'error');
    }
  };

  const renderListInputs = (listName, label) => {
    const items = Array.isArray(projectData[listName]) ? projectData[listName] : [];
    const singularLabel = listName === 'materiales' ? 'Material' : 'Servicio';

    return (
      <FormSection title={label}>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr,auto,auto,auto] gap-3 px-1 text-xs font-bold text-gray-500">
              <span>Nombre del {singularLabel.toLowerCase()}</span>
              <span className="w-20 text-center">Cantidad</span>
              <span className="w-28 text-center">Precio</span>
              <span className="w-10 text-center"></span>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr,auto,auto,auto] gap-3 items-center">
              <input type="text" name={listName === 'materiales' ? 'item' : 'servicio'} value={item[listName === 'materiales' ? 'item' : 'servicio']} onChange={(e) => handleListChange(index, e, listName)} className={inputBaseStyle} required />
              <input type="number" name="cantidad" value={item.cantidad} onChange={(e) => handleListChange(index, e, listName)} className={`${inputBaseStyle} w-20 text-center`} required min="1" />
              <input type="number" name="precio" value={item.precio} onChange={(e) => handleListChange(index, e, listName)} className={`${inputBaseStyle} w-28`} required min="0" placeholder="COP"/>
              <button type="button" onClick={() => removeListItem(index, listName)} className="p-2 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addListItem(listName)} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors">
          <FaPlus size={12} /> Agregar {singularLabel}
        </button>
      </FormSection>
    );
  };

  // --- LÓGICA PARA SEDES Y ASIGNACIÓN DE MATERIALES ---
  const openSedeModal = (sedeIdx = null) => {
    if (sedeIdx !== null && Array.isArray(projectData.sedes) && projectData.sedes[sedeIdx]) {
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
  const handleMaterialAsignadoChange = (idx, value) => {
    setSedeForm(prev => {
      const materialesAsignados = [...(prev.materialesAsignados || [])];
      materialesAsignados[idx].cantidad = value;
      return { ...prev, materialesAsignados };
    });
  };

  const handleRemoveMaterialFromSede = (idx) => {
    setSedeForm(prev => {
      const materialesAsignados = [...(prev.materialesAsignados || [])];
      materialesAsignados.splice(idx, 1);
      return { ...prev, materialesAsignados };
    });
  };

  // Funciones para manejar servicios en sedes
  const handleServicioAsignadoChange = (idx, value) => {
    setSedeForm(prev => {
      const serviciosAsignados = [...(prev.serviciosAsignados || [])];
      let val = Number(value);
      const serv = serviciosAsignados[idx];
      // Calcular cantidad disponible para este servicio
      const cantidadDisponible = getServicioDisponible(serv.servicio);
      const maxDisponible = cantidadDisponible + (editingSede !== null ? Number(projectData.sedes[editingSede].serviciosAsignados?.find(s => s.servicio === serv.servicio)?.cantidad || 0) : 0);
      if (val > maxDisponible) val = maxDisponible;
      serviciosAsignados[idx].cantidad = val;
      return { ...prev, serviciosAsignados };
    });
  };



  const handleRemoveServicioFromSede = (idx) => {
    setSedeForm(prev => {
      const serviciosAsignados = [...(prev.serviciosAsignados || [])];
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
      const mat = sede.materialesAsignados?.find(m => m.item === itemName);
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
  // --- UI PARA SEDES ---
  const renderSedesSection = () => (
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
                    <span className="font-semibold">{(sede.presupuesto.materiales || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servicios:</span>
                    <span className="font-semibold">{(sede.presupuesto.servicios || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between col-span-2 border-t pt-1 font-bold text-gray-900">
                    <span>Total sede:</span>
                    <span>{(sede.presupuesto.total || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
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
      const mat = sede.materialesAsignados?.find(m => m.item === itemName);
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
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
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
                {materialesDisponibles.map((mat) => {
                  const asignadoIdx = (sedeForm.materialesAsignados || []).findIndex(m => m.item === mat.item);
                  const cantidadAsignada = asignadoIdx !== -1 ? sedeForm.materialesAsignados[asignadoIdx].cantidad : 0;
                  // Cantidad máxima para esta sede: lo asignado al proyecto menos lo ya asignado a otras sedes
                  const cantidadProyecto = Number(getCantidadAsignadaProyecto(mat.item));
                  const cantidadOtrasSedes = Number(getCantidadAsignadaOtrasSedes(mat.item));
                  // Si estamos editando, sumamos lo que ya tenía esta sede
                  const cantidadEstaSede = editingSede !== null ? Number(projectData.sedes[editingSede].materialesAsignados?.find(m => m.item === mat.item)?.cantidad || 0) : 0;
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
                {serviciosDisponibles.map((serv) => {
                  const asignadoIdx = (sedeForm.serviciosAsignados || []).findIndex(s => s.servicio === serv.servicio);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Editar Proyecto</h2>
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
                <div><FormLabel htmlFor="cliente">Cliente</FormLabel><select id="cliente" name="cliente" value={projectData.cliente} onChange={handleChange} className={inputBaseStyle} required><option value="" disabled>Selecciona un cliente...</option>{clientesList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><FormLabel htmlFor="responsable">Responsable</FormLabel>
  <select id="responsable" name="responsable" value={projectData.responsable} onChange={handleChange} className={inputBaseStyle} required>
    <option value="" disabled>Selecciona un responsable...</option>
    {mockUsuarios.filter(u => u.rol === 'Admin').map(u => (
      <option key={u.id} value={`${u.nombre} ${u.apellido}`}>{u.nombre} {u.apellido}</option>
    ))}
  </select>
  <span className="text-red-500 text-xs">{errors.responsable}</span>
</div>
                <div><FormLabel htmlFor="fechaInicio">Fecha de Inicio</FormLabel><input id="fechaInicio" type="date" name="fechaInicio" value={projectData.fechaInicio} onChange={handleChange} className={inputBaseStyle} required /></div>
                <div><FormLabel htmlFor="fechaFin">Fecha de Fin</FormLabel><input id="fechaFin" type="date" name="fechaFin" value={projectData.fechaFin} onChange={handleChange} className={inputBaseStyle} required /></div>
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
                {mockEmpleados.filter(emp => emp.toLowerCase().includes(empleadoSearch.toLowerCase()) && !projectData.empleadosAsociados.includes(emp)).map(emp => (
                  <div key={emp} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => setProjectData(prev => ({ ...prev, empleadosAsociados: [...prev.empleadosAsociados, emp] }))}>
                    {emp}
                  </div>
                ))}
              </div>
              {errors.empleadosAsociados && <span className="text-xs text-red-500">{errors.empleadosAsociados}</span>}
            </div>
          </FormSection>
          
          {renderListInputs('materiales', 'Materiales y Equipos')}
          {renderListInputs('servicios', 'Servicios Incluidos')}
          
          <FormSection title="Costos Adicionales">
             <div><FormLabel htmlFor="manoDeObra">Costo de Mano de Obra (COP)</FormLabel><input id="manoDeObra" type="number" name="manoDeObra" value={projectData.costos.manoDeObra} onChange={handleChange} className={inputBaseStyle} placeholder="Ej: 1500000" min="0" /></div>
          </FormSection>

          <FormSection title="Observaciones">
            <div><FormLabel htmlFor="observaciones">Notas Adicionales</FormLabel><textarea id="observaciones" name="observaciones" rows="3" value={projectData.observaciones} onChange={handleChange} className={inputBaseStyle} placeholder="Comentarios del cliente, etc." /></div>
          </FormSection>

          {renderSedesSection()}
          {renderSedeModal()}

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Cambios</button>
            {Object.keys(errors).length > 0 && <div className="text-red-500 text-sm mt-2">Corrige los errores antes de guardar.</div>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal; 