import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  title?: string;
  open?: boolean;
  children?: React.ReactNode;
  id?: string;
}

const Modal: React.FC<ModalProps> = ({ title, open = true, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(open);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="glass relative z-10 w-full max-w-lg rounded-2xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h2 className="gradient-text text-xl font-semibold">{title}</h2>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded-lg p-1.5 text-dark-300 transition-colors hover:bg-dark-700 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <div>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
