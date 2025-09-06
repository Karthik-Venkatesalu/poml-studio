import React, { useState, useMemo } from 'react';
import { Allotment } from 'allotment';
import { usePomlStore } from './hooks';
import TextInput from './components/Editor/TextInput';
import { PomlPreview } from './components/Preview/PomlPreview';
import { InspectorPanel } from './components/Inspector/InspectorPanel';
import type { PomlSection } from './types/poml';
import TextAnalysisDemo from './components/TextAnalysisDemo';
import { PomlGeneratorDemo } from './components/PomlGeneratorDemo';
import './App.css';, { useState, useMemo } from 'react';
import { Allotment } from 'allotment';
import { usePomlStore } from './hooks';
import { TextInput } from './components/Editor/TextInput';
import { AnalysisPanel } from './components/AnalysisPanel';
import { PomlGenerator } from './components/PomlGenerator';
import { PomlPreview } from './components/Preview/PomlPreview';
import { InspectorPanel } from './components/Inspector/InspectorPanel';
import { PomlSection } from './types/poml';
import TextAnalysisDemo from './components/TextAnalysisDemo';
import { PomlGeneratorDemo } from './components/PomlGeneratorDemo';
import './App.css';

type DemoMode = 'studio' | 'textAnalysis' | 'pomlGenerator';

// Component placeholders for now
const TopNavigation: React.FC<{ currentMode: DemoMode; onModeChange: (mode: DemoMode) => void }> = ({ currentMode, onModeChange }) => (
  <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
      POML Studio
    </h1>
    <div className="flex space-x-2">
      <button
        onClick={() => onModeChange('studio')}
        className={`px-4 py-2 rounded-md transition-colors ${
          currentMode === 'studio'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Studio
      </button>
      <button
        onClick={() => onModeChange('textAnalysis')}
        className={`px-4 py-2 rounded-md transition-colors ${
          currentMode === 'textAnalysis'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        Text Analysis
      </button>
      <button
        onClick={() => onModeChange('pomlGenerator')}
        className={`px-4 py-2 rounded-md transition-colors ${
          currentMode === 'pomlGenerator'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        POML Generator
      </button>
    </div>
  </div>
);

const StatusBar: React.FC = () => {
  const { isProcessing, inputText, detectedSections, generatedPoml } = usePomlStore();
  
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
        {generatedPoml && (
          <span>
            POML: {generatedPoml.length} chars
          </span>
        )}
      </div>
      <div>
        POML Studio v1.0
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { theme, inspectorPanelOpen, generatedPoml, detectedSections } = usePomlStore();
  const [currentMode, setCurrentMode] = useState<DemoMode>('studio');
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'generator'>('input');
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'inspector'>('preview');

  // Convert detected sections to PomlSection format
  const extractedSections = useMemo((): PomlSection[] => {
    return detectedSections.map((section, index) => ({
      id: section.id,
      type: section.type as any,
      content: section.content,
      startLine: index,
      endLine: index,
      confidence: section.confidence / 100 // Convert percentage to decimal
    }));
  }, [detectedSections]);

  // Mock confidence scores for sections
  const confidenceScores = useMemo(() => ({
    overview: 0.8,
    objective: 0.8,
    motivation: 0.8,
    learning: 0.8,
  }), []);

  const handleSectionUpdate = (sectionId: string, content: string) => {
    // TODO: Implement section update logic
    console.log('Update section:', sectionId, content);
  };

  const handleSectionReorder = (fromIndex: number, toIndex: number) => {
    // TODO: Implement section reorder logic
    console.log('Reorder sections:', fromIndex, toIndex);
  };

  if (currentMode === 'textAnalysis') {
    return (
      <div className={`min-h-screen ${theme}`}>
        <TopNavigation currentMode={currentMode} onModeChange={setCurrentMode} />
        <TextAnalysisDemo />
      </div>
    );
  }

  if (currentMode === 'pomlGenerator') {
    return (
      <div className={`min-h-screen ${theme}`}>
        <TopNavigation currentMode={currentMode} onModeChange={setCurrentMode} />
        <div className="p-6">
          <PomlGeneratorDemo />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme}`}>
      <TopNavigation currentMode={currentMode} onModeChange={setCurrentMode} />
      <main className="flex-1 flex bg-gray-50 dark:bg-gray-900">
        <Allotment defaultSizes={[300, 1, 300]}>
          {/* Left Panel - Input/Analysis/Generator */}
          <Allotment.Pane minSize={250}>
            <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('input')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'input'
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 border-b-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Input
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'analysis'
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 border-b-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Analysis
                </button>
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'generator'
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 border-b-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Generator
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'input' && (
                  <div className="h-full">
                    <TextInput />
                  </div>
                )}
                {activeTab === 'analysis' && (
                  <div className="h-full">
                    <AnalysisPanel />
                  </div>
                )}
                {activeTab === 'generator' && (
                  <div className="h-full">
                    <PomlGenerator />
                  </div>
                )}
              </div>
            </div>
          </Allotment.Pane>

          {/* Center Panel - Main Preview */}
          <Allotment.Pane minSize={400}>
            <div className="h-full bg-white dark:bg-gray-800">
              <PomlPreview poml={generatedPoml || ''} />
            </div>
          </Allotment.Pane>

          {/* Right Panel - Inspector/Preview */}
          <Allotment.Pane minSize={250}>
            <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setRightPanelTab('preview')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    rightPanelTab === 'preview'
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 border-b-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setRightPanelTab('inspector')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    rightPanelTab === 'inspector'
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30 border-b-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Inspector
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {rightPanelTab === 'preview' && (
                  <div className="h-full p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Document Info
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>Characters: {(generatedPoml || '').length}</div>
                          <div>Sections: {extractedSections.length}</div>
                          <div>Status: {generatedPoml ? 'Generated' : 'Pending'}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Quick Actions
                        </h3>
                        <div className="space-y-2">
                          <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Export POML
                          </button>
                          <button className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            Copy to Clipboard
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {rightPanelTab === 'inspector' && (
                  <div className="h-full">
                    <InspectorPanel
                      poml={generatedPoml || ''}
                      sections={extractedSections}
                      confidenceScores={confidenceScores}
                      onSectionUpdate={handleSectionUpdate}
                      onSectionReorder={handleSectionReorder}
                    />
                  </div>
                )}
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </main>
      <StatusBar />
    </div>
  );
};

export default App;

const App: React.FC = () => {
  const { theme, inspectorPanelOpen } = usePomlStore();
  const [currentMode, setCurrentMode] = useState<DemoMode>('studio');

  if (currentMode === 'textAnalysis') {
    return (
      <div className={`min-h-screen ${theme}`}>
        <TopNavigation currentMode={currentMode} onModeChange={setCurrentMode} />
        <TextAnalysisDemo />
      </div>
    );
  }

  if (currentMode === 'pomlGenerator') {
    return (
      <div className={`min-h-screen ${theme}`}>
        <TopNavigation currentMode={currentMode} onModeChange={setCurrentMode} />
        <div className="p-6">
          <PomlGeneratorDemo />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme}`}>
      <TopNavigation currentMode={currentMode} onModeChange={setCurrentMode} />
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
