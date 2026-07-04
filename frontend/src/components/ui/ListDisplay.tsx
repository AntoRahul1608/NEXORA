import React from 'react';

interface ListProps {
  items?: string[];
  ordered?: boolean;
  className?: string;
}

export const ListDisplay: React.FC<ListProps> = ({
  items = [],
  ordered = false,
  className = '',
}) => {
  const Element = ordered ? 'ol' : 'ul';

  const listClasses = ordered
    ? 'list-decimal pl-5 space-y-2 text-dark-100'
    : 'list-disc pl-5 space-y-2 text-dark-100';

  return (
    <Element className={`${listClasses} ${className}`}>
      {items.map((item, idx) => (
        <li key={idx} className="leading-relaxed">
          {item}
        </li>
      ))}
    </Element>
  );
};
export default ListDisplay;
