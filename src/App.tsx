import React, { useState, useMemo } from 'react';
import { Allotment } from 'allotment';
import { usePomlStore } from './hooks';
import TextInput from './components/Editor/TextInput';
import { PomlPreview } from './components/Preview/PomlPreview';
import { InspectorPanel } from './components/Inspector/InspectorPanel';
import type { PomlSection } from './types/poml.types';
import TextAnalysisDemo from './components/TextAnalysisDemo';
import { PomlGeneratorDemo } from './components/PomlGeneratorDemo';
import './App.css';

// Modern Icons (using Heroicons)
const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

type DemoMode = 'studio' | 'textAnalysis' | 'pomlGenerator';

// Modern Header Component
const ModernHeader: React.FC<{ currentMode: DemoMode; onModeChange: (mode: DemoMode) => void }> = ({ 
  currentMode, 
  onModeChange 
}) => {
  const { theme, setTheme } = usePomlStore();
  
  return (
    <div className="relative">
      {/* Header Background with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800"></div>
      <div className="absolute inset-0 backdrop-blur-sm bg-white/10 dark:bg-black/10"></div>
      
      {/* Header Content */}
      <div className="relative px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <DocumentTextIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">POML Studio</h1>
              <p className="text-white/70 text-sm">Prompt Orchestration Markup Language</p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur rounded-2xl p-1">
            <button
              onClick={() => onModeChange('studio')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentMode === 'studio'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => onModeChange('textAnalysis')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentMode === 'textAnalysis'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => onModeChange('pomlGenerator')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentMode === 'pomlGenerator'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Generator
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white transition-all duration-200"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modern Sidebar Tab Component
const ModernSidebar: React.FC<{
  activeTab: string;
  onTabChange: (tab: 'input' | 'analysis' | 'generator') => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'input', label: 'Input Editor', icon: DocumentTextIcon, description: 'Write your prompt' },
    { id: 'analysis', label: 'Analysis', icon: ChartBarIcon, description: 'Analyze content' },
    { id: 'generator', label: 'Generator', icon: CogIcon, description: 'Generate POML' },
  ];

  return (
    <div className="w-16 hover:w-64 transition-all duration-300 group bg-white/50 dark:bg-gray-900/50 backdrop-blur border-r border-gray-200/50 dark:border-gray-700/50">
      <div className="p-4 space-y-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:scale-105'
            }`}
          >
            <div className="flex-shrink-0">
              <tab.icon />
            </div>
            <div className="min-w-0 text-left opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="font-medium text-sm truncate">{tab.label}</div>
              <div className="text-xs opacity-70 truncate">{tab.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Modern Analysis Panel
const ModernAnalysisPanel: React.FC = () => {
  const { analysis, isProcessing } = usePomlStore();
  
  return (
    <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 h-full overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Text Analysis</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Deep analysis of your content</p>
              </div>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin">
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-gray-900 dark:text-white font-medium">Analyzing content...</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">This may take a few moments</p>
                </div>
              </div>
            )}

            {!isProcessing && !analysis && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analysis Available</h3>
                <p className="text-gray-500 dark:text-gray-400">Enter text and run analysis to see results</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-6">
                {/* Overview Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200/50 dark:border-blue-700/50">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <EyeIcon />
                    <span className="ml-2">Overview</span>
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.overview}</p>
                </div>

                {/* Key Points Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Points</h3>
                  <div className="grid gap-3">
                    {analysis.keyPoints.map((point: string, index: number) => (
                      <div 
                        key={index}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700 dark:text-gray-300">{point}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Confidence', value: `${Math.round(analysis.confidence * 100)}%`, color: 'bg-green-500' },
                    { label: 'Complexity', value: analysis.complexity.toFixed(1), color: 'bg-orange-500' },
                    { label: 'Words', value: analysis.metadata.wordCount.toLocaleString(), color: 'bg-blue-500' },
                    { label: 'Read Time', value: `${analysis.metadata.readingTime}min`, color: 'bg-purple-500' },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                      <div className={`w-3 h-3 ${metric.color} rounded-full mb-2`}></div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern POML Generator Panel
const ModernPomlGenerator: React.FC = () => {
  const { generatedPoml, generatePoml, isProcessing } = usePomlStore();
  
  const handleGenerate = () => {
    generatePoml?.();
  };

  return (
    <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 h-full overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CogIcon />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">POML Generator</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Transform text into structured POML</p>
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate POML'
                )}
              </button>
            </div>

            {generatedPoml && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated POML</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {generatedPoml.length.toLocaleString()} characters
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (generatedPoml.length / 1000) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Status Bar
const ModernStatusBar: React.FC = () => {
  const { isProcessing, inputText, detectedSections, generatedPoml } = usePomlStore();
  
  const stats = [
    { label: 'Status', value: isProcessing ? 'Processing...' : 'Ready', color: isProcessing ? 'text-orange-500' : 'text-green-500' },
    { label: 'Characters', value: (inputText || '').length.toLocaleString(), color: 'text-blue-500' },
    { label: 'Sections', value: detectedSections.length.toString(), color: 'text-purple-500' },
    ...(generatedPoml ? [{ label: 'POML', value: `${generatedPoml.length.toLocaleString()} chars`, color: 'text-emerald-500' }] : []),
  ];
  
  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="px-6 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}:</span>
              <span className={`text-sm font-medium ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          POML Studio v1.0
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const { theme, generatedPoml, detectedSections, inputText, updateInputText } = usePomlStore();
  const [currentMode, setCurrentMode] = useState<DemoMode>('studio');
  const [activeTab, setActiveTab] = useState<'input' | 'analysis' | 'generator'>('input');
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'inspector'>('preview');

  const extractedSections = useMemo((): PomlSection[] => {
    return detectedSections.map((section, index) => ({
      id: section.id,
      type: section.type as any,
      content: section.content,
      startLine: index,
      endLine: index,
      confidence: section.confidence / 100
    }));
  }, [detectedSections]);

  const confidenceScores = useMemo(() => ({
    overview: 0.8,
    objective: 0.8,
    motivation: 0.8,
    learning: 0.8,
  }), []);

  const handleSectionUpdate = (sectionId: string, content: string) => {
    console.log('Update section:', sectionId, content);
  };

  const handleSectionReorder = (fromIndex: number, toIndex: number) => {
    console.log('Reorder sections:', fromIndex, toIndex);
  };

  if (currentMode === 'textAnalysis') {
    return (
      <div className={`min-h-screen ${theme}`}>
        <ModernHeader currentMode={currentMode} onModeChange={setCurrentMode} />
        <TextAnalysisDemo />
      </div>
    );
  }

  if (currentMode === 'pomlGenerator') {
    return (
      <div className={`min-h-screen ${theme}`}>
        <ModernHeader currentMode={currentMode} onModeChange={setCurrentMode} />
        <div className="p-6">
          <PomlGeneratorDemo />
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme}`}>
      <ModernHeader currentMode={currentMode} onModeChange={setCurrentMode} />
      
      {/* Main Content */}
      <div className="flex-1 flex bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Sidebar */}
        <ModernSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex">
          <Allotment defaultSizes={[1, 1]}>
            {/* Left Panel - Input/Analysis/Generator */}
            <Allotment.Pane minSize={400}>
              <div className="h-full">
                {activeTab === 'input' && (
                  <div className="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur">
                    <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Input Editor</h2>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Write your prompt here</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 h-full">
                      <TextInput 
                        value={inputText || ''}
                        onChange={updateInputText}
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'analysis' && <ModernAnalysisPanel />}
                {activeTab === 'generator' && <ModernPomlGenerator />}
              </div>
            </Allotment.Pane>

            {/* Right Panel - Preview/Inspector */}
            <Allotment.Pane minSize={400}>
              <div className="h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur border-b border-gray-200/50 dark:border-gray-700/50 p-4">
                  <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-xl p-1">
                    <button
                      onClick={() => setRightPanelTab('preview')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        rightPanelTab === 'preview'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <EyeIcon />
                        <span>Preview</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setRightPanelTab('inspector')}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        rightPanelTab === 'inspector'
                          ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <SearchIcon />
                        <span>Inspector</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {rightPanelTab === 'preview' && (
                    <div className="h-full">
                      <PomlPreview 
                        pomlContent={generatedPoml || ''} 
                        isValid={true} 
                        validationErrors={[]} 
                      />
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
        </div>
      </div>
      
      <ModernStatusBar />
    </div>
  );
};

export default App;
