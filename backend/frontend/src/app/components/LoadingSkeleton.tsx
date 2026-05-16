import { motion } from 'motion/react';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'detail' | 'grid';
  count?: number;
}

export function LoadingSkeleton({ variant = 'card', count = 6 }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg"
          >
            <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-5/6" />
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse w-20" />
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse w-24" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-md flex gap-4"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-4/5" />
              <div className="flex gap-2">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse w-16" />
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse w-20" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-3xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-5/6" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse w-4/5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return null;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
}

export function EmptyState({ icon, title, description, action, suggestions }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6 text-gray-400"
        >
          {icon}
        </motion.div>
      )}
      
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      
      {suggestions && suggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors cursor-pointer"
              >
                {suggestion}
              </motion.span>
            ))}
          </div>
        </div>
      )}
      
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
