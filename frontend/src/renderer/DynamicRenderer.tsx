import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { componentRegistry } from './ComponentRegistry';
import type { UIComponent } from '../types/types';

// React Error Boundary to catch rendering errors inside dynamic UI nodes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dynamic UI rendering crash caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 rounded-xl border border-accent-error/30 bg-accent-error/5 text-accent-error text-xs space-y-1">
            <span className="font-bold">Error rendering component</span>
            <p className="opacity-80 font-mono text-[10px]">
              {this.state.error?.message || 'Internal Render Error'}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

interface Props {
  node: UIComponent;
}

const DynamicRenderer: React.FC<Props> = memo(({ node }) => {
  if (!node) return null;

  const Component = componentRegistry[node.component];
  if (!Component) {
    console.warn(`Unknown component type: ${node.component}`);
    return null;
  }

  // Recursively render child components
  const childElements = node.children?.map((child) => (
    <DynamicRenderer key={child.id} node={child} />
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <ErrorBoundary>
        <Component {...(node.props || {})} id={node.id} validation={node.validation}>
          {childElements}
        </Component>
      </ErrorBoundary>
    </motion.div>
  );
});

DynamicRenderer.displayName = 'DynamicRenderer';

export const DynamicUI: React.FC<{ schema: UIComponent | null }> = ({ schema }) => {
  if (!schema) return null;
  return (
    <AnimatePresence mode="wait">
      <div className="w-full space-y-3">
        <ErrorBoundary>
          <DynamicRenderer key={schema.id} node={schema} />
        </ErrorBoundary>
      </div>
    </AnimatePresence>
  );
};

export default DynamicRenderer;
