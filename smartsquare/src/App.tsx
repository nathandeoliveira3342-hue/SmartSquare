import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from './components/layout/MainLayout';
import Accordion from './components/ui/Accordion';
import QRPreview from './components/qr/QRPreview';
import QRGallery from './components/qr/QRGallery';
import LoginModal from './components/auth/LoginModal';
import { auth, logout, syncUserProfile } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Github, Upload, RotateCcw, Sun, Moon, Languages, User as UserIcon, LogOut } from 'lucide-react';
import { QRCodeOptions, DotsStyle, CornersSquareStyle, CornersDotStyle, Mode, ErrorCorrectionLevel } from './types/qr';
import { translations, Language } from './constants/translations';
import { motion, AnimatePresence } from 'motion/react';

const getLogoSvg = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="${color || '#000000'}" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="60" fill="white">S</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const INITIAL_OPTIONS: QRCodeOptions = {
  data: 'https://smartsquare.com',
  width: 300,
  height: 300,
  margin: 0,
  image: getLogoSvg('#1a0b2e'),
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: 'Q'
  },
  dotsOptions: {
    type: 'rounded',
    color: '#1a0b2e'
  },
  cornersSquareOptions: {
    type: 'extra-rounded',
    color: '#000000'
  },
  cornersDotOptions: {
    type: 'dot',
    color: '#000000'
  },
  backgroundOptions: {
    color: '#ffffff'
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.4,
    margin: 0
  }
};

