import React from 'react';
import { Allotment } from 'allotment';
import { usePomlStore } from './hooks';
import './App.css';

// Component placeholders for now
const TopNavigation: React.FC = () => (
  <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
      POML Studio
    </h1>
  </div>
);

const InputEditor: React.FC = () => {
  const { inputText, updateInputText } = usePomlStore();
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Input Text
        </h2>
      </div>
      <div className="flex-1 p-4">
        <textarea
          className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Paste or type your prompt here..."
          value={inputText}
          onChange={(e) => updateInputText(e.target.value)}
        />
      </div>
    </div>
  );
};

const PomlPreview: React.FC = () => {
  const { generatedPoml } = usePomlStore();
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          POML Preview
        </h2>
      </div>
      <div className="flex-1 p-4">
        <pre className="w-full h-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono overflow-auto">
          {generatedPoml || '<!-- Generated POML will appear here -->'}
        </pre>
      </div>
    </div>
  );
};

const InspectorPanel: React.FC = () => {
  const { detectedSections, inspectorPanelOpen } = usePomlStore();
  
  if (!inspectorPanelOpen) return null;
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Inspector
        </h2>
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {detectedSections.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No sections detected yet. Start typing to see parsed sections.
            </p>
          ) : (
            detectedSections.map((section) => (
              <div 
                key={section.id}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {section.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {section.confidence.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {section.content.substring(0, 100)}
                  {section.content.length > 100 && '...'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBar: React.FC = () => {
  const { isProcessing, inputText, detectedSections } = usePomlStore();
  
  return (
    <div className="h-8 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between px-4 text-sm text-gray-600 dark:text-gray-300">
      <div className="flex items-center space-x-4">
        <span>
          {isProcessing ? 'Processing...' : 'Ready'}
        </span>
        <span>
          {inputText.length} characters
        </span>
        <span>
          {detectedSections.length} sections
        </span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { theme, inspectorPanelOpen } = usePomlStore();

  return (
    <div className={`h-screen flex flex-col ${theme}`}>
      <TopNavigation />
      <main className="flex-1 flex bg-gray-50 dark:bg-gray-900">
        <Allotment>
          <Allotment.Pane minSize={300}>
            <InputEditor />
          </Allotment.Pane>
          <Allotment>
            <Allotment.Pane minSize={300}>
              <PomlPreview />
            </Allotment.Pane>
            {inspectorPanelOpen && (
              <Allotment.Pane minSize={250} maxSize={500}>
                <InspectorPanel />
              </Allotment.Pane>
            )}
          </Allotment>
        </Allotment>
      </main>
      <StatusBar />
    </div>
  );
};

export default App;
