// src/features/auth/components/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. USUARIO DE PRUEBA
const MOCK_USER = {
  email: 'admin@conv3rtech.com',
  password: 'password123',
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Limpia errores previos

    // 2. VALIDACIONES EN JAVASCRIPT
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      // 3. INGRESO EXITOSO
      alert('¡Inicio de sesión exitoso!');
      navigate('/dashboard'); // Redirige al dashboard
    } else {
      setError('Correo o contraseña incorrectos.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-200">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full bg-white/10 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-200"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full bg-white/10 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
      >
        Ingresar
      </button>
    </form>
  );
};

export default LoginForm;