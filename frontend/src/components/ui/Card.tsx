import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, className = '', children }) => {
  return (
    <div
      className={`glass rounded-xl p-6 transition-all duration-300 hover:bg-white/[0.05] ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="gradient-text text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm text-dark-300">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
