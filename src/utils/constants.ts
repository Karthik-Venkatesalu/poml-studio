// POML-related constants
export const POML_COMPONENTS = {
  ROLE: 'role',
  TASK: 'task',
  CONSTRAINTS: 'constraints',
  EXAMPLES: 'examples',
  OUTPUT_FORMAT: 'outputFormat',
  HINT: 'hint',
  QUESTION: 'qa',
} as const;

export const POML_TAGS = {
  ROLE: '<role>',
  TASK: '<task>',
  OUTPUT_FORMAT: '<output-format>',
  EXAMPLES: '<examples>',
  EXAMPLE: '<example>',
  INPUT: '<input>',
  OUTPUT: '<output>',
  CAPTIONED_PARAGRAPH: '<cp>',
  LIST: '<list>',
  ITEM: '<item>',
  PARAGRAPH: '<p>',
  HEADER: '<h>',
} as const;

// Pattern detection constants
export const ROLE_PATTERNS = [
  /you are\s+/gi,
  /act as\s+/gi,
  /assume.*role/gi,
  /as a\s+\w+/gi,
  /take on the persona of/gi,
  /your role is/gi,
] as const;

export const TASK_PATTERNS = [
  /analyze/gi,
  /create/gi,
  /generate/gi,
  /write/gi,
  /develop/gi,
  /design/gi,
  /your task is/gi,
  /please/gi,
  /i need you to/gi,
] as const;

export const CONSTRAINT_PATTERNS = [
  /don't/gi,
  /avoid/gi,
  /must not/gi,
  /never/gi,
  /within.*words/gi,
  /no more than/gi,
  /maximum/gi,
  /only use/gi,
  /stick to/gi,
  /ensure that/gi,
] as const;

export const EXAMPLE_PATTERNS = [
  /for example/gi,
  /example:/gi,
  /such as/gi,
  /input:/gi,
  /output:/gi,
  /q:/gi,
  /a:/gi,
  /example \d+/gi,
  /first example/gi,
] as const;

export const FORMAT_PATTERNS = [
  /json/gi,
  /xml/gi,
  /csv/gi,
  /markdown/gi,
  /bullet points/gi,
  /numbered list/gi,
  /table format/gi,
  /concise/gi,
  /detailed/gi,
  /step-by-step/gi,
] as const;

// UI Constants
export const DEFAULT_SETTINGS = {
  autoSave: true,
  parsingSensitivity: 70,
  theme: 'dark' as const,
  editorFontSize: 14,
  showLineNumbers: true,
  enableLinting: true,
};

export const PARSING_CONFIG = {
  MIN_CONFIDENCE: 0.3,
  DEFAULT_SENSITIVITY: 70,
  DEBOUNCE_DELAY: 500,
  MAX_TEXT_LENGTH: 50000,
};

export const UI_CONFIG = {
  PANEL_MIN_WIDTH: 300,
  PANEL_MAX_WIDTH: -300,
  DEFAULT_SPLIT_SIZES: [40, 60],
};
