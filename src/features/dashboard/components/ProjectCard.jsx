import React, { useState } from 'react';
import { FaExclamationCircle, FaCopy, FaCheck } from 'react-icons/fa';

const ProjectCard = ({ project }) => {
  const { id, name, progress, estimatedCompletion, priority } = project;
  const [copied, setCopied] = useState(false);


  const priorityColors = {
    'Alta': 'bg-red-100 text-red-700',
    'Media': 'bg-orange-100 text-orange-700',
    'Baja': 'bg-yellow-100 text-yellow-700',
  };

  const completionDateRaw = estimatedCompletion ? new Date(estimatedCompletion) : null;
  const isValidCompletion = completionDateRaw && !isNaN(completionDateRaw.getTime());
  const completionDate = isValidCompletion ? completionDateRaw : null;
  const currentDate = new Date();

  if (completionDate) {
    completionDate.setHours(0, 0, 0, 0);
  }
  currentDate.setHours(0, 0, 0, 0);

  const diffTime = completionDate ? completionDate.getTime() - currentDate.getTime() : 0;
  const diffDays = completionDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

  let isProgressLow = false;
  let warningMessage = '';

  if (diffDays > 0) {
    if (diffDays <= 30 && progress < 50) {
      isProgressLow = true;
      warningMessage = `¡Atención! Bajo progreso para la fecha de finalización. Faltan ${diffDays} días.`;
    } else if (diffDays <= 60 && progress < 30) {
      isProgressLow = true;
      warningMessage = `¡Advertencia! Bajo progreso para la fecha. Faltan ${diffDays} días.`;
    } else if (diffDays <= 90 && progress < 20) {
      isProgressLow = true;
      warningMessage = `¡Recordatorio! Progreso lento para la fecha. Faltan ${diffDays} días.`;
    }
  } else if (completionDate && diffDays <= 0 && progress < 100) {
      isProgressLow = true;
      warningMessage = `¡Proyecto atrasado! La fecha de finalización era ${completionDate.toLocaleDateString('es-CO')}.`;
  }

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate" title={name}>{name}</p>
          <div className="flex items-center gap-1">
            <p className="text-xs leading-none text-gray-500 whitespace-nowrap">{id}</p>
            <button
              type="button"
              aria-label="Copiar ID"
              className="h-5 w-5 p-0 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-[0.98] flex items-center justify-center -translate-y-[8px] shadow-sm"
              onClick={() => {
                navigator.clipboard.writeText(id).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              {copied ? <FaCheck size={10} className="text-green-600" /> : <FaCopy size={10} />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <div className="w-[220px] sm:w-[280px] md:w-[620px] bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs font-semibold text-gray-800 whitespace-nowrap leading-none translate-y-[8px]">{progress}%</p>
          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${priorityColors[priority]}`}>{priority}</span>
        </div>
      </div>
      {isProgressLow && (
        <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
          <FaExclamationCircle className="text-red-500" />
          <span>{warningMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
