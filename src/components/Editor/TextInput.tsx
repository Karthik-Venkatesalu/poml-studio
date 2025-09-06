/**
 * Rich Text Input Component - Phase 3 Enhanced Editor
 * Features: Large text support, auto-save, paste detection, undo/redo
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { usePomlStore } from '../../hooks';
import { debounce } from 'lodash';

interface TextInputProps {
  value?: string;
  onChange: (value: string) => void;
  onPaste?: (text: string) => void;
  isProcessing?: boolean;
  placeholder?: string;
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value = '',
  onChange,
  onPaste,
  isProcessing = false,
  placeholder = 'Enter your text here...',
  className = ''
}) => {
  const { theme } = usePomlStore();
  const editorRef = useRef<any>(null);
  const [lastSavedValue, setLastSavedValue] = useState(value);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [characterCount, setCharacterCount] = useState((value || '').length);

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce((text: string) => {
      localStorage.setItem('poml-studio-draft', text);
      setLastSavedValue(text);
      setHasUnsavedChanges(false);
    }, 2000),
    []
  );

  // Handle editor changes
  const handleEditorChange = useCallback((newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
      setCharacterCount(newValue.length);
      setHasUnsavedChanges(newValue !== lastSavedValue);
      debouncedSave(newValue);
    }
  }, [onChange, lastSavedValue, debouncedSave]);

  // Handle paste events
  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;

    // Add paste detection
    if (editor.onDidPaste) {
      editor.onDidPaste((e: any) => {
        const pastedText = editor.getModel()?.getValueInRange(e.range) || '';
        if (pastedText.length > 100 && onPaste) {
          // Substantial paste detected - trigger auto-parsing
          setTimeout(() => onPaste(pastedText), 100);
        }
      });
    }

    // Add keyboard shortcuts
    if (editor.addCommand) {
      editor.addCommand(editor.KeyMod?.CtrlCmd | editor.KeyCode?.KeyS, () => {
        // Force save on Ctrl/Cmd+S
        const currentValue = editor.getValue();
        localStorage.setItem('poml-studio-draft', currentValue);
        setLastSavedValue(currentValue);
        setHasUnsavedChanges(false);
      });
    }

    // Focus the editor
    editor.focus();
  }, [onPaste]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('poml-studio-draft');
    if (draft && draft !== value && !value) {
      onChange(draft);
    }
  }, []);

  // Clean up debounced function
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const editorOptions = {
    minimap: { enabled: false },
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    fontSize: 14,
    fontFamily: 'Monaco, "Courier New", monospace',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    readOnly: isProcessing,
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'none' as const,
    folding: false,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    contextmenu: true,
    selectOnLineNumbers: true,
    roundedSelection: false,
    cursorStyle: 'line' as const,
    cursorBlinking: 'blink' as const,
    smoothScrolling: true,
    mouseWheelZoom: true,
    find: {
      autoFindInSelection: 'never' as const,
      addExtraSpaceOnTop: false
    },
    placeholder: placeholder
  };

  return (
    <div className={`relative h-full ${className}`}>
      {/* Status indicators */}
      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
        {isProcessing && (
          <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
            <div className="animate-spin h-3 w-3 border border-blue-500 rounded-full border-t-transparent"></div>
            <span className="text-blue-700 dark:text-blue-300">Processing...</span>
          </div>
        )}
        
        {hasUnsavedChanges && (
          <div className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded text-xs text-orange-700 dark:text-orange-300">
            Unsaved changes
          </div>
        )}
      </div>

      {/* Character count and stats */}
      <div className="absolute bottom-2 right-2 z-10 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <span>{characterCount.toLocaleString()} chars</span>
          {characterCount > 10000 && (
            <span className="text-orange-600 dark:text-orange-400">Large text</span>
          )}
          {characterCount > 50000 && (
            <span className="text-red-600 dark:text-red-400">Very large</span>
          )}
        </div>
      </div>

      {/* Monaco Editor */}
      <Editor
        height="100%"
        defaultLanguage="plaintext"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={editorOptions}
        loading={
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        }
      />
    </div>
  );
};

export default TextInput;
