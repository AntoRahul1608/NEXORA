import React from 'react';

interface DividerProps {
  label?: string;
  id?: string;
}

const Divider: React.FC<DividerProps> = ({ label }) => {
  if (label) {
    return (
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-dark-500" />
        <span className="text-xs font-medium text-dark-300">{label}</span>
        <div className="h-px flex-1 bg-dark-500" />
      </div>
    );
  }

  return <div className="my-2 h-px w-full bg-dark-500" />;
};

export default Divider;
