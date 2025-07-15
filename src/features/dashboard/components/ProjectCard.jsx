import React, { useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

const ProjectCard = ({ project }) => {
  const { id, name, client, progress, estimatedCompletion, priority } = project;

  const [showTooltip, setShowTooltip] = useState(false);

  const priorityColors = {
    'Alta': 'bg-red-100 text-red-800',
    'Media': 'bg-yellow-100 text-yellow-800',
    'Baja': 'bg-green-100 text-green-800',
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
    // Reducimos el padding vertical y eliminamos border-b para un diseño más de tarjeta
    <div className="flex items-center justify-between px-4 py-1 bg-white rounded-lg shadow-sm border border-gray-200 mb-3"> {/* Añadido mb-3 para espacio entre tarjetas */}
      
      {/* Sección Izquierda: ID, Nombre, Cliente */}
      <div className="flex gap-4 items-center min-w-0"> {/* Usamos min-w-0 para evitar desbordamiento en textos largos */}
        <p className="text-sm font-semibold text-gray-800 flex-shrink-0">{id}</p> {/* flex-shrink-0 para que el ID no se encoja */}
        <div className="flex-grow items-center"> {/* flex-grow para que ocupe el espacio restante */}
          <p className="text-sm text-gray-700 font-medium truncate mb-0">{name}</p> {/* truncate para cortar textos largos */}
          <p className="text-xs text-gray-500 truncate">Cliente: {client}</p> {/* truncate también aquí */}
        </div>
      </div>
      
      {/* Sección Central: Barra de Progreso y Porcentaje */}
      {/* Ajustamos el ancho para que sea más compacto, y los márgenes */}
      <div className="flex w-1/4 mx-4 justify-center items-center">
        <div className="w-full bg-gray-200 rounded-full h-2"> {/* h-2 para hacer la barra más fina */}
          <div
            className="bg-blue-600 h-2 rounded-full" // h-2 para que coincida con el contenedor
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        {/* Eliminamos mt-3 del párrafo de porcentaje para reducir espacio */}
        <p className="text-xs text-gray-500 ml-2">{progress}%</p> 
      </div>

      {/* Sección Derecha: Fecha de Finalización, Prioridad, Icono de Advertencia */}
      <div className="text-right flex flex-col items-end min-w-max"> {/* min-w-max para evitar que se encoja */}
        <div className="flex items-center justify-end relative">
          <div>
            {/* Reducimos el tamaño de la fuente para la etiqueta "Fecha estimada..." */}
            <p className="text-xs text-gray-600 mb-0">Fecha estimada finalización:</p>
            <p className="text-sm font-medium text-gray-800">
              {new Date(estimatedCompletion).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </p>
          </div>
          {isProgressLow && (
            <div
              className="relative ml-2"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <FaExclamationCircle className="text-red-500 text-xl cursor-pointer" />
              {showTooltip && (
                <div className="absolute top-full right-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-48 text-left">
                  {warningMessage}
                  {/* Flecha del tooltip */}
                  <div className="absolute top-[-5px] right-2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-800"></div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Reducimos el margen superior y el padding en el span de prioridad */}
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${priorityColors[priority]}`}>
          {priority}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;