import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownDisplayProps {
  content?: string;
  text?: string;
  className?: string;
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({
  content,
  text,
  className = '',
}) => {
  const displayContent = content || text || '';

  return (
    <div className={`prose prose-invert max-w-none text-dark-100 ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-white" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-3 mb-2 text-white" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-2 mb-1 text-white" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="text-dark-100" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-dark-800 px-1.5 py-0.5 rounded text-accent-secondary font-mono text-sm" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-dark-800 p-4 rounded-xl overflow-x-auto border border-dark-600 font-mono text-sm my-4" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-accent-primary hover:text-accent-secondary transition-colors underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-accent-primary pl-4 italic my-2 text-dark-200" {...props} />
          ),
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
};
export default MarkdownDisplay;
