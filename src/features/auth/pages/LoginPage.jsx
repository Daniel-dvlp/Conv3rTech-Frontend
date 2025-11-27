import { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../shared/utils/alertas";
import { useAuth } from "../../../shared/contexts/AuthContext";
import authService from "../../../services/authService";

// --- Componentes Internos ---

const Logo = ({ className = "" }) => (
  <div className={`relative w-24 h-24 mx-auto mb-8 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl rotate-3 blur-sm opacity-75 animate-pulse"></div>
    <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-all duration-300">
      <span className="text-gray-800 text-4xl font-black tracking-wider">
        C3
      </span>
    </div>
  </div>
);
 
const InputField = ({
  id,
  type,
  value,
  onChange,
  placeholder,
  icon,
  showPassword,
  togglePassword,
}) => (
  <div className="group">
    <label
      htmlFor={id}
      className="block text-sm font-semibold text-gray-700 mb-2 capitalize tracking-wide"
    >
      {id === "email" ? "Correo Electrónico" : "Contraseña"}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <div className="text-gray-400 group-focus-within:text-yellow-500 transition-colors duration-300">
          {icon}
        </div>
      </div>
      <input
        id={id}
        name={id}
        type={type === "password" && showPassword ? "text" : type}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white focus:shadow-lg focus:shadow-yellow-400/20 transition-all duration-300 hover:border-gray-300"
        placeholder={placeholder}
        required
      />
      {type === "password" && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-300"
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5" />
          ) : (
            <FaEye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  </div>
);

const FloatingParticle = ({ delay, size, left, top }) => (
  <div
    className="absolute rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-20 animate-bounce"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      left: `${left}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
      animationDuration: "3s",
    }}
  />
);

