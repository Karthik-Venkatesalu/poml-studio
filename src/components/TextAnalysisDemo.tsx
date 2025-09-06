/**
 * Text Analysis Demo - Component to test and demonstrate the Text Analysis Engine
 * This shows the parser in action with real examples
 */

import React, { useState } from 'react';
import { useParser } from '../hooks/useParser';
import type { DetectedSection } from '../types';

const samplePrompts = {
  dataAnalyst: `You are a senior data analyst with expertise in statistical analysis and data visualization.

Your task is to analyze the provided dataset and identify key trends, patterns, and insights that could inform business decisions.

Please ensure you:
- Don't include personal opinions in your analysis
- Use only the data provided, don't make assumptions
- Keep your analysis under 500 words
- Focus on actionable insights

For example, if analyzing sales data, look for seasonal patterns, top-performing products, and growth trends.

Present your findings in JSON format with the following structure:
{
  "summary": "Brief overview",
  "key_insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"]
}`,

  creativeWriter: `Act as a creative writing assistant specialized in short fiction.

Write a compelling short story based on the theme I provide. The story should be engaging and well-structured.

Constraints:
- Keep the story between 300-500 words
- Use vivid imagery and strong character development
- Avoid clichéd endings
- Make it suitable for all ages

Example themes might include: "a forgotten door", "the last bookstore", or "messages in bottles".

Format your response as a complete story with a clear beginning, middle, and end.`,

  codeReview: `You are an experienced software engineer conducting a code review.

Please review the code I provide and offer constructive feedback on code quality, best practices, and potential improvements.

Your review should cover:
- Code structure and organization
- Performance considerations  
- Security concerns if any
- Adherence to best practices

Don't just point out problems - suggest specific improvements.

Provide your feedback in markdown format with sections for different aspects of the review.`
};

export const TextAnalysisDemo: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<keyof typeof samplePrompts>('dataAnalyst');
  const [customText, setCustomText] = useState('');
  const [useCustomText, setUseCustomText] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<DetectedSection[]>([]);
  
  const { analyzeText, isAnalyzing, lastAnalysis, analysisStats } = useParser();

  const handleAnalyze = async () => {
    const textToAnalyze = useCustomText ? customText : samplePrompts[selectedPrompt];
    if (!textToAnalyze.trim()) return;

    const results = await analyzeText(textToAnalyze);
    setAnalysisResults(results);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSectionTypeColor = (type: string) => {
    const colors = {
      role: 'bg-blue-100 text-blue-800',
      task: 'bg-green-100 text-green-800',
      constraints: 'bg-yellow-100 text-yellow-800',
      examples: 'bg-purple-100 text-purple-800',
      outputFormat: 'bg-pink-100 text-pink-800',
      unknown: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.unknown;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Text Analysis Engine Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Test the intelligent section detection capabilities of the POML Studio parser.
        </p>

        {/* Input Selection */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={!useCustomText}
                onChange={() => setUseCustomText(false)}
                className="mr-2"
              />
              Use Sample Prompts
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={useCustomText}
                onChange={() => setUseCustomText(true)}
                className="mr-2"
              />
              Custom Text
            </label>
          </div>

          {!useCustomText && (
            <select
              value={selectedPrompt}
              onChange={(e) => setSelectedPrompt(e.target.value as keyof typeof samplePrompts)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="dataAnalyst">Data Analyst Prompt</option>
              <option value="creativeWriter">Creative Writer Prompt</option>
              <option value="codeReview">Code Review Prompt</option>
            </select>
          )}

          {useCustomText && (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter your custom text to analyze..."
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
            />
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </div>

      {/* Analysis Results */}
      {lastAnalysis && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
          
          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{lastAnalysis.sections.length}</div>
              <div className="text-sm text-gray-600">Sections Detected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{lastAnalysis.confidence}%</div>
              <div className="text-sm text-gray-600">Overall Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{lastAnalysis.processingTime.toFixed(1)}ms</div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analysisStats.totalAnalyses}</div>
              <div className="text-sm text-gray-600">Total Analyses</div>
            </div>
          </div>

          {/* Detected Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Detected Sections</h3>
            {analysisResults.length === 0 ? (
              <p className="text-gray-500 italic">No sections detected</p>
            ) : (
              analysisResults.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSectionTypeColor(section.type)}`}>
                        {section.type}
                      </span>
                      <span className={`font-semibold ${getConfidenceColor(section.confidence)}`}>
                        {section.confidence}% confidence
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Position: {section.startIndex}-{section.endIndex}
                    </span>
                  </div>
                  <div className="text-gray-700 bg-gray-50 p-3 rounded">
                    {section.content}
                  </div>
                  {section.patterns && section.patterns.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Matched patterns: {section.patterns.join(', ')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Source Text Preview */}
      {!useCustomText && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Source Text</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded border">
            {samplePrompts[selectedPrompt]}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TextAnalysisDemo;
