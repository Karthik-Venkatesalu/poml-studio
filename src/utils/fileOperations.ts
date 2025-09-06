import { saveAs } from 'file-saver';
import type { SavedProject, ExportFormat } from '../types';

/**
 * Save content as a file with the specified name and extension
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, filename);
}

/**
 * Export a project in the specified format
 */
export function exportProject(project: SavedProject, format: ExportFormat): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseName = project.name.replace(/[^a-zA-Z0-9]/g, '_');

  switch (format) {
    case 'poml':
      downloadFile(
        project.generatedPoml,
        `${baseName}_${timestamp}.poml`,
        'application/xml'
      );
      break;

    case 'txt':
      downloadFile(
        project.originalText,
        `${baseName}_${timestamp}.txt`,
        'text/plain'
      );
      break;

    case 'json':
      const jsonData = {
        name: project.name,
        originalText: project.originalText,
        generatedPoml: project.generatedPoml,
        sections: project.detectedSections,
        lastModified: project.lastModified,
      };
      downloadFile(
        JSON.stringify(jsonData, null, 2),
        `${baseName}_${timestamp}.json`,
        'application/json'
      );
      break;

    case 'html':
      const htmlContent = generateHtmlPreview(project);
      downloadFile(
        htmlContent,
        `${baseName}_${timestamp}.html`,
        'text/html'
      );
      break;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate HTML preview of a project
 */
function generateHtmlPreview(project: SavedProject): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POML Studio Export - ${project.name}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            background-color: #f9fafb;
        }
        .section-title {
            color: #374151;
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .code {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            font-family: 'Monaco', 'Consolas', monospace;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        .text-content {
            background-color: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }
        .meta {
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>POML Studio Export</h1>
        <h2>${project.name}</h2>
        <p class="meta">Exported on ${new Date().toLocaleString()}</p>
        <p class="meta">Last modified: ${new Date(project.lastModified).toLocaleString()}</p>
    </div>

    <div class="section">
        <h3 class="section-title">Original Text</h3>
        <div class="text-content">${project.originalText.replace(/\n/g, '<br>')}</div>
    </div>

    <div class="section">
        <h3 class="section-title">Generated POML</h3>
        <div class="code">${escapeHtml(project.generatedPoml)}</div>
    </div>

    <div class="section">
        <h3 class="section-title">Detected Sections</h3>
        ${project.detectedSections.map(section => `
            <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px;">
                <strong>${section.type.toUpperCase()}</strong> 
                <span class="meta">(Confidence: ${section.confidence.toFixed(1)}%)</span>
                <div style="margin-top: 8px;">${section.content.replace(/\n/g, '<br>')}</div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Read a file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension);
}
