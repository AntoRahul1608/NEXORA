import React from 'react';

interface ContainerProps {
  direction?: 'row' | 'column';
  gap?: number | string;
  padding?: number | string;
  align?: string;
  justify?: string;
  className?: string;
  wrap?: boolean;
  children?: React.ReactNode;
  id?: string;
}

const Container: React.FC<ContainerProps> = ({
  direction = 'column',
  gap = 4,
  padding = 0,
  align,
  justify,
  className = '',
  wrap = false,
  children,
}) => {
  const gapClass = typeof gap === 'number' ? `gap-${gap}` : gap;
  const paddingClass = typeof padding === 'number' ? `p-${padding}` : padding;

  return (
    <div
      className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} ${gapClass} ${paddingClass} ${
        wrap ? 'flex-wrap' : ''
      } ${className}`}
      style={{
        alignItems: align,
        justifyContent: justify,
      }}
    >
      {children}
    </div>
  );
};

export default Container;