// --- Componente Principal ---

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryStage, setRecoveryStage] = useState("request"); // 'request' | 'reset'
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Validaciones en tiempo real (alineadas con el backend)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validEmail = isValidEmail(recoveryEmail);
  const isValidCode = (code) => /^\d{6}$/.test(code);
  const passwordRules = {
    length: /^.{6,15}$/.test(newPassword),
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const isValidPassword = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    setMounted(true);
    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError("Por favor, completa todos los campos.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        showToast(`Bienvenido, ${result.data.user.nombre}!`, "success");
        navigate("/dashboard");
      } else {
        setError(result.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error de conexión. Por favor, inténtalo de nuevo.");
    }

    setIsLoading(false);
  };

  const handleOpenRecovery = () => {
    setRecoveryEmail(formData.email || "");
    setRecoveryStage("request");
    setRecoveryCode("");
    setNewPassword("");
    setShowRecovery(true);
  };

  const handleRequestRecovery = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      showToast("Ingresa tu correo para continuar", "error");
      return;
    }
    if (!isValidEmail(recoveryEmail)) {
      showToast("Correo inválido. Verifica el formato", "error");
      return;
    }
    try {
      setIsRecoveryLoading(true);
      const res = await authService.requestPasswordRecovery(recoveryEmail);
      if (res.success) {
        showToast("Código enviado. Revisa tu correo.", "success");
        // Mantener el modal abierto y pasar a la etapa de restablecer
        setRecoveryStage("reset");
        setShowRecovery(true);
      } else {
        showToast(res.message || "No se pudo enviar el código", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryCode || !newPassword) {
      showToast("Completa todos los campos", "error");
      return;
    }
    // Evitar intentos inválidos antes de llamar al backend
    if (!isValidCode(recoveryCode)) {
      showToast("El código debe ser numérico de 6 dígitos", "error");
      return;
    }
    if (!isValidPassword) {
      showToast(
        "La contraseña debe tener 6-15 caracteres, mayúscula, minúscula, número y símbolo",
        "error"
      );
      return;
    }
    try {
      setIsResetLoading(true);
      const res = await authService.resetPasswordWithCode(
        recoveryEmail,
        recoveryCode,
        newPassword
      );
      if (res.success) {
        showToast("Contraseña restablecida. Ahora inicia sesión.", "success");
        setFormData((prev) => ({ ...prev, email: recoveryEmail }));
        setShowRecovery(false);
        setRecoveryStage("request");
        setRecoveryCode("");
        setNewPassword("");
        // Redirigir explícitamente al login tras éxito
        navigate("/login");
      } else {
        showToast(res.message || "No se pudo restablecer", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen w-full flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 relative overflow-hidden">
      {/* Partículas flotantes de fondo */}
      {mounted && (
        <>
          <FloatingParticle delay={0} size={20} left={10} top={20} />
          <FloatingParticle delay={1} size={15} left={85} top={15} />
          <FloatingParticle delay={2} size={25} left={15} top={80} />
          <FloatingParticle delay={1.5} size={18} left={90} top={70} />
          <FloatingParticle delay={0.5} size={12} left={5} top={50} />
          <FloatingParticle delay={2.5} size={22} left={95} top={40} />
        </>
      )}

      {/* === Panel Izquierdo - Mejorado === */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center relative p-12 overflow-hidden">
        {/* Efectos de fondo animados */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-500/15 to-yellow-400/15 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <Logo />
          <div className="space-y-6">
            <h1 className="text-5xl font-black text-white mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bienvenido de nuevo
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-300 text-xl leading-relaxed font-light">
              Gestiona tus proyectos, clientes y operaciones en un solo lugar
              con la potencia de
              <span className="font-bold text-yellow-400"> Conv3rTech</span>
            </p>
          </div>

          {/* Elementos decorativos adicionales */}
          <div className="mt-12 grid grid-cols-3 gap-4 opacity-60">
            <div className="h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl backdrop-blur-sm"></div>
            <div
              className="h-16 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-xl backdrop-blur-sm"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl backdrop-blur-sm"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* === Panel Derecho - Formulario Mejorado === */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Fondo con glassmorphism */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <Logo />
          </div>

          {/* Tarjeta del formulario */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-gray-800 mb-2">
                Iniciar Sesión
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">
                Accede a tu cuenta para continuar
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <InputField
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                icon={<FaEnvelope className="h-5 w-5" />}
              />

              <InputField
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={<FaLock className="h-5 w-5" />}
                showPassword={showPassword}
                togglePassword={() => setShowPassword(!showPassword)}
              />

              <div className="flex items-center justify-between">
                <label
                  htmlFor="remember-me"
                  className="flex items-center cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                  </div>
                </label>
                <button
                  type="button"
                  onClick={handleOpenRecovery}
                  className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors duration-300 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full relative overflow-hidden bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold py-4 px-6 rounded-2xl shadow-xl transform transition-all duration-300 ${
                  isLoading
                    ? "scale-95 opacity-80 cursor-not-allowed"
                    : "hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/25 active:scale-95"
                }`}
              >
                <span
                  className={`flex items-center justify-center ${
                    isLoading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Iniciar Sesión
                </span>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    {showRecovery && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" role="dialog" aria-modal="true">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {recoveryStage === "request"
                ? "Recuperar contraseña"
                : "Restablecer contraseña"}
            </h3>
            <button
              type="button"
              onClick={() => setShowRecovery(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {recoveryStage === "request" ? (
            <form onSubmit={handleRequestRecovery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400"
                  placeholder="tu@email.com"
                  required
                />
                {recoveryEmail && !validEmail && (
                  <p className="text-xs text-red-600 mt-1">
                    Ingresa un correo válido (ej. usuario@dominio.com)
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!validEmail || isRecoveryLoading}
                className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${
                  !validEmail || isRecoveryLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isRecoveryLoading && (
                  <span className="inline-block w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                )}
                {isRecoveryLoading ? "Enviando..." : "Enviar código"}
              </button>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    // Cambiar al paso de restablecer dentro del modal
                    if (!recoveryEmail) {
                      showToast("Ingresa tu correo primero", "error");
                      return;
                    }
                    if (!validEmail) {
                      showToast("Ingresa un correo válido", "error");
                      return;
                    }
                    setRecoveryStage("reset");
                    setShowRecovery(true);
                  }}
                  className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 hover:underline"
                >
                  Ya tengo el código
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de verificación (6 dígitos)
                </label>
                <input
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setRecoveryCode(digitsOnly);
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400"
                  placeholder="123456"
                  inputMode="numeric"
                  required
                />
                {recoveryCode && !isValidCode(recoveryCode) && (
                  <p className="text-xs text-red-600 mt-1">
                    Debe ser un código numérico de 6 dígitos.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400"
                  placeholder="••••••••"
                  required
                />
                <div className="text-xs mt-2 space-y-1">
                  <div className={passwordRules.length ? "text-green-600" : "text-red-600"}>
                    {passwordRules.length ? <FaCheck className="inline mr-1" /> : <FaTimes className="inline mr-1" />} 6–15 caracteres
                  </div>
                  <div className={passwordRules.upper ? "text-green-600" : "text-red-600"}>
                    {passwordRules.upper ? <FaCheck className="inline mr-1" /> : <FaTimes className="inline mr-1" />} Al menos una mayúscula (A–Z)
                  </div>
                  <div className={passwordRules.lower ? "text-green-600" : "text-red-600"}>
                    {passwordRules.lower ? <FaCheck className="inline mr-1" /> : <FaTimes className="inline mr-1" />} Al menos una minúscula (a–z)
                  </div>
                  <div className={passwordRules.number ? "text-green-600" : "text-red-600"}>
                    {passwordRules.number ? <FaCheck className="inline mr-1" /> : <FaTimes className="inline mr-1" />} Al menos un número (0–9)
                  </div>
                  <div className={passwordRules.special ? "text-green-600" : "text-red-600"}>
                    {passwordRules.special ? <FaCheck className="inline mr-1" /> : <FaTimes className="inline mr-1" />} Al menos un símbolo (p. ej. !@#$%)
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={!isValidCode(recoveryCode) || !isValidPassword || isResetLoading}
                className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${
                  !isValidCode(recoveryCode) || !isValidPassword || isResetLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isResetLoading && (
                  <span className="inline-block w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                )}
                {isResetLoading ? "Guardando..." : "Restablecer contraseña"}
              </button>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecovery(false);
                    navigate("/login");
                  }}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-800 hover:underline"
                >
                  Volver al login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default LoginPage;
