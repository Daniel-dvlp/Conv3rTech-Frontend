// src/features/auth/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import Lottie from 'lottie-react';
import loginAnimation from '../../../assets/animations/login-animation.json';

// --- Componentes Internos para Reutilización y Limpieza ---

// Componente para el Logo, para no repetirlo
const Logo = ({ className = '' }) => (
  <div className={`w-20 h-20 bg-conv3r-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${className}`}>
    <span className="text-conv3r-dark text-3xl font-bold">C3</span>
  </div>
);

// Componente para un campo de formulario estandarizado
const InputField = ({ id, type, value, onChange, placeholder, icon }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
      {id}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-conv3r-gold focus:border-transparent transition-all"
        placeholder={placeholder}
        required
      />
    </div>
  </div>
);

// --- Componente Principal de la Página de Login ---

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const MOCK_USER = { email: 'admin@conv3rtech.com', password: 'password123' };

  // Lógica y Estado (simplificado)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      return setError('Por favor, completa todos los campos.');
    }
    if (formData.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }
    if (formData.email === MOCK_USER.email && formData.password === MOCK_USER.password) {
      alert('¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      
      {/* === Panel Izquierdo - Oscuro con la Curva === */}
      <div className="hidden lg:flex lg:w-1/2 bg-conv3r-dark items-center justify-center relative p-12">
        <div className="relative z-10 text-center max-w-md">
          <Logo />
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Bienvenido de nuevo a Conv3rTech
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Gestiona tus proyectos, clientes y operaciones en un solo lugar.
          </p>
          <div className="w-full max-w-sm mx-auto">
            <Lottie animationData={loginAnimation} loop={true} />
          </div>
        </div>

        {/* Curva divisoria SVG - Mejorada para ser más fluida */}
        <div className="absolute top-0 right-0 h-full w-1/4 text-white">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0 C60,30 60,70 0,100 L100,100 L100,0 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* === Panel Derecho - Claro con el Formulario === */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <Logo />
          </div>

          <div className="text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h2>
            <p className="text-gray-500 mt-1">Accede a tu cuenta para continuar</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <InputField
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
            />
            <InputField
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={<FaLock className="h-5 w-5 text-gray-400" />}
            />

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember-me" className="flex items-center cursor-pointer">
                <input id="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-conv3r-gold focus:ring-conv3r-gold border-gray-300 rounded" />
                <span className="ml-2 text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="font-medium text-conv3r-gold hover:text-conv3r-gold/80">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-conv3r-gold text-conv3r-dark font-bold py-3 px-4 rounded-lg shadow-lg hover:brightness-95 transform hover:scale-105 transition-all duration-300"
            >
              Iniciar Sesión
            </button>
            
            <p className="text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="font-medium text-conv3r-gold hover:underline">
                Regístrate
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;