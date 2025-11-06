import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../../../shared/utils/alertas";

const RecoverCodePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const qEmail = searchParams.get("email") || "";
    setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !code || !/^\d{6}$/.test(code)) {
      showToast("Verifica correo y un código de 6 dígitos", "error");
      return;
    }
    navigate(`/recuperar/restablecer?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Verificar código</h2>
        <p className="text-gray-600 mb-6">Ingresa el código que recibiste en tu correo para continuar.</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Código (6 dígitos)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400"
              placeholder="123456"
              inputMode="numeric"
              pattern="^\d{6}$"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800 font-bold py-3 rounded-xl"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecoverCodePage;