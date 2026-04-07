import React, { useState } from 'react';
import { auth, loginWithGoogle, loginWithGithub } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { X, LogIn, UserPlus, Mail, Lock, User as UserIcon, Chrome, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'pt' | 'en';
  darkMode: boolean;
}

const translations = {
  pt: {
    login: 'Entrar',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    name: 'Nome',
    googleLogin: 'Entrar com Google',
    githubLogin: 'Entrar com GitHub',
    noAccount: 'Não tem uma conta?',
    hasAccount: 'Já tem uma conta?',
    error: 'Ocorreu um erro. Tente novamente.',
    success: 'Sucesso!',
  },
  en: {
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    googleLogin: 'Login with Google',
    githubLogin: 'Login with GitHub',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    error: 'An error occurred. Try again.',
    success: 'Success!',
  }
};

export default function LoginModal({ isOpen, onClose, language, darkMode }: LoginModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGithub();
      onClose();
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
                   <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md rounded-3xl shadow-2xl border transition-colors duration-500 overflow-hidden ${
              darkMode ? 'bg-deep-purple border-neon-blue/20' : 'bg-white border-gray-200'
            }`}
          >
            <button 
              onClick={onClose}
              className={`absolute top-4 right-4 transition-colors ${
                darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-black uppercase italic tracking-tighter mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {isRegistering ? t.register : t.login}
                </h2>
                <p className={`text-sm uppercase tracking-widest ${
                  darkMode ? 'text-white/60' : 'text-gray-500'
                }`}>SmartSquare</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold uppercase text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase ml-1 ${
                      darkMode ? 'text-white/40' : 'text-gray-500'
                    }`}>{t.name}</label>
                    <div className="relative">
                      <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        darkMode ? 'text-white/40' : 'text-gray-400'
                      }`} size={18} />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-neon-blue outline-none transition-all ${
                          darkMode 
                            ? 'bg-galaxy-purple border-neon-blue/20 text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase ml-1 ${
                    darkMode ? 'text-white/40' : 'text-gray-500'
                  }`}>{t.email}</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? 'text-white/40' : 'text-gray-400'
                    }`} size={18} />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-neon-blue outline-none transition-all ${
                        darkMode 
                          ? 'bg-galaxy-purple border-neon-blue/20 text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase ml-1 ${
                    darkMode ? 'text-white/40' : 'text-gray-500'
                  }`}>{t.password}</label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? 'text-white/40' : 'text-gray-400'
                    }`} size={18} />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-neon-blue outline-none transition-all ${
                        darkMode 
                          ? 'bg-galaxy-purple border-neon-blue/20 text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-neon-blue text-galaxy-purple py-4 rounded-xl font-black uppercase italic tracking-tighter hover:bg-neon-blue/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? '...' : (isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />)}
                  {isRegistering ? t.register : t.login}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase font-bold">
                  <span className={`px-4 ${darkMode ? 'bg-deep-purple text-white/40' : 'bg-white text-gray-400'}`}>ou</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full border py-4 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-3 mb-3 ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Chrome size={20} className="text-neon-blue" />
                {t.googleLogin}
              </button>

              <button 
                onClick={handleGithubLogin}
                disabled={loading}
                className={`w-full border py-4 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-3 ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Github size={20} className={darkMode ? 'text-white' : 'text-gray-900'} />
                {t.githubLogin}
              </button>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className={`text-xs font-bold uppercase transition-colors ${
                    darkMode ? 'text-white/40 hover:text-neon-blue' : 'text-gray-400 hover:text-neon-blue'
                  }`}
                >
                  {isRegistering ? t.hasAccount : t.noAccount}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
