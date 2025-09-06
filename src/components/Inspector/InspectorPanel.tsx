import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { PomlSection } from '../../types/poml.types';

interface InspectorPanelProps {
  poml: string;
  sections: PomlSection[];
  confidenceScores: Record<string, number>;
  onSectionUpdate?: (sectionId: string, content: string) => void;
  onSectionReorder?: (fromIndex: number, toIndex: number) => void;
}

interface ExpandedSections {
  [key: string]: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  poml,
  sections,
  confidenceScores,
  onSectionUpdate,
  onSectionReorder
}) => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Parse sections from POML
  const parsedSections = useMemo(() => {
    if (sections.length > 0) return sections;
    
    // Fallback: extract sections from POML string
    const lines = poml.split('\n');
    const extractedSections: PomlSection[] = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<?')) {
        const tagMatch = trimmed.match(/<(\w+)[^>]*>/);
        if (tagMatch) {
          const sectionType = tagMatch[1];
          extractedSections.push({
            id: `section-${index}`,
            type: sectionType as any,
            content: trimmed,
            startLine: index,
            endLine: index,
            confidence: confidenceScores[sectionType] || 0.8
          });
        }
      }
    });
    
    return extractedSections;
  }, [poml, sections, confidenceScores]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const startEditing = (sectionId: string, content: string) => {
    setEditingSections(prev => ({ ...prev, [sectionId]: true }));
    setEditingContent(prev => ({ ...prev, [sectionId]: content }));
  };

  const saveSection = (sectionId: string) => {
    const content = editingContent[sectionId];
    if (content && onSectionUpdate) {
      onSectionUpdate(sectionId, content);
    }
    setEditingSections(prev => ({ ...prev, [sectionId]: false }));
    setEditingContent(prev => {
      const { [sectionId]: _, ...rest } = prev;
      return rest;
    });
  };

  const cancelEditing = (sectionId: string) => {
    setEditingSections(prev => ({ ...prev, [sectionId]: false }));
    setEditingContent(prev => {
      const { [sectionId]: _, ...rest } = prev;
      return rest;
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence < 0.6) {
      return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
    return null;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onSectionReorder) {
      onSectionReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (parsedSections.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>No POML sections to inspect</p>
        <p className="text-sm mt-2">Generate POML first to see section details</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white dark:bg-gray-900">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          POML Inspector
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {parsedSections.length} sections detected
        </p>
      </div>

      <div className="space-y-2 p-2">
        {parsedSections.map((section, index) => {
          const isExpanded = expandedSections[section.id];
          const isEditing = editingSections[section.id];
          const confidence = section.confidence || 0.8;
          const isDragging = draggedIndex === index;

          return (
            <div
              key={section.id}
              className={`border rounded-lg ${
                isDragging ? 'opacity-50' : ''
              } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="p-3">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {section.type}
                      </span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getConfidenceColor(confidence)}`}>
                        {getConfidenceIcon(confidence)}
                        <span>{Math.round(confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(section.id, section.content)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="mt-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingContent[section.id] || ''}
                          onChange={(e) =>
                            setEditingContent(prev => ({
                              ...prev,
                              [section.id]: e.target.value
                            }))
                          }
                          className="w-full h-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Edit section content..."
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSection(section.id)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => cancelEditing(section.id)}
                            className="px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                        <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-all">
                          {section.content}
                        </pre>
                        {section.startLine !== undefined && (
                          <div className="mt-2 text-xs text-gray-500">
                            Lines {section.startLine + 1}
                            {section.endLine !== undefined && section.endLine !== section.startLine && ` - ${section.endLine + 1}`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InspectorPanel;
