import type { DetectedSection, ParseError } from './parser.types';
import type { PomlTemplate, ValidationError } from './poml.types';

export interface AppState {
  // Input and parsing
  inputText: string;
  detectedSections: DetectedSection[];
  isProcessing: boolean;
  parsingErrors: ParseError[];
  
  // Generated POML
  generatedPoml: string;
  validationErrors: ValidationError[];
  isValid: boolean;
  
  // UI state
  selectedTemplate?: PomlTemplate;
  inspectorPanelOpen: boolean;
  activeTab: 'preview' | 'raw' | 'errors';
  theme: 'light' | 'dark';
  
  // User preferences
  settings: UserSettings;
}

export interface UserSettings {
  autoSave: boolean;
  parsingSensitivity: number;
  theme: 'light' | 'dark';
  editorFontSize: number;
  showLineNumbers: boolean;
  enableLinting: boolean;
}

export interface SavedProject {
  id: string;
  name: string;
  originalText: string;
  generatedPoml: string;
  detectedSections: DetectedSection[];
  lastModified: Date;
  settings: UserSettings;
}

export type ExportFormat = 'poml' | 'txt' | 'json' | 'html';
