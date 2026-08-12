import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Utensils, Lock, Mail, Globe, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('admin@tiffin.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-8 bg-gradient-to-b from-orange-50 to-amber-50/40">
      <div className="w-full max-w-sm mx-auto">
        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLang}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white text-orange-700 font-semibold text-xs border border-orange-200 shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'gu' ? 'English' : 'ગુજરાતી'}</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100/80">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-600/30 mb-3">
              <Utensils className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('appName')}</h2>
            <p className="text-xs text-slate-500 mt-1">{t('loginSub')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('email')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-orange-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50 mt-2"
            >
              <span>{loading ? t('loading') : t('loginBtn')}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">Default Credentials: admin@tiffin.com / Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
