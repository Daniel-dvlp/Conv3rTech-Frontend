import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const ProjectCard = ({ project }) => {
  const { id, name, client, progress, estimatedCompletion, priority } = project;

  const [showTooltip, setShowTooltip] = useState(false);

  const priorityColors = {
    'Alta': 'bg-red-50 text-red-700 border border-red-200',
    'Media': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Baja': 'bg-green-50 text-green-700 border border-green-200',
  };

  const completionDate = new Date(estimatedCompletion);
  const currentDate = new Date();

  completionDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const diffTime = completionDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let isProgressLow = false;
  let warningMessage = '';

  if (diffDays > 0) {
    if (diffDays <= 30 && progress < 50) {
      isProgressLow = true;
      warningMessage = `¡Atención! Bajo progreso (${progress}%) para la fecha de finalización. Faltan ${diffDays} días.`;
    } else if (diffDays <= 60 && progress < 30) {
      isProgressLow = true;
      warningMessage = `¡Advertencia! Bajo progreso (${progress}%) para la fecha. Faltan ${diffDays} días.`;
    } else if (diffDays <= 90 && progress < 20) {
      isProgressLow = true;
      warningMessage = `¡Recordatorio! Progreso lento (${progress}%) para la fecha. Faltan ${diffDays} días.`;
    }
  } else if (diffDays <= 0 && progress < 100) {
      isProgressLow = true;
      warningMessage = `¡Proyecto atrasado! La fecha de finalización era ${new Date(estimatedCompletion).toLocaleDateString('es-CO')} y el progreso es ${progress}%.`;
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 px-6 py-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-6">
        {/* Sección Izquierda: ID, Nombre, Cliente */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 flex-shrink-0 bg-gray-100 px-3 py-1.5 rounded-lg">{id}</p>
          <div className="flex-grow min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate mb-1">{name}</p>
            <p className="text-sm text-gray-600 truncate">Cliente: {client}</p>
          </div>
        </div>
        
        {/* Sección Central: Barra de Progreso y Porcentaje */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 via-conv3r-gold to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm font-bold text-conv3r-gold whitespace-nowrap">{progress}%</p> 
        </div>

        {/* Sección Derecha: Fecha de Finalización, Prioridad, Icono de Advertencia */}
        <div className="text-right flex flex-col items-end gap-2 min-w-max">
          <div className="flex items-center justify-end gap-2">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Fecha estimada finalización:</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(estimatedCompletion).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </p>
            </div>
            {isProgressLow && (
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FaExclamationCircle className="text-red-500 text-xl cursor-pointer hover:text-red-600 transition-colors" />
                {showTooltip && (
                  <div className="absolute top-full right-0 mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-10 w-64 text-left">
                    {warningMessage}
                    <div className="absolute top-[-6px] right-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[priority]}`}>
            {priority}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

