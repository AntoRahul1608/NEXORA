import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
}

interface AccordionProps {
  items: AccordionItem[];
  children?: React.ReactNode;
  id?: string;
}

const Accordion: React.FC<AccordionProps> = ({ items = [], children }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const childArray = React.Children.toArray(children);

  const toggleItem = (id: string): void => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => (
        <div key={item.id} className="glass overflow-hidden rounded-xl">
          <button
            onClick={() => toggleItem(item.id)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-dark-100 transition-colors hover:bg-white/[0.03]"
          >
            <span>{item.title}</span>
            <motion.div
              animate={{ rotate: openItems.has(item.id) ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-dark-300" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {openItems.has(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="border-t border-dark-600 px-5 py-4">
                  {childArray[index] ?? null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
