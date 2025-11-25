import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/alertas";

const LogoutButton = ({ className = "", showText = true }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const { showAlert } = await import("../utils/alertas");
      const result = await showAlert({
        title: "Cerrar sesión",
        text: "¿Estás seguro de que deseas cerrar sesión?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#e74c3c",
      });
      
      if (result.isConfirmed) {
        await logout();
        showToast("Sesión cerrada correctamente", "success");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showToast("Error al cerrar sesión", "error");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 ${className}`}
      title="Cerrar sesión"
    >
      <FaSignOutAlt className="w-4 h-4" />
      {showText && <span className="text-sm font-medium">Cerrar Sesión</span>}
    </button>
  );
};

export default LogoutButton;
