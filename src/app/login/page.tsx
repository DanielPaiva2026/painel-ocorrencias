"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Lock, Mail, Loader2, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ocorencia-alpiserra-api-ocorrencia.lmfl6n.easypanel.host';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha: senha.trim() })
      });

      if (!response.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await response.json();
      
      // Save token and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('auth_role', data.user.role);
      localStorage.setItem('auth_precisa_trocar_senha', data.user.precisa_trocar_senha ? 'true' : 'false');
      
      // Save token in cookie via server action or simple document.cookie for simplicity now
      document.cookie = `token=${data.access_token}; path=/; max-age=43200; samesite=lax`;
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-brand-cyan/20 blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-teal/10 blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-teal to-brand-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-teal/30">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">AlpiSerra</h1>
          <p className="text-slate-500 mt-2 text-sm">Painel Operacional e Ocorrências</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal hover:bg-brand-cyan text-white py-3.5 rounded-xl font-medium shadow-lg shadow-brand-teal/20 transition-colors flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
