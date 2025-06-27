// src/features/dashboard/pages/project/components/NewProjectModal.jsx

import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

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
  };
  const [projectData, setProjectData] = useState(initialState);

  const mockClientes = ['Constructora XYZ', 'Hospital Central', 'Oficinas BigCorp'];
  const mockResponsables = ['Daniela V.', 'Carlos R.', 'Ana G.', 'Sofía M.'];
  const mockEmpleados = [...mockResponsables, 'Luis P.'];

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'manoDeObra') {
      setProjectData(prev => ({ ...prev, costos: { ...prev.costos, manoDeObra: value }}));
    } else {
      setProjectData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleListChange = (index, event, listName) => {
    const { name, value } = event.target;
    const updatedList = [...projectData[listName]];
    updatedList[index][name] = value;
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
    onSave({ ...projectData, id: `P-${Date.now()}` });
    setProjectData(initialState);
    onClose();
  };
  // -----------------------------------------------------------------

  const renderListInputs = (listName, label) => {
    const items = projectData[listName];
    const singularLabel = listName === 'materiales' ? 'Material' : 'Servicio';

    return (
      <FormSection title={label}>
        <div className="space-y-4">
          {/* Encabezados para la lista */}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 pt-12" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Proyecto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl p-2"><FaTimes /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
          <FormSection title="Información Principal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div><FormLabel htmlFor="nombre">Nombre del Proyecto</FormLabel><input id="nombre" type="text" name="nombre" value={projectData.nombre} onChange={handleChange} className={inputBaseStyle} required /></div>
                <div><FormLabel htmlFor="numeroContrato">Número de Contrato</FormLabel><input id="numeroContrato" type="text" name="numeroContrato" value={projectData.numeroContrato} onChange={handleChange} className={inputBaseStyle} /></div>
                <div><FormLabel htmlFor="cliente">Cliente</FormLabel><select id="cliente" name="cliente" value={projectData.cliente} onChange={handleChange} className={inputBaseStyle} required><option value="" disabled>Selecciona un cliente...</option>{mockClientes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><FormLabel htmlFor="responsable">Responsable</FormLabel><select id="responsable" name="responsable" value={projectData.responsable} onChange={handleChange} className={inputBaseStyle} required><option value="" disabled>Selecciona un responsable...</option>{mockResponsables.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {mockEmpleados.map(emp => (
                <label key={emp} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <input type="checkbox" name="empleadosAsociados" value={emp} onChange={handleEquipoChange} className="h-4 w-4 text-conv3r-gold border-gray-300 rounded focus:ring-conv3r-gold" />
                  <span className="text-sm text-gray-800">{emp}</span>
                </label>
              ))}
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

          <div className="flex justify-end gap-4 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
            <button type="submit" className="bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-transform hover:scale-105">Guardar Proyecto</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;