export default function App() {
  const [options, setOptions] = useState<QRCodeOptions>(INITIAL_OPTIONS);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState<Language>('pt');
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const t = useMemo(() => translations[language], [language]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        syncUserProfile(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update default logo image when color changes
  useEffect(() => {
    if (!isCustomImage) {
      setOptions(prev => ({
        ...prev,
        image: getLogoSvg(prev.dotsOptions.color)
      }));
    }
  }, [options.dotsOptions.color, isCustomImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOptions(prev => ({ ...prev, image: event.target?.result as string }));
        setIsCustomImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setIsCustomImage(false);
    setOptions(prev => ({ ...prev, image: getLogoSvg(prev.dotsOptions.color) }));
  };

  return (
    <MainLayout
      darkMode={darkMode}
      header={
        <>
          <div className="flex items-center gap-1">
            <div 
              className="w-12 h-12 flex items-center justify-center rounded-xl font-black text-3xl text-white transition-colors duration-500 shadow-sm bg-galaxy-purple border border-neon-blue/20"
            >
              S
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <Languages size={16} className="text-white/60" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-white border-none focus:ring-0 cursor-pointer font-bold uppercase text-xs"
              >
                <option value="pt" className="text-black">PT</option>
                <option value="en" className="text-black">EN</option>
              </select>
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title={darkMode ? t.switchLight : t.switchDark}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-300" />}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white/10 pl-1 pr-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-all"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <span className="font-bold text-xs text-white hidden sm:block">{user.displayName?.split(' ')[0]}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-deep-purple border border-neon-blue/20 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                      <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2 p-4 text-xs font-bold text-red-400 hover:bg-white/5 transition-all"
                    >
                      <LogOut size={14} /> {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-neon-blue text-galaxy-purple px-4 py-2 rounded-full font-black uppercase italic tracking-tighter text-xs hover:bg-neon-blue/80 transition-all"
              >
                {t.login}
              </button>
            )}

            <a href="https://github.com/kozakdenys/qr-code-styling" target="_blank" className="flex items-center gap-1 hover:underline opacity-80 hidden sm:flex">
              <Github size={16} /> GitHub
            </a>
          </div>
        </>
      }
      hero={
        <div 
          className="py-16 px-8 border-b border-deep-purple text-white transition-all duration-500"
          style={{ 
            background: `linear-gradient(135deg, var(--color-galaxy-purple), var(--color-deep-purple), var(--color-neon-blue))` 
          }}
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 
              className="text-6xl font-black mb-3 tracking-tighter drop-shadow-sm uppercase italic text-white"
            >
              SmartSquare
            </h1>
            <p className="text-2xl font-light opacity-90 drop-shadow-sm uppercase tracking-widest text-white">{t.heroSubtitle}</p>
            <p className="text-xl font-light opacity-70 drop-shadow-sm text-white max-w-2xl mx-auto">{t.heroDescription}</p>
          </div>
        </div>
      }
      sidebar={
        <div className={`rounded-lg border border-neon-blue/20 overflow-hidden shadow-sm transition-colors duration-500 ${darkMode ? 'bg-galaxy-purple' : 'bg-white'}`}>
          {/* Main Options - Fixed */}
          <div className="p-4 border-b border-neon-blue/10">
            <h3 className={`text-sm font-bold uppercase mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.mainOptions}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.data}</label>
                <input 
                  type="text" 
                  value={options.data}
                  onChange={(e) => setOptions(prev => ({ ...prev, data: e.target.value }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.imageFile}</label>
                <div className="flex items-center gap-2">
                  <label className={`cursor-pointer px-4 py-2 rounded text-sm flex items-center gap-2 border border-neon-blue/30 transition-all ${darkMode ? 'bg-galaxy-purple hover:bg-neon-blue/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}>
                    <Upload size={14} /> {t.chooseFile}
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                  {isCustomImage && (
                    <button 
                      onClick={handleRemoveImage}
                      className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                    >
                      {t.remove}
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.width}</label>
                  <input 
                    type="number" 
                    value={options.width}
                    onChange={(e) => setOptions(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.height}</label>
                  <input 
                    type="number" 
                    value={options.height}
                    onChange={(e) => setOptions(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.margin}</label>
                  <input 
                    type="number" 
                    value={options.margin}
                    onChange={(e) => setOptions(prev => ({ ...prev, margin: Number(e.target.value) }))}
                    className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Options */}
          <Accordion title={t.qrCodeOptions} darkMode={darkMode}>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.typeNumber}</label>
                <input 
                  type="number" 
                  min="0"
                  max="40"
                  value={options.qrOptions.typeNumber}
                  onChange={(e) => setOptions(prev => ({ ...prev, qrOptions: { ...prev.qrOptions, typeNumber: Number(e.target.value) } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.mode}</label>
                <select 
                  value={options.qrOptions.mode}
                  onChange={(e) => setOptions(prev => ({ ...prev, qrOptions: { ...prev.qrOptions, mode: e.target.value as Mode } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                >
                  {['Numeric', 'Alphanumeric', 'Byte', 'Kanji'].map(m => (
                    <option key={m} value={m} className={darkMode ? 'bg-galaxy-purple' : 'bg-white'}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.errorCorrectionLevel}</label>
                <select 
                  value={options.qrOptions.errorCorrectionLevel}
                  onChange={(e) => setOptions(prev => ({ ...prev, qrOptions: { ...prev.qrOptions, errorCorrectionLevel: e.target.value as ErrorCorrectionLevel } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                >
                  {['L', 'M', 'Q', 'H'].map(l => (
                    <option key={l} value={l} className={darkMode ? 'bg-galaxy-purple' : 'bg-white'}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </Accordion>

          {/* Dots Options */}
          <Accordion title={t.dotsOptions} darkMode={darkMode}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.dotsStyle}</label>
                <select 
                  value={options.dotsOptions.type}
                  onChange={(e) => setOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, type: e.target.value as DotsStyle } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                >
                  {['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'].map(s => (
                    <option key={s} value={s} className={darkMode ? 'bg-galaxy-purple' : 'bg-white'}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.color}</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={options.dotsOptions.color}
                    onChange={(e) => setOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, color: e.target.value } }))}
                    className="w-10 h-10 border-none p-0 cursor-pointer bg-transparent"
                  />
                  <button 
                    onClick={() => setOptions(prev => ({ ...prev, dotsOptions: { ...prev.dotsOptions, color: '#000000' } }))}
                    className={`text-xs flex items-center gap-1 transition-all ${darkMode ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <RotateCcw size={12} /> {t.clear}
                  </button>
                </div>
              </div>
            </div>
          </Accordion>

          {/* Corners Square Options */}
          <Accordion title={t.cornersSquareOptions} darkMode={darkMode}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.cornersSquareStyle}</label>
                <select 
                  value={options.cornersSquareOptions.type}
                  onChange={(e) => setOptions(prev => ({ ...prev, cornersSquareOptions: { ...prev.cornersSquareOptions, type: e.target.value as CornersSquareStyle } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                >
                  {['square', 'dot', 'extra-rounded'].map(s => (
                    <option key={s} value={s} className={darkMode ? 'bg-galaxy-purple' : 'bg-white'}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.color}</label>
                <input 
                  type="color" 
                  value={options.cornersSquareOptions.color}
                  onChange={(e) => setOptions(prev => ({ ...prev, cornersSquareOptions: { ...prev.cornersSquareOptions, color: e.target.value } }))}
                  className="w-10 h-10 border-none p-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </Accordion>

          {/* Corners Dot Options */}
          <Accordion title={t.cornersDotOptions} darkMode={darkMode}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.cornersDotStyle}</label>
                <select 
                  value={options.cornersDotOptions.type}
                  onChange={(e) => setOptions(prev => ({ ...prev, cornersDotOptions: { ...prev.cornersDotOptions, type: e.target.value as CornersDotStyle } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                >
                  {['square', 'dot'].map(s => (
                    <option key={s} value={s} className={darkMode ? 'bg-galaxy-purple' : 'bg-white'}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.color}</label>
                <input 
                  type="color" 
                  value={options.cornersDotOptions.color}
                  onChange={(e) => setOptions(prev => ({ ...prev, cornersDotOptions: { ...prev.cornersDotOptions, color: e.target.value } }))}
                  className="w-10 h-10 border-none p-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </Accordion>

          {/* Background Options */}
          <Accordion title={t.backgroundOptions} darkMode={darkMode}>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.backgroundColor}</label>
                <input 
                  type="color" 
                  value={options.backgroundOptions.color}
                  onChange={(e) => setOptions(prev => ({ ...prev, backgroundOptions: { ...prev.backgroundOptions, color: e.target.value } }))}
                  className="w-10 h-10 border-none p-0 cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </Accordion>

          {/* Image Options */}
          <Accordion title={t.imageOptions} darkMode={darkMode}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="hideDots"
                  checked={options.imageOptions.hideBackgroundDots}
                  onChange={(e) => setOptions(prev => ({ ...prev, imageOptions: { ...prev.imageOptions, hideBackgroundDots: e.target.checked } }))}
                  className="w-4 h-4 accent-neon-blue"
                />
                <label htmlFor="hideDots" className={`text-sm ${darkMode ? 'text-white/80' : 'text-gray-600'}`}>{t.hideDots}</label>
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.imageSize}</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={options.imageOptions.imageSize}
                  onChange={(e) => setOptions(prev => ({ ...prev, imageOptions: { ...prev.imageOptions, imageSize: Number(e.target.value) } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                />
              </div>
              <div className="space-y-1">
                <label className={`text-xs font-bold uppercase ml-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{t.imageMargin}</label>
                <input 
                  type="number" 
                  value={options.imageOptions.margin}
                  onChange={(e) => setOptions(prev => ({ ...prev, imageOptions: { ...prev.imageOptions, margin: Number(e.target.value) } }))}
                  className={`w-full border border-neon-blue/30 rounded px-3 py-2 text-sm focus:ring-neon-blue transition-all ${darkMode ? 'bg-galaxy-purple text-white' : 'bg-gray-50 text-gray-900'}`}
                />
              </div>
            </div>
          </Accordion>
        </div>
      }
      preview={<QRPreview options={options} language={language} user={user} />}
    >
      {/* Tutorial Section */}
      <section className={`py-16 ${darkMode ? 'bg-galaxy-purple' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-black uppercase italic mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {language === 'pt' ? 'Personalize, Salve e Utilize' : 'Personalize, Save and Use'}
            </h2>
            <div className="w-24 h-1 bg-neon-blue mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: language === 'pt' ? '1. Personalize' : '1. Personalize',
                desc: language === 'pt' ? 'Escolha cores, formatos e adicione seu logo para um design único.' : 'Choose colors, shapes and add your logo for a unique design.',
                img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=300'
              },
              {
                title: language === 'pt' ? '2. Salve' : '2. Save',
                desc: language === 'pt' ? 'Crie uma conta para salvar seus designs e acessá-los de qualquer lugar.' : 'Create an account to save your designs and access them from anywhere.',
                img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400&h=300'
              },
              {
                title: language === 'pt' ? '3. Utilize' : '3. Use',
                desc: language === 'pt' ? 'Baixe em alta resolução e utilize em seus materiais impressos ou digitais.' : 'Download in high resolution and use in your printed or digital materials.',
                img: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400&h=300'
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className={`p-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} text-center`}
              >
                <div className="mb-6 overflow-hidden rounded-2xl aspect-video">
                  <img 
                    src={step.img} 
                    alt={step.title} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                <p className={`${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {user && (
        <section className={`py-16 border-t ${darkMode ? 'bg-galaxy-purple border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4">
             <QRGallery 
               userId={user.uid} 
               language={language} 
               darkMode={darkMode} 
               onLoadQRCode={(savedOptions) => {
                 setOptions(savedOptions);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
             />
          </div>
        </section>
      )}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        language={language} 
        darkMode={darkMode}
      />
    </MainLayout>
  );
}
