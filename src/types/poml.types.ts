export interface PomlSection {
  id: string;
  type: 'overview' | 'objective' | 'motivation' | 'learning' | 'custom';
  content: string;
  startLine?: number;
  endLine?: number;
  confidence: number;
}

export interface PomlGenerationResult {
  poml: string;
  confidence: number;
  sections: string[];
  metadata: {
    generatedAt: string;
    version: string;
    wordCount: number;
    sectionCount: number;
  };
}

export interface PomlComponent {
  tag: string;
  attributes?: Record<string, string>;
  content: string | PomlComponent[];
  id?: string;
}

export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface PomlTemplate {
  id: string;
  name: string;
  description: string;
  structure: TemplateComponent[];
  useCase: string;
  category: string;
}

export interface TemplateComponent {
  type: 'role' | 'task' | 'constraints' | 'examples' | 'outputFormat';
  placeholder: string;
  required: boolean;
  defaultContent?: string;
}

export interface Enhancement {
  id: string;
  label: string;
  description: string;
  category: string;
  apply: (currentPoml: string) => string;
}
