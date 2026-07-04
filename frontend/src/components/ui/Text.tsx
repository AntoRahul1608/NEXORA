import React from 'react';

interface TextProps {
  content?: string;
  text?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption';
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  content,
  text,
  variant = 'body',
  color,
  align = 'left',
  className = '',
}) => {
  const displayContent = content || text || '';

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  const baseStyles = 'leading-relaxed';

  const variantClasses = {
    h1: 'text-3xl font-extrabold tracking-tight md:text-4xl text-white',
    h2: 'text-2xl font-bold tracking-tight text-white',
    h3: 'text-xl font-bold text-white',
    h4: 'text-lg font-semibold text-white',
    h5: 'text-base font-semibold text-white',
    h6: 'text-sm font-semibold text-white',
    body: 'text-base text-dark-100',
    caption: 'text-xs text-dark-300',
  };

  const Element = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant)
    ? variant
    : variant === 'caption' ? 'span' : 'p') as React.ElementType;

  const colorStyle = color ? { color } : {};

  return (
    <Element
      className={`${baseStyles} ${variantClasses[variant]} ${alignmentClasses[align]} ${className}`}
      style={colorStyle}
    >
      {displayContent}
    </Element>
  );
};
