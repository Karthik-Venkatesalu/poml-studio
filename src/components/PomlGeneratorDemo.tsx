/**
 * POML Generator Demo - Interactive component showcasing POML generation capabilities
 */

import React, { useState } from 'react';
import { useParser, useGenerator, usePomlStore } from '../hooks';

interface GeneratorDemoProps {
  className?: string;
}

export const PomlGeneratorDemo: React.FC<GeneratorDemoProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'templates'>('generator');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    includeComments: false,
    includeConfidence: true,
    formatOutput: true,
    includeMetadata: false
  });

  const { detectedSections } = usePomlStore();
  const { analyzeText } = useParser();
  const { 
    generatePoml, 
    generateFromTemplate,
    getTemplates,
    isGenerating, 
    lastResult, 
    error,
    generatedPoml,
    metadata
  } = useGenerator();

  const templates = getTemplates();

  const handleGenerateFromSections = async () => {
    if (detectedSections.length === 0) {
      alert('No sections detected. Please analyze some text first.');
      return;
    }
    
    await generatePoml(detectedSections, generationOptions);
  };

  const handleGenerateFromTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    await generateFromTemplate(template, generationOptions);
  };

  const handleSampleText = async (text: string) => {
    await analyzeText(text);
  };

  const samplePrompts = [
    {
      name: 'Code Review Assistant',
      text: `You are a senior software engineer with extensive experience in code reviews and best practices.

Your task is to review the provided code and give constructive feedback focusing on:
- Code quality and readability
- Performance optimizations 
- Security considerations
- Best practices adherence

Constraints:
- Be specific and actionable in your suggestions
- Provide examples when possible
- Focus on the most important issues first
- Maintain a constructive and professional tone

Example:
Input: JavaScript function with nested loops
Output: Detailed review with specific suggestions for optimization and readability improvements

Please respond in markdown format with clear sections for each type of feedback.`
    },
    {
      name: 'Creative Writing Assistant',
      text: `You are a creative writing coach and published author with expertise in storytelling and narrative techniques.

Your task is to help users improve their creative writing by providing feedback, suggestions, and guidance on their stories, poems, or other creative works.

Please follow these guidelines:
- Encourage creativity while providing constructive feedback
- Focus on character development, plot structure, and writing style
- Suggest specific improvements rather than general comments
- Be supportive and motivating

For example, when reviewing a short story, provide feedback on pacing, dialogue effectiveness, and character motivation with specific examples from the text.

Always format your response with clear sections for different aspects of the writing.`
    },
    {
      name: 'Technical Documentation Writer',
      text: `Act as a technical documentation specialist with expertise in creating clear, comprehensive, and user-friendly documentation.

Transform complex technical information into accessible documentation that serves both beginners and advanced users.

Requirements:
- Use clear, concise language
- Include practical examples and code snippets
- Structure information logically with proper headings
- Anticipate user questions and provide answers

Example input: API endpoint description
Example output: Complete documentation section with usage examples, parameter descriptions, and response formats

Output format: Structured markdown with code blocks, tables, and clear hierarchy.`
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('generator')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generator'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            POML Generator
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Templates
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Sample Prompts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Try Sample Prompts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {samplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleText(prompt.text)}
                    className="p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {prompt.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {prompt.text.substring(0, 150)}...
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Options */}
            <div>
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-4"
              >
                Advanced Options
                <svg
                  className={`ml-2 h-4 w-4 transform transition-transform ${
                    showAdvancedOptions ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvancedOptions && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generationOptions.includeComments}
                      onChange={(e) => setGenerationOptions(prev => ({
                        ...prev,
                        includeComments: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Include Comments</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generationOptions.includeConfidence}
                      onChange={(e) => setGenerationOptions(prev => ({
                        ...prev,
                        includeConfidence: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Include Confidence</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generationOptions.formatOutput}
                      onChange={(e) => setGenerationOptions(prev => ({
                        ...prev,
                        formatOutput: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Format Output</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generationOptions.includeMetadata}
                      onChange={(e) => setGenerationOptions(prev => ({
                        ...prev,
                        includeMetadata: e.target.checked
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Include Metadata</span>
                  </label>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateFromSections}
                disabled={isGenerating || detectedSections.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate POML'}
              </button>

              {detectedSections.length > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {detectedSections.length} sections detected
                </span>
              )}
            </div>

            {/* Results */}
            {lastResult && (
              <div className="space-y-4">
                {metadata && (
                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <span>Sections: {metadata.sectionsProcessed}</span>
                    <span>Avg Confidence: {Math.round(metadata.averageConfidence)}%</span>
                    <span>Generation Time: {Math.round(metadata.generationTime)}ms</span>
                  </div>
                )}

                {generatedPoml && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Generated POML
                    </h4>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{generatedPoml}</code>
                    </pre>
                  </div>
                )}

                {metadata && metadata.warnings.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                      Warnings
                    </h4>
                    <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400">
                      {metadata.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Predefined Templates
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Generate POML from predefined templates for common use cases.
              </p>
            </div>

            <div className="grid gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {template.description}
                      </p>
                      <div className="space-y-2">
                        {template.structure.map((section, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              {section.type}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400 truncate">
                              {section.content.substring(0, 100)}...
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleGenerateFromTemplate(template.id)}
                      disabled={isGenerating}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
