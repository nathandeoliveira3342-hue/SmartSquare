import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  darkMode?: boolean;
}

export default function Accordion({ title, children, darkMode }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neon-blue/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-2 flex justify-between items-center hover:bg-neon-blue/5 transition-colors text-left"
      >
        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className={darkMode ? 'text-white/40' : 'text-gray-400'} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`p-4 space-y-4 transition-colors duration-500 ${darkMode ? 'bg-galaxy-purple' : 'bg-white'}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
