import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../shared/utils/alertas";
import authService from "../../../services/authService";

const RecoverRequestPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast("Ingresa tu correo para continuar", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestPasswordRecovery(email);
      if (res.success) {
        showToast("Código enviado. Revisa tu correo.", "success");
        navigate(`/recuperar/codigo?email=${encodeURIComponent(email)}`);
      } else {
        showToast(res.message || "No se pudo enviar el código", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recuperar contraseña</h2>
        <p className="text-gray-600 mb-6">Ingresa tu correo y te enviaremos un código de verificación.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400"
              placeholder="tu@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold py-3 rounded-xl ${loading ? "opacity-75" : ""}`}
          >
            Enviar código
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecoverRequestPage;