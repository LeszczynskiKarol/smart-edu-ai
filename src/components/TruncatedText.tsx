// src/components/TruncatedText.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TruncatedTextProps {
  text: string;
  limit?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
  containerClassName?: string;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  limit = 100,
  className = '',
  showMoreText = 'Show more',
  showLessText = 'Show less',
  containerClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncateToWord = (text: string, limit: number): string => {
    if (text.length <= limit) return text;

    const truncated = text.slice(0, limit);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substr(0, lastSpace) + '...';
    }
    return truncated + '...';
  };

  // If text is shorter than limit, just show it without the button
  if (text.length <= limit) {
    return (
      <div className={containerClassName}>
        <p className={className}>{text}</p>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <p className={className}>
        {isExpanded ? text : truncateToWord(text, limit)}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
      >
        <span>{isExpanded ? showLessText : showMoreText}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    </div>
  );
};

export default TruncatedText;
