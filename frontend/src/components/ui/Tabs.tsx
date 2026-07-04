import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  children?: React.ReactNode;
  id?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs = [], children }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const childArray = React.Children.toArray(children);

  return (
    <div className="w-full">
      <div className="flex gap-1 rounded-lg bg-dark-800 p-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveIndex(index)}
            className={`relative flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeIndex === index
                ? 'text-white'
                : 'text-dark-300 hover:text-dark-100'
            }`}
          >
            {activeIndex === index && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-md bg-dark-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4">
        {childArray[activeIndex] ?? null}
      </div>
    </div>
  );
};

export default Tabs;
