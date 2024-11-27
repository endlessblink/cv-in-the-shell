# Troubleshooting Guide

## PDF.js Worker Configuration

### Issue: PDF Worker Loading Failure
Error message: "Setting up fake worker failed: 'Cannot load script at http://cdnjs.cloudflare.com/ajax/libs/pdf.js/{version}/pdf.worker.min.js'"

### Solution:
1. Copy PDF.js worker file to public directory:
```bash
xcopy /Y node_modules\pdfjs-dist\build\pdf.worker.min.js public\pdf.worker.min.js*
```

2. Update CVUploader.tsx:
```typescript
import { pdfjs } from 'react-pdf';

// Initialize PDF.js worker with local file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
```

3. Configure Vite (vite.config.ts):
```typescript
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        worker-src 'self' blob:;
        connect-src 'self' [other-domains] ws://localhost:8080;
        img-src 'self' data: blob:;
        style-src 'self' 'unsafe-inline';
        font-src 'self';
        frame-src 'self' [other-domains];
      `
    }
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer', 'react-pdf', 'pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      include: [/@react-pdf\/renderer/, /react-pdf/, /pdfjs-dist/]
    }
  }
});
```

### Key Points:
- Use local worker file instead of CDN
- Configure CSP headers to allow worker scripts
- Include PDF-related dependencies in Vite optimization
- Keep worker file in public directory for direct access

### Dependencies:
```json
{
  "dependencies": {
    "react-pdf": "7.7.1",
    "pdfjs-dist": "3.11.174"
  }
}
```

Make sure versions are pinned exactly as shown to maintain compatibility.

## CV Preview and Processing Issues

### Issue: CV Content Truncation and Cross-Origin Errors
Error messages:
1. "Failed to execute 'postMessage' on 'DOMWindow': The target origin provided does not match the recipient window's origin"
2. "Error: 400 max_tokens: 8000 > 4096, which is the maximum allowed number of output tokens"
3. Content being truncated or modified during processing

### Solution:

1. Update Vite Configuration (vite.config.ts):
```typescript
export default defineConfig({
  server: {
    port: 5173,
    host: true,
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000', 'https://gptengineer.app', 'https://lovable.dev'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  },
  plugins: [
    react()
  ]
});
```

2. Adjust AI Service Token Limits (aiService.ts):
```typescript
// For OpenAI
response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  temperature: 0,
  max_tokens: 4000  // Reduced from 8000
});

// For Anthropic
response = await anthropic.messages.create({
  model: "claude-2.1",
  max_tokens: 4000,  // Reduced from 8000
  messages: [...]
});
```

3. Simplify System Prompt:
```typescript
const systemPrompt = `Process this CV text while maintaining ALL original content and formatting. Do not truncate or modify any information.`;
```

4. Remove Component Tagger:
- Remove `lovable-tagger` from dependencies
- Remove `componentTagger` from Vite plugins

### Key Points:
- Keep token limits within provider maximums (4000 for both OpenAI and Claude)
- Configure proper CORS settings for development
- Use simplified system prompts
- Remove unnecessary development plugins that cause cross-origin issues

### Dependencies:
```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.4.3"
  }
}
```

Make sure your API keys are properly configured in the settings before processing CVs.

## PDF Generation Issues
If you encounter issues with PDF generation using @react-pdf/renderer (WebAssembly errors, CSP issues), here's the solution:

1. Replace @react-pdf/renderer with jsPDF:
```bash
npm uninstall @react-pdf/renderer
npm install jspdf
```

2. Update your component to use jsPDF:
```typescript
import { jsPDF } from 'jspdf';

const handlePdfDownload = () => {
  const doc = new jsPDF();
  // Configure PDF settings
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  
  // Add content with proper formatting
  let yPosition = 20;
  const margin = 20;
  const lineHeight = 7;
  
  // Handle page breaks
  if (yPosition > 280) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Save the PDF
  doc.save('filename.pdf');
};
```

3. Simplify your vite.config.ts:
```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    cors: true
  },
  // ... other config
});
```

Benefits of this approach:
- No WebAssembly dependencies
- No CSP issues
- Simpler configuration
- Better cross-browser compatibility
- Faster PDF generation

## Content Security Policy (CSP) Issues
If you encounter CSP-related errors:

1. First try simplifying your CSP configuration
2. If issues persist, consider removing CSP headers and using basic CORS settings
3. For PDF generation specifically, use jsPDF instead of WebAssembly-based solutions

## Cross-Origin Communication
If you see postMessage errors:

1. Ensure your CORS settings match your deployment environment
2. For local development, use simple CORS configuration:
```typescript
server: {
  cors: true
}
```

## API Integration Issues
When working with AI APIs:

1. Keep API keys in a secure location (e.g., environment variables)
2. Handle API responses properly with type checking
3. Implement proper error handling for failed requests
4. Consider rate limiting for production deployments

## General Tips
1. Keep dependencies minimal and simple
2. Use proven libraries for critical functionality
3. Implement proper error boundaries in React components
4. Add detailed logging for debugging
5. Consider fallback mechanisms for critical features
