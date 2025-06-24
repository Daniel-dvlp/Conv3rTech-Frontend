// src/features/auth/pages/LoginPage.jsx

import Lottie from 'lottie-react';
import LoginForm from '../components/LoginForm';

// 1. IMPORTAMOS el archivo JSON directamente.
//    'loginAnimation' ahora es un objeto de JavaScript, no un texto.
import loginAnimation from '../../../assets/animations/login-animation.json';

const LoginPage = () => {
  return (
    // Contenedor principal con imagen de fondo
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/original-6d1d7918f01c5b010dcaed95499f7b6c.jpeg')" }}
    >
      {/* Tarjeta de Login con efecto de desenfoque */}
      <div className="w-full max-w-4xl bg-gray-900 bg-opacity-40 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden md:flex">
        
        {/* Columna Izquierda: Animación Lottie */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8 bg-black bg-opacity-25">
          {/* 2. USAMOS la variable importada aquí */}
          <Lottie animationData={loginAnimation} loop={true} />
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Bienvenido a Conv3rTech</h2>
            <p className="text-gray-300">Inicia sesión para continuar</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;