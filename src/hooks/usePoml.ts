import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  DetectedSection, 
  ValidationError, 
  ParseError,
  PomlTemplate,
  UserSettings 
} from '../types';
import { DEFAULT_SETTINGS } from '../utils';

interface PomlStoreState extends AppState {
  // Actions
  updateInputText: (text: string) => void;
  setDetectedSections: (sections: DetectedSection[]) => void;
  setProcessing: (processing: boolean) => void;
  setParsingErrors: (errors: ParseError[]) => void;
  setGeneratedPoml: (poml: string) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setIsValid: (valid: boolean) => void;
  setSelectedTemplate: (template: PomlTemplate | undefined) => void;
  toggleInspectorPanel: () => void;
  setActiveTab: (tab: 'preview' | 'raw' | 'errors') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetState: () => void;
}

const initialState: AppState = {
  inputText: '',
  detectedSections: [],
  isProcessing: false,
  parsingErrors: [],
  generatedPoml: '',
  validationErrors: [],
  isValid: true,
  selectedTemplate: undefined,
  inspectorPanelOpen: true,
  activeTab: 'preview',
  theme: 'dark',
  settings: DEFAULT_SETTINGS,
};

export const usePomlStore = create<PomlStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      // Actions
      updateInputText: (text: string) => 
        set({ inputText: text }),

      setDetectedSections: (sections: DetectedSection[]) => 
        set({ detectedSections: sections }),

      setProcessing: (processing: boolean) => 
        set({ isProcessing: processing }),

      setParsingErrors: (errors: ParseError[]) => 
        set({ parsingErrors: errors }),

      setGeneratedPoml: (poml: string) => 
        set({ generatedPoml: poml }),

      setValidationErrors: (errors: ValidationError[]) => 
        set({ validationErrors: errors }),

      setIsValid: (valid: boolean) => 
        set({ isValid: valid }),

      setSelectedTemplate: (template: PomlTemplate | undefined) => 
        set({ selectedTemplate: template }),

      toggleInspectorPanel: () => 
        set((state) => ({ inspectorPanelOpen: !state.inspectorPanelOpen })),

      setActiveTab: (tab: 'preview' | 'raw' | 'errors') => 
        set({ activeTab: tab }),

      setTheme: (theme: 'light' | 'dark') => 
        set({ theme }),

      updateSettings: (newSettings: Partial<UserSettings>) => 
        set((state) => ({ 
          settings: { ...state.settings, ...newSettings } 
        })),

      resetState: () => 
        set(initialState),
    }),
    {
      name: 'poml-studio-store',
      partialize: (state) => ({
        // Only persist user settings and UI preferences
        theme: state.theme,
        settings: state.settings,
        inspectorPanelOpen: state.inspectorPanelOpen,
        activeTab: state.activeTab,
      }),
    }
  )
);
