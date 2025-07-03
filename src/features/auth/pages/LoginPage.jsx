import { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import loginAnimation from '../../../assets/animations/login-animation.json';

// --- Componentes Internos ---

const Logo = ({ className = '' }) => (
  <div className={`relative w-24 h-24 mx-auto mb-8 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-2xl rotate-3 blur-sm opacity-75 animate-pulse"></div>
    <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-all duration-300">
      <span className="text-gray-800 text-4xl font-black tracking-wider">C3</span>
    </div>
  </div>
);

const InputField = ({ id, type, value, onChange, placeholder, icon, showPassword, togglePassword }) => (
  <div className="group">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2 capitalize tracking-wide">
      {id === 'email' ? 'Correo Electrónico' : 'Contraseña'}
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
        type={type === 'password' && showPassword ? 'text' : type}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white focus:shadow-lg focus:shadow-yellow-400/20 transition-all duration-300 hover:border-gray-300"
        placeholder={placeholder}
        required
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-300"
        >
          {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
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
      animationDuration: '3s'
    }}
  />
);

// --- Componente Principal ---

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const MOCK_USER = { email: 'admin@conv3rtech.com', password: 'password123' };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setIsLoading(false);
      return;
    }
    if (formData.email === MOCK_USER.email && formData.password === MOCK_USER.password) {
      // --- CORRECCIÓN AQUÍ ---
      // Navegamos a la RUTA '/dashboard', no al nombre del archivo del componente.
      navigate('/dashboard');
    } else {
      setError('Correo o contraseña incorrectos.');
    }
    setIsLoading(false);
  };

  return (
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
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-500/15 to-yellow-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <Logo />
          <div className="space-y-6">
            <h1 className="text-5xl font-black text-white mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bienvenido de nuevo
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6"></div>
            <p className="text-gray-300 text-xl leading-relaxed font-light">
              Gestiona tus proyectos, clientes y operaciones en un solo lugar con la potencia de 
              <span className="font-bold text-yellow-400"> Conv3rTech</span>
            </p>
          </div>

          {/* Elementos decorativos adicionales */}
          <div className="mt-12 grid grid-cols-3 gap-4 opacity-60">
            <div className="h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl backdrop-blur-sm"></div>
            <div className="h-16 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-xl backdrop-blur-sm" style={{ animationDelay: '0.5s' }}></div>
            <div className="h-16 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl backdrop-blur-sm" style={{ animationDelay: '1s' }}></div>
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
              <h2 className="text-4xl font-black text-gray-800 mb-2">Iniciar Sesión</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Accede a tu cuenta para continuar</p>
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
                <label htmlFor="remember-me" className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input 
                      id="remember-me" 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${rememberMe ? 'bg-yellow-400 border-yellow-400' : 'border-gray-300 group-hover:border-yellow-400'}`}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-gray-800 absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">Recordarme</span>
                </label>
                
                <button type="button" className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors duration-300 hover:underline">
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
                    ? 'scale-95 opacity-80 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/25 active:scale-95'
                }`}
              >
                <span className={`flex items-center justify-center ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                  Iniciar Sesión
                </span>
                
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
              
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <button type="button" className="font-bold text-yellow-600 hover:text-yellow-700 transition-colors duration-300 hover:underline">
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;