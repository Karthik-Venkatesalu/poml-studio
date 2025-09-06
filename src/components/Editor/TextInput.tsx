// Text input component for the editor panel
// This component will be fully implemented in Phase 3

import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onPaste?: (text: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter your text here...',
  isProcessing = false,
}) => {
  return (
    <div className="h-full flex flex-col">
      <textarea
        className="flex-1 w-full p-4 border-0 resize-none focus:outline-none bg-transparent text-gray-900 dark:text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isProcessing}
      />
    </div>
  );
};

export default TextInput;
