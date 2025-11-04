import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaDownload } from 'react-icons/fa';
import UsersTable from './components/UsersTable';
import SkeletonRow from './components/SkeletonRow';
import CreateUserModal from './components/CreateUserModal';
import { mockRoles } from '../roles/data/Roles_data';
import Pagination from '../../../../shared/components/Pagination';
import { showSuccess, confirmDelete } from '../../../../shared/utils/alerts.js';
import { toast } from 'react-hot-toast';
import { useUsers } from './hooks/useUsers';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { rolePermissions, getAccessibleModules } from '../../../../shared/config/rolePermissions';

const ITEMS_PER_PAGE = 5;

const UsuariosPage = () => {
  const {
    usuarios,
    roles,
    loading,
    createUser,
    updateUser,
    deleteUser,
    changeUserStatus,
    searchUsers
  } = useUsers();
  
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEliminarUsuario = async (usuarioId) => {
    const confirmed = await confirmDelete('¿Deseas eliminar este usuario?');

    if (confirmed) {
      try {
        await deleteUser(usuarioId);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  // Los usuarios se cargan automáticamente con el hook useUsers

  const handleCreateUser = async (nuevoUsuario) => {
    try {
      await createUser(nuevoUsuario);
      setCurrentPage(Math.ceil((usuarios.length + 1) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };
  const handleExportUsers = () => {
    try {
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configuración de colores
      const primaryColor = '#3B82F6'; // Azul
      const secondaryColor = '#6B7280'; // Gris
      const accentColor = '#10B981'; // Verde
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(primaryColor);
      doc.text('REPORTE DE USUARIOS', 105, 20, { align: 'center' });
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      const fechaActual = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generado el: ${fechaActual}`, 105, 30, { align: 'center' });
      
      // Información general
      doc.setFontSize(12);
      doc.setTextColor('#000000');
      doc.text(`Total de usuarios: ${usuarios.length}`, 20, 45);
      
      // Contar usuarios por estado
      const estados = ['Activo', 'Inactivo', 'Suspendido', 'En vacaciones', 'Retirado', 'Licencia médica'];
      const conteoEstados = estados.reduce((acc, estado) => {
        acc[estado] = usuarios.filter(u => u.estado_usuario === estado).length;
        return acc;
      }, {});
      
      let yPos = 55;
      doc.text(`Usuarios activos: ${conteoEstados['Activo']}`, 20, yPos);
      yPos += 10;
      if (conteoEstados['Inactivo'] > 0) {
        doc.text(`Usuarios inactivos: ${conteoEstados['Inactivo']}`, 20, yPos);
        yPos += 10;
      }
      if (conteoEstados['Suspendido'] > 0) {
        doc.text(`Usuarios suspendidos: ${conteoEstados['Suspendido']}`, 20, yPos);
        yPos += 10;
      }
      if (conteoEstados['En vacaciones'] > 0) {
        doc.text(`En vacaciones: ${conteoEstados['En vacaciones']}`, 20, yPos);
        yPos += 10;
      }
      if (conteoEstados['Retirado'] > 0) {
        doc.text(`Retirados: ${conteoEstados['Retirado']}`, 20, yPos);
        yPos += 10;
      }
      if (conteoEstados['Licencia médica'] > 0) {
        doc.text(`En licencia médica: ${conteoEstados['Licencia médica']}`, 20, yPos);
        yPos += 10;
      }
      
      const startYPosition = yPos + 10;
      
      // Tabla de usuarios
      const tableData = usuarios.map(usuario => {
        const rol = usuario.rol?.nombre_rol || 'Sin rol';
        const permisos = getAccessibleModules(rol);
        
        return [
          usuario.tipo_documento || 'N/A',
          usuario.documento || 'N/A',
          `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'N/A',
          usuario.correo || 'N/A',
          rol,
          usuario.estado_usuario || 'N/A',
          permisos.length > 0 ? permisos.join(', ') : 'Sin permisos'
        ];
      });
      
      // Configuración de la tabla
      autoTable(doc, {
        startY: startYPosition,
        head: [['Tipo Doc', 'Documento', 'Nombre Completo', 'Correo', 'Rol', 'Estado', 'Permisos']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: '#FFFFFF',
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: '#F9FAFB'
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 50 }
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.setTextColor(secondaryColor);
          doc.text(`Página ${data.pageNumber} de ${pageCount}`, 20, pageHeight - 10);
          doc.text('Conv3rTech - Sistema de Gestión', pageSize.width - 20, pageHeight - 10, { align: 'right' });
        }
      });
      
      // Página de resumen de roles y permisos
      doc.addPage();
      
      // Título de la página de roles
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text('RESUMEN DE ROLES Y PERMISOS', 105, 20, { align: 'center' });
      
      let yPosition = 40;
      
      // Iterar sobre cada rol y sus permisos
      Object.entries(rolePermissions).forEach(([rol, permisos]) => {
        // Contar usuarios con este rol
        const usuariosConRol = usuarios.filter(u => u.rol?.nombre_rol === rol).length;
        
        // Título del rol
        doc.setFontSize(14);
        doc.setTextColor(accentColor);
        doc.text(`${rol} (${usuariosConRol} usuario${usuariosConRol !== 1 ? 's' : ''})`, 20, yPosition);
        yPosition += 10;
        
        // Módulos accesibles
        doc.setFontSize(10);
        doc.setTextColor('#000000');
        doc.text('Módulos accesibles:', 25, yPosition);
        yPosition += 8;
        
        permisos.canAccess.forEach(modulo => {
          doc.setFontSize(9);
          doc.setTextColor(secondaryColor);
          doc.text(`• ${modulo}`, 30, yPosition);
          yPosition += 6;
        });
        
        // Módulos de gestión
        if (permisos.canManage.length > 0) {
          yPosition += 5;
          doc.setFontSize(10);
          doc.setTextColor('#000000');
          doc.text('Módulos de gestión:', 25, yPosition);
          yPosition += 8;
          
          permisos.canManage.forEach(modulo => {
            doc.setFontSize(9);
            doc.setTextColor(accentColor);
            doc.text(`• ${modulo}`, 30, yPosition);
            yPosition += 6;
          });
        }
        
        yPosition += 15;
        
        // Verificar si necesitamos una nueva página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      // Guardar el PDF
      doc.save(`Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el reporte PDF');
    }
  };

  const filteredUsers = useMemo(() =>
    usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.tipo_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.documento?.toString().includes(searchTerm) ||
      u.rol?.nombre_rol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.estado_usuario?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [usuarios, searchTerm]
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div className="p-2 md:p-8 ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 bg-green-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all"
          >
            <FaDownload /> Reporte de Usuarios
          </button>
          <button
            className="flex items-center gap-2 bg-conv3r-gold text-conv3r-dark font-bold py-2 px-4 rounded-lg shadow-md hover:brightness-95 transition-all"
            onClick={() => setOpenModal(true)}
          >
            + Crear Usuario
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tipo de Documento</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Documento</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nombre y Apellido</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Correo</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <UsersTable
            usuarios={usuarios}
            usuariosFiltrados={filteredUsers}
            paginaActual={currentPage}
            itemsPorPagina={ITEMS_PER_PAGE}
            onDelete={handleEliminarUsuario}
            onUpdate={updateUser}
            onChangeStatus={changeUserStatus}
            roles={roles}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </>
      )}

      <CreateUserModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        roles={roles}
        onSubmit={handleCreateUser}
        usuariosExistentes={usuarios.map(u => ({
          documento: u.documento,
          tipoDocumento: u.tipo_documento,
          email: u.correo,
          celular: u.celular,
          contrasena: u.contrasena
        }))}
      />
    </div>
  );
};

export default UsuariosPage;
