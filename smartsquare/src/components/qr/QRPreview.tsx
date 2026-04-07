import { useEffect, useRef, useState, useMemo } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { QRCodeOptions } from '../../types/qr';
import { Share2, MessageCircle, Facebook, Twitter, Link as LinkIcon, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { translations, Language } from '../../constants/translations';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface QRPreviewProps {
  options: QRCodeOptions;
  language: Language;
  user: User | null;
}

export default function QRPreview({ options, language, user }: QRPreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const t = useMemo(() => translations[language], [language]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      await addDoc(collection(db, 'qrcodes'), {
        id: crypto.randomUUID(),
        uid: user.uid,
        options: options,
        createdAt: serverTimestamp()
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'qrcodes');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SmartSquare QR Code',
          text: `${t.shareVia} SmartSquare: ${options.data}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${t.shareVia} SmartSquare: ${options.data}\n${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert(t.linkCopied);
  };

  useEffect(() => {
    // Inicializa a instância apenas uma vez
    qrCode.current = new QRCodeStyling({
      width: options.width,
      height: options.height,
      data: options.data,
      margin: options.margin,
      image: options.image,
      qrOptions: {
        typeNumber: options.qrOptions.typeNumber as any,
        mode: options.qrOptions.mode as any,
        errorCorrectionLevel: options.qrOptions.errorCorrectionLevel as any
      },
      dotsOptions: {
        type: options.dotsOptions.type as any,
        color: options.dotsOptions.color
      },
      backgroundOptions: {
        color: options.backgroundOptions.color
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: options.imageOptions.margin,
        imageSize: options.imageOptions.imageSize,
        hideBackgroundDots: options.imageOptions.hideBackgroundDots
      },
      cornersSquareOptions: {
        type: options.cornersSquareOptions.type as any,
        color: options.cornersSquareOptions.color
      },
      cornersDotOptions: {
        type: options.cornersDotOptions.type as any,
        color: options.cornersDotOptions.color
      }
    });

    if (ref.current) {
      // Limpa o container antes de anexar
      ref.current.innerHTML = '';
      qrCode.current.append(ref.current);
    }
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: options.data,
        width: options.width,
        height: options.height,
        margin: options.margin,
        image: options.image,
        qrOptions: {
          typeNumber: options.qrOptions.typeNumber as any,
          mode: options.qrOptions.mode as any,
          errorCorrectionLevel: options.qrOptions.errorCorrectionLevel as any
        },
        dotsOptions: {
          type: options.dotsOptions.type as any,
          color: options.dotsOptions.color
        },
        backgroundOptions: {
          color: options.backgroundOptions.color
        },
        imageOptions: {
          margin: options.imageOptions.margin,
          imageSize: options.imageOptions.imageSize,
          hideBackgroundDots: options.imageOptions.hideBackgroundDots
        },
        cornersSquareOptions: {
          type: options.cornersSquareOptions.type as any,
          color: options.cornersSquareOptions.color
        },
        cornersDotOptions: {
          type: options.cornersDotOptions.type as any,
          color: options.cornersDotOptions.color
        }
      });
    }
  }, [options]);
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="bg-white p-6 rounded-3xl shadow-2xl border border-neon-blue/10 transition-all duration-500 hover:scale-[1.02]">
        <div ref={ref} className="overflow-hidden rounded-xl" />
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 w-full max-w-sm">
        {user && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-md mb-2 ${
              saveStatus === 'success' 
                ? 'bg-green-500 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/10'
            }`}
          >
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"
                />
              ) : saveStatus === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 size={20} /> {t.saveSuccess}
                </motion.div>
              ) : saveStatus === 'error' ? (
                <motion.div
                  key="error"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <AlertCircle size={20} /> {t.saveError}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Save size={20} /> {t.save}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        )}
        <button 
          onClick={() => qrCode.current?.download({ name: 'qr-code', extension: 'png' })}
          className="flex-1 bg-galaxy-purple text-white px-4 py-2 rounded-md hover:bg-neon-blue/20 transition-all font-medium text-sm shadow-sm border border-neon-blue/30"
        >
          PNG
        </button>
        <button 
          onClick={() => qrCode.current?.download({ name: 'qr-code', extension: 'jpeg' })}
          className="flex-1 bg-galaxy-purple text-white border border-neon-blue/30 px-4 py-2 rounded-md hover:bg-neon-blue/10 transition-all font-medium text-sm shadow-sm"
        >
          JPG
        </button>
        <button 
          onClick={() => qrCode.current?.download({ name: 'qr-code', extension: 'svg' })}
          className="flex-1 bg-galaxy-purple text-white border border-neon-blue/30 px-4 py-2 rounded-md hover:bg-neon-blue/10 transition-all font-medium text-sm shadow-sm"
        >
          SVG
        </button>
      </div>

      <div className="relative w-full max-w-sm">
        <button 
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-neon-blue text-white px-4 py-3 rounded-xl hover:bg-neon-blue/80 transition-all font-bold text-base shadow-md active:scale-95"
        >
          <Share2 size={20} /> {t.share}
        </button>

        {showShareMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-deep-purple rounded-2xl shadow-2xl border border-neon-blue/20 p-4 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
            <h4 className="text-sm font-bold text-white/60 uppercase mb-4 text-center">{t.shareVia}</h4>
            <div className="grid grid-cols-4 gap-4">
              <button 
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-green-100">
                  <MessageCircle size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase">WhatsApp</span>
              </button>
              <button 
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-blue-800 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-100">
                  <Facebook size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase">Facebook</span>
              </button>
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(options.data)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-galaxy-purple text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-neon-blue/20 border border-neon-blue/30">
                  <Twitter size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase">Twitter</span>
              </button>
              <button 
                onClick={copyLink}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-12 h-12 bg-galaxy-purple text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-gray-100 border border-neon-blue/30">
                  <LinkIcon size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase">Link</span>
              </button>
            </div>
            <button 
              onClick={() => setShowShareMenu(false)}
              className="w-full mt-6 text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest"
            >
              {t.close}
            </button>
          </div>
        )}
      </div>
    </div>

  );
}
