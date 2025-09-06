/**
 * POML Preview Component - Phase 3 Enhanced Preview
 * Features: Syntax highlighting, error indicators, copy to clipboard, download
 */

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { usePomlStore } from '../../hooks';
import type { ValidationError } from '../../types';

interface PomlPreviewProps {
  pomlContent: string;
  isValid: boolean;
  validationErrors: ValidationError[];
  className?: string;
}

interface PreviewHeaderProps {
  pomlContent: string;
  isValid: boolean;
  onCopyToClipboard: () => void;
  onDownload: () => void;
  copySuccess: boolean;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  pomlContent,
  isValid,
  onCopyToClipboard,
  onDownload,
  copySuccess
}) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-2">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        POML Preview
      </h2>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        isValid 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        {isValid ? 'Valid' : 'Invalid'}
      </div>
    </div>
    
    <div className="flex items-center space-x-2">
      <button
        onClick={onCopyToClipboard}
        disabled={!pomlContent}
        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {copySuccess ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Copy</span>
          </>
        )}
      </button>
      
      <button
        onClick={onDownload}
        disabled={!pomlContent}
        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Download</span>
      </button>
    </div>
  </div>
);

interface ErrorPanelProps {
  errors: ValidationError[];
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ errors }) => (
  <div className="border-t border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
    <div className="p-4">
      <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
        Validation Errors ({errors.length})
      </h3>
      <div className="space-y-2">
        {errors.map((error, index) => (
          <div 
            key={index}
            className="flex items-start space-x-2 text-sm"
          >
            <div className="flex-shrink-0 w-1 h-1 bg-red-500 rounded-full mt-2"></div>
            <div>
              <div className="text-red-700 dark:text-red-300">
                {error.message}
              </div>
              {error.line && (
                <div className="text-red-600 dark:text-red-400 text-xs">
                  Line {error.line}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PomlPreview: React.FC<PomlPreviewProps> = ({
  pomlContent,
  isValid,
  validationErrors,
  className = ''
}) => {
  const { theme } = usePomlStore();
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pomlContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pomlContent;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  }, [pomlContent]);

  const handleDownload = useCallback(() => {
    try {
      const blob = new Blob([pomlContent], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompt-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.poml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [pomlContent]);

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-800 ${className}`}>
      <PreviewHeader
        pomlContent={pomlContent}
        isValid={isValid}
        onCopyToClipboard={handleCopyToClipboard}
        onDownload={handleDownload}
        copySuccess={copySuccess}
      />
      
      <div className="flex-1 overflow-auto">
        {pomlContent ? (
          <SyntaxHighlighter
            language="xml"
            style={theme === 'dark' ? vscDarkPlus : oneLight}
            showLineNumbers={true}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: theme === 'dark' ? '#6e7681' : '#57606a',
              backgroundColor: 'transparent'
            }}
            customStyle={{
              margin: 0,
              padding: '1rem',
              backgroundColor: 'transparent',
              fontSize: '14px',
              fontFamily: 'Monaco, "Courier New", monospace'
            }}
            wrapLines={true}
            wrapLongLines={true}
          >
            {pomlContent}
          </SyntaxHighlighter>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Generated POML will appear here</p>
              <p className="text-sm mt-1">Enter text and click "Generate POML" to see results</p>
            </div>
          </div>
        )}
      </div>

      {!isValid && validationErrors.length > 0 && (
        <ErrorPanel errors={validationErrors} />
      )}
    </div>
  );
};

export default PomlPreview;
