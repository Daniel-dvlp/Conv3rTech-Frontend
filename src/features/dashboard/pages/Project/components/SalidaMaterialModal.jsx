// src/features/dashboard/pages/Project/components/SalidaMaterialModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaTruck, FaUser, FaMapMarkerAlt, FaClipboardList, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import { usePermissions } from '../../../../../shared/hooks/usePermissions';
import { showToast } from '../../../../../shared/utils/alertas';
import { mockProjects } from '../data/projects.data';

const SalidaMaterialModal = ({ 
  isOpen, 
  onClose, 
  onSaveSalida 
}) => {
  const { checkManage } = usePermissions();
  const [formData, setFormData] = useState({
    proyecto: '',
    sede: '',
    material: '',
    cantidad: '',
    entregador: '',
    receptor: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null);
  const [materialesDisponibles, setMaterialesDisponibles] = useState([]);
  const [cantidadDisponible, setCantidadDisponible] = useState(0);
  const [costoUnitario, setCostoUnitario] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);

  // Obtener proyectos disponibles
  const proyectosDisponibles = mockProjects.filter(p => 
    Array.isArray(p.sedes) && p.sedes.length > 0
  );

  // Obtener sedes del proyecto seleccionado
  const sedesDisponibles = selectedProject?.sedes || [];

  // Obtener empleados del proyecto seleccionado
  const empleados = selectedProject?.empleadosAsociados || [];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        proyecto: '',
        sede: '',
        material: '',
        cantidad: '',
        entregador: '',
        receptor: '',
        observaciones: ''
      });
      setErrors({});
      setSelectedProject(null);
      setSelectedSede(null);
      setMaterialesDisponibles([]);
      setCantidadDisponible(0);
      setCostoUnitario(0);
      setCostoTotal(0);
    }
  }, [isOpen]);

  // Actualizar materiales disponibles cuando se selecciona una sede
  useEffect(() => {
    if (selectedSede && selectedProject) {
      const materiales = selectedSede.materialesAsignados || [];
      setMaterialesDisponibles(materiales);
    } else {
      setMaterialesDisponibles([]);
    }
  }, [selectedSede, selectedProject]);

  // Calcular cantidad disponible y costo cuando se selecciona un material
  useEffect(() => {
    if (formData.material && selectedSede && selectedProject) {
      const materialAsignado = selectedSede.materialesAsignados?.find(
        mat => mat.item === formData.material
      );
      
      if (materialAsignado) {
        // Calcular cantidad disponible (asignada - salidas previas)
        const salidasPrevias = selectedSede.salidasMaterial?.filter(
          salida => salida.material === formData.material
        ) || [];
        const cantidadEntregada = salidasPrevias.reduce((sum, salida) => sum + salida.cantidad, 0);
        const disponible = materialAsignado.cantidad - cantidadEntregada;
        setCantidadDisponible(disponible);

        // Obtener costo unitario del material
        const materialProyecto = selectedProject.materiales?.find(
          mat => mat.item === formData.material
        );
        const costo = materialProyecto?.precio || 0;
        setCostoUnitario(costo);
      } else {
        setCantidadDisponible(0);
        setCostoUnitario(0);
      }
    } else {
      setCantidadDisponible(0);
      setCostoUnitario(0);
    }
  }, [formData.material, selectedSede, selectedProject]);

  // Calcular costo total cuando cambia la cantidad
  useEffect(() => {
    const cantidad = Number(formData.cantidad) || 0;
    setCostoTotal(cantidad * costoUnitario);
  }, [formData.cantidad, costoUnitario]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Actualizar selecciones relacionadas
    if (field === 'proyecto') {
      const proyecto = proyectosDisponibles.find(p => p.nombre === value);
      setSelectedProject(proyecto);
      setFormData(prev => ({ ...prev, sede: '', material: '' }));
      setSelectedSede(null);
    } else if (field === 'sede') {
      const sede = sedesDisponibles.find(s => s.nombre === value);
      setSelectedSede(sede);
      setFormData(prev => ({ ...prev, material: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.proyecto.trim()) {
      newErrors.proyecto = 'Debe seleccionar un proyecto';
    }

    if (!formData.sede.trim()) {
      newErrors.sede = 'Debe seleccionar una sede';
    }

    if (!formData.material.trim()) {
      newErrors.material = 'Debe seleccionar un material';
    }

    if (!formData.cantidad || Number(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    } else if (Number(formData.cantidad) > cantidadDisponible) {
      newErrors.cantidad = `No puede retirar más de ${cantidadDisponible} unidades`;
    }

    if (!formData.entregador.trim()) {
      newErrors.entregador = 'Debe especificar el entregador';
    }

    if (!formData.receptor.trim()) {
      newErrors.receptor = 'Debe especificar el receptor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showToast('Por favor, corrige los errores del formulario.', 'error');
      return;
    }

    // Crear objeto de salida
    const nuevaSalida = {
      id: `salida-${Date.now()}`,
      proyecto: formData.proyecto,
      sede: formData.sede,
      material: formData.material,
      cantidad: Number(formData.cantidad),
      costoUnitario: costoUnitario,
      costoTotal: costoTotal,
      entregador: formData.entregador,
      receptor: formData.receptor,
      observaciones: formData.observaciones,
      fecha: new Date().toISOString(),
      usuarioRegistro: 'Usuario Actual' // En un entorno real, obtener del contexto de autenticación
    };

    // Llamar función de guardado
    onSaveSalida(nuevaSalida);
    
    // Cerrar modal
    onClose();
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);

  // Verificar permisos
  if (!checkManage('salida_material')) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <FaTruck className="text-green-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">
              Registrar Salida de Material
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl p-2 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </header>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Selección de Proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClipboardList className="inline mr-2 text-blue-500" />
                Proyecto *
              </label>
              <select
                value={formData.proyecto}
                onChange={(e) => handleChange('proyecto', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.proyecto ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un proyecto...</option>
                {proyectosDisponibles.map(proyecto => (
                  <option key={proyecto.id} value={proyecto.nombre}>
                    {proyecto.nombre} - {proyecto.cliente}
                  </option>
                ))}
              </select>
              {errors.proyecto && <p className="text-red-500 text-sm mt-1">{errors.proyecto}</p>}
            </div>

            {/* Selección de Sede */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                Sede *
              </label>
              <select
                value={formData.sede}
                onChange={(e) => handleChange('sede', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.sede ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.proyecto}
              >
                <option value="">Selecciona una sede...</option>
                {sedesDisponibles.map((sede, index) => (
                  <option key={index} value={sede.nombre}>
                    {sede.nombre} - {sede.ubicacion}
                  </option>
                ))}
              </select>
              {errors.sede && <p className="text-red-500 text-sm mt-1">{errors.sede}</p>}
            </div>

            {/* Selección de Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaTruck className="inline mr-2 text-blue-500" />
                Material *
              </label>
              <select
                value={formData.material}
                onChange={(e) => handleChange('material', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.material ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.sede}
              >
                <option value="">Selecciona un material...</option>
                {materialesDisponibles.map((mat, index) => (
                  <option key={index} value={mat.item}>
                    {mat.item} (Disponible: {mat.cantidad})
                  </option>
                ))}
              </select>
              {errors.material && <p className="text-red-500 text-sm mt-1">{errors.material}</p>}
            </div>

            {/* Cantidad y Costo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad a Retirar *
                </label>
                <input
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => handleChange('cantidad', e.target.value)}
                  min="1"
                  max={cantidadDisponible}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.cantidad ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!formData.material}
                />
                {errors.cantidad && <p className="text-red-500 text-sm mt-1">{errors.cantidad}</p>}
                {formData.material && (
                  <p className="text-sm text-gray-600 mt-1">
                    Disponible: {cantidadDisponible} unidades
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline mr-2 text-green-500" />
                  Costo Total
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(costoTotal)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {costoUnitario > 0 && `${formatCurrency(costoUnitario)} × ${formData.cantidad || 0}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Presupuesto */}
            {selectedSede?.presupuesto && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaExclamationTriangle className="text-blue-500" />
                  <span className="font-semibold text-blue-900">Impacto en Presupuesto</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Presupuesto Actual:</span>
                    <div className="font-bold text-blue-900">
                      {formatCurrency(selectedSede.presupuesto.restante || selectedSede.presupuesto.total)}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-700">Después del Retiro:</span>
                    <div className="font-bold text-blue-900">
                      {formatCurrency((selectedSede.presupuesto.restante || selectedSede.presupuesto.total) - costoTotal)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Entrega */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-blue-500" />
                  Entregador *
                </label>
                <select
                  value={formData.entregador}
                  onChange={(e) => handleChange('entregador', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.entregador ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona el entregador...</option>
                  {empleados.map((empleado, index) => (
                    <option key={index} value={empleado.nombre || empleado}>
                      {empleado.nombre || empleado}
                    </option>
                  ))}
                </select>
                {errors.entregador && <p className="text-red-500 text-sm mt-1">{errors.entregador}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-blue-500" />
                  Receptor *
                </label>
                <input
                  type="text"
                  value={formData.receptor}
                  onChange={(e) => handleChange('receptor', e.target.value)}
                  placeholder="Nombre del receptor"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.receptor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.receptor && <p className="text-red-500 text-sm mt-1">{errors.receptor}</p>}
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                rows="3"
                placeholder="Observaciones adicionales sobre la salida..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaSave />
            Registrar Salida
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SalidaMaterialModal;
