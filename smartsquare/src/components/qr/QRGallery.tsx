import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { QRCodeOptions } from '../../types/qr';
import { Language, translations } from '../../constants/translations';
import { Trash2, ExternalLink, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRGalleryProps {
  userId: string;
  language: Language;
  darkMode: boolean;
  onLoadQRCode: (options: QRCodeOptions) => void;
}

interface SavedQRCode {
  id: string;
  uid: string;
  name?: string;
  options: QRCodeOptions;
  createdAt: any;
}

export default function QRGallery({ userId, language, darkMode, onLoadQRCode }: QRGalleryProps) {
  const [savedCodes, setSavedCodes] = useState<SavedQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const q = query(
      collection(db, 'qrcodes'),
      where('uid', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const codes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedQRCode[];
      setSavedCodes(codes);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'qrcodes');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await deleteDoc(doc(db, 'qrcodes', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `qrcodes/${id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t.myGallery}
        </h2>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${darkMode ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-500'}`}>
          {savedCodes.length} {savedCodes.length === 1 ? 'QR Code' : 'QR Codes'}
        </span>
      </div>

      {savedCodes.length === 0 ? (
        <div className={`text-center py-12 rounded-3xl border-2 border-dashed ${darkMode ? 'border-white/10 text-white/40' : 'border-gray-200 text-gray-400'}`}>
          <p className="font-medium">{t.noSavedCodes}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {savedCodes.map((code) => (
              <motion.div
                key={code.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-3xl border transition-all hover:shadow-xl ${
                  darkMode 
                    ? 'bg-white/5 border-white/10 hover:border-neon-blue/30' 
                    : 'bg-white border-gray-200 hover:border-neon-blue/30'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neon-blue">
                    <Clock size={12} />
                    {code.createdAt?.toDate().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}
                  </div>
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                    title={t.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mb-6 bg-white p-4 rounded-2xl shadow-inner flex justify-center">
                  <div className="w-32 h-32 opacity-80 grayscale">
                    {/* Placeholder for QR Preview in gallery - we could use the same QR component here but small */}
                    <div className="w-full h-full border-2 border-gray-100 rounded-lg flex items-center justify-center text-[8px] text-gray-300 text-center uppercase font-bold">
                      {code.options.data.substring(0, 20)}...
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onLoadQRCode(code.options)}
                  className="w-full flex items-center justify-center gap-2 bg-neon-blue text-white py-3 rounded-xl font-bold text-sm hover:bg-neon-blue/80 transition-all shadow-md"
                >
                  <ExternalLink size={16} />
                  {t.load}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
