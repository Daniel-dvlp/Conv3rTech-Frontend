import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaLock,
  FaSave,
  FaCamera,
  FaEnvelope,
  FaPhone,
  FaUserEdit,
  FaShieldAlt,
  FaIdCard,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import authService from "../../../../services/authService";
import { showToast } from "../../../../shared/utils/alertas";
import { useAuth } from "../../../../shared/contexts/AuthContext";

const ProfileCard = ({ title, icon, children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-md border border-gray-100 ${className}`}
  >
    <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="text-yellow-600 text-sm">{icon}</div>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    </header>
    <div className="p-4">{children}</div>
  </div>
);

const FormRow = ({ label, id, children, error, className = "" }) => (
  <div className={`space-y-1 ${className}`}>
    <label
      htmlFor={id}
      className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
    >
      {label}
    </label>
    {children}
    {error && (
      <span className="text-xs text-red-500 flex items-center gap-1">
        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
        {error}
      </span>
    )}
  </div>
);

const EditProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    documento: "",
    tipoDocumento: "CC",
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (!user) {
      // Si no hay usuario, redirige al login
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        if (res.success && res.data) {
          const userData = res.data;
          setCurrentUser(userData);
          setForm({
            nombre: userData.nombre || userData.name || "",
            apellido: userData.apellido || userData.lastName || "",
            email: userData.correo || userData.email || "",
            celular: userData.celular || userData.phone || "",
            documento: userData.documento || "",
            tipoDocumento: userData.tipoDocumento || "CC",
          });
        } else {
          // Fallback: usar datos del contexto
          setCurrentUser(user);
          setForm({
            nombre: user.name || user.nombre || "",
            apellido: user.lastName || user.apellido || "",
            email: user.correo || user.email || "",
            celular: user.celular || "",
            documento: user.documento || "",
            tipoDocumento: user.tipoDocumento || "CC",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fallback: usar datos del contexto
        setCurrentUser(user);
        setForm({
          nombre: user.name || user.nombre || "",
          apellido: user.lastName || user.apellido || "",
          email: user.correo || user.email || "",
          celular: user.celular || "",
          documento: user.documento || "",
          tipoDocumento: user.tipoDocumento || "CC",
        });
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (successMsg) setSuccessMsg("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (passwordMsg) setPasswordMsg("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateInfoForm = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "Campo requerido";
    if (!form.apellido.trim()) errors.apellido = "Campo requerido";
    if (!form.email.trim()) errors.email = "Campo requerido";
    if (!form.celular.trim()) errors.celular = "Campo requerido";
    if (!form.documento.trim()) errors.documento = "Campo requerido";

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email inválido";
    }

    setFormErrors(errors);
    return errors;
  };

  const validatePasswordForm = () => {
    const errors = {};
    if (!passwords.current) errors.current = "Campo requerido";
    if (!passwords.new) errors.new = "Campo requerido";
    if (!passwords.confirm) errors.confirm = "Campo requerido";

    if (passwords.new && passwords.new.length < 6) {
      errors.new = "Mínimo 6 caracteres";
    }

    if (
      passwords.new &&
      passwords.confirm &&
      passwords.new !== passwords.confirm
    ) {
      errors.confirm = "Las contraseñas no coinciden";
    }

    setPasswordErrors(errors);
    return errors;
  };

  const handleInfoSubmit = async () => {
    const errors = validateInfoForm();
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      // Mapear 'email' a 'correo' para el backend
      const payload = {
        ...form,
        correo: form.email,
      };
      const result = await authService.updateProfile(payload);

      if (result.success) {
        const updatedUser = { ...user, ...form, correo: form.email };
        updateUser(updatedUser);
        setCurrentUser(updatedUser);
        setSuccessMsg("¡Información actualizada exitosamente!");
        showToast("Perfil actualizado correctamente", "success");
      } else {
        setFormErrors({
          general: result.message || "Error al actualizar el perfil",
        });
        showToast(result.message || "Error al actualizar el perfil", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormErrors({
        general: "Error de conexión. Por favor, inténtalo de nuevo.",
      });
      showToast("Error de conexión. Por favor, inténtalo de nuevo.", "error");
    }

    setIsLoading(false);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) return;

    setIsPasswordLoading(true);

    try {
      const result = await authService.changePassword(
        passwords.current,
        passwords.new
      );

      if (result.success) {
        setPasswordMsg("¡Contraseña actualizada exitosamente!");
        setPasswords({ current: "", new: "", confirm: "" });
        showToast("Contraseña actualizada correctamente", "success");
      } else {
        setPasswordErrors({
          general: result.message || "Error al cambiar la contraseña",
        });
        showToast(result.message || "Error al cambiar la contraseña", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordErrors({
        general: "Error de conexión. Por favor, inténtalo de nuevo.",
      });
      showToast("Error de conexión. Por favor, inténtalo de nuevo.", "error");
    }

    setIsPasswordLoading(false);
    setTimeout(() => setPasswordMsg(""), 4000);
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm font-medium">
            Cargando perfil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Mi Perfil</h1>
          <p className="text-sm text-gray-600">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 min-h-0">
          {/* Avatar e info básica */}
          <div className="flex flex-col h-full min-h-0">
            {/* Avatar */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center justify-center flex-1 min-h-[320px]">
              <div className="relative inline-block mb-3">
                <img
                  className="h-24 w-24 rounded-full ring-4 ring-yellow-600 ring-offset-2 shadow-lg"
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                    currentUser.name || currentUser.nombre
                  }${
                    currentUser.lastName || currentUser.apellido
                  }&backgroundColor=ffd700&textColor=1a1a1a`}
                  alt="Avatar"
                />
                <button className="absolute bottom-0 right-0 bg-yellow-600 text-white p-1.5 rounded-full shadow-lg hover:bg-yellow-700 transition-all duration-200 hover:scale-110">
                  <FaCamera className="w-3 h-3" />
                </button>
              </div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {currentUser.name || currentUser.nombre}{" "}
                {currentUser.lastName || currentUser.apellido}
              </h2>
              <p className="text-yellow-600 font-bold text-xs mb-1">
                {currentUser.role || currentUser.rol}
              </p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  currentUser.status === "Activo"
                    ? "bg-green-100 text-green-700"
                    : currentUser.status === "Inactivo"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {currentUser.status}
              </span>
            </div>

            {/* Info de contacto */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6 flex-1">
              <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <FaShieldAlt className="text-yellow-600" />
                Información de Contacto
              </h3>
              <div className="text-xs space-y-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-gray-400 w-3 h-3 flex-shrink-0" />
                  <span className="text-gray-700 truncate">
                    {currentUser.correo || currentUser.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FaPhone className="text-gray-400 w-3 h-3 flex-shrink-0" />
                  <span className="text-gray-700">{currentUser.celular}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-gray-400 w-3 h-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    {currentUser.tipoDocumento} {currentUser.documento}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Información Personal */}
          <div className="flex flex-col h-full min-h-0">
            <ProfileCard
              title="Información Personal"
              icon={<FaUserEdit />}
              className="h-full rounded-2xl shadow-xl p-8"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormRow label="Nombre" id="nombre" error={formErrors.nombre}>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                      placeholder="Tu nombre"
                    />
                  </FormRow>

                  <FormRow
                    label="Apellido"
                    id="apellido"
                    error={formErrors.apellido}
                  >
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                      placeholder="Tu apellido"
                    />
                  </FormRow>
                </div>

                <FormRow
                  label="Correo Electrónico"
                  id="email"
                  error={formErrors.email}
                >
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Correo electrónico{" "}
                      <span
                        aria-label="Ayuda"
                        tabIndex="0"
                        role="tooltip"
                        className="ml-1 text-blue-500 cursor-pointer"
                        title="Debe ser un correo válido y único."
                      >
                        ⓘ
                      </span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleInfoChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm ${
                        formErrors.email
                          ? "border-red-500 ring-2 ring-red-300"
                          : ""
                      }`}
                      placeholder="tu@email.com"
                      aria-invalid={!!formErrors.email}
                      aria-describedby="error-email"
                    />
                    {formErrors.email && (
                      <span
                        id="error-email"
                        className="text-red-500 text-xs flex items-center gap-1 mt-1"
                      >
                        <span role="img" aria-label="error">
                          ❌
                        </span>{" "}
                        {formErrors.email}
                      </span>
                    )}
                  </div>
                </FormRow>

                <FormRow
                  label="Celular"
                  id="celular"
                  error={formErrors.celular}
                >
                  <input
                    type="tel"
                    id="celular"
                    name="celular"
                    value={form.celular}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                    placeholder="300 123 4567"
                  />
                </FormRow>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormRow label="Tipo Documento" id="tipoDocumento">
                    <select
                      id="tipoDocumento"
                      name="tipoDocumento"
                      value={form.tipoDocumento}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                  </FormRow>

                  <FormRow
                    label="Número Documento"
                    id="documento"
                    error={formErrors.documento}
                  >
                    <input
                      type="text"
                      id="documento"
                      name="documento"
                      value={form.documento}
                      onChange={handleInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                      placeholder="1234567890"
                    />
                  </FormRow>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 gap-3">
                  {successMsg && (
                    <div className="text-green-600 text-sm font-medium flex items-center gap-2">
                      <FaCheckCircle className="w-4 h-4" />
                      {successMsg}
                    </div>
                  )}
                  <button
                    onClick={handleInfoSubmit}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaSave className="w-4 h-4" />
                    )}
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </ProfileCard>
          </div>

          {/* Columna 3: Cambiar Contraseña */}
          <div className="flex flex-col h-full min-h-0">
            <ProfileCard
              title="Cambiar Contraseña"
              icon={<FaLock />}
              className="h-full rounded-2xl shadow-xl p-8"
            >
              <div className="space-y-6">
                <FormRow
                  label="Contraseña Actual"
                  id="current"
                  error={passwordErrors.current}
                >
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="current"
                      name="current"
                      value={passwords.current}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormRow>

                <FormRow
                  label="Nueva Contraseña"
                  id="new"
                  error={passwordErrors.new}
                >
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="new"
                      name="new"
                      value={passwords.new}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormRow>

                <FormRow
                  label="Confirmar Nueva Contraseña"
                  id="confirm"
                  error={passwordErrors.confirm}
                >
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirm"
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 transition-all duration-200 text-sm"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <FaEyeSlash className="w-4 h-4" />
                      ) : (
                        <FaEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </FormRow>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  <p className="font-medium mb-1">Requisitos de contraseña:</p>
                  <ul className="space-y-1">
                    <li>• Mínimo 6 caracteres</li>
                    <li>• Se recomienda incluir números y símbolos</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 gap-3">
                  {passwordMsg && (
                    <div className="text-green-600 text-sm font-medium flex items-center gap-2">
                      <FaCheckCircle className="w-4 h-4" />
                      {passwordMsg}
                    </div>
                  )}
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={isPasswordLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:shadow-lg"
                  >
                    {isPasswordLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaLock className="w-4 h-4" />
                    )}
                    {isPasswordLoading
                      ? "Actualizando..."
                      : "Actualizar Contraseña"}
                  </button>
                </div>
              </div>
            </ProfileCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
