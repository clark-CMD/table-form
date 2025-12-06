import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { parseMarkdownTable } from './utils/parser';
import { PreviewArea } from './components/PreviewArea';

const DEFAULT_INPUT = `| 元素 | C/% | Si/% | Mn/% | P/% | S/% | Fe/% |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 炼钢生铁 | 4.1 | 0.50 | 0.61 | 0.117 | 0.04 | 94.633 |
| 碳素废钢 | 0.18 | 0.25 | 0.55 | 0.03 | 0.03 | 98.96 |`;

export default function App() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const previewRef = useRef<HTMLDivElement>(null);
  const [parsedData, setParsedData] = useState(() => parseMarkdownTable(DEFAULT_INPUT));
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyImageStatus, setCopyImageStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setParsedData(parseMarkdownTable(input));
  }, [input]);

  const handleCopyForWord = async () => {
    if (!previewRef.current) return;
    
    try {
      // We grab the HTML content directly. 
      // This preserves the inline styles we meticulously applied in PreviewArea.tsx
      const htmlContent = previewRef.current.innerHTML;
      
      const blobHtml = new Blob([htmlContent], { type: 'text/html' });
      const blobText = new Blob([previewRef.current.innerText], { type: 'text/plain' });
      
      const data = [
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ];

      await navigator.clipboard.write(data);
      
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleCopyImage = async () => {
    if (!previewRef.current) return;

    setCopyImageStatus('loading');
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Retina quality
        backgroundColor: '#ffffff', // Ensure white background
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCopyImageStatus('error');
          setTimeout(() => setCopyImageStatus('idle'), 2000);
          return;
        }
        
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          setCopyImageStatus('success');
          setTimeout(() => setCopyImageStatus('idle'), 2000);
        } catch (err) {
          console.error("Failed to write image to clipboard", err);
          setCopyImageStatus('error');
          setTimeout(() => setCopyImageStatus('idle'), 2000);
        }
      }, 'image/png');
      
    } catch (err) {
      console.error("Failed to generate image for clipboard", err);
      setCopyImageStatus('error');
      setTimeout(() => setCopyImageStatus('idle'), 2000);
    }
  };

  const handleExportPng = async () => {
    if (!previewRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, // Retina quality
        backgroundColor: '#ffffff', // Ensure white background
      });
      
      const link = document.createElement('a');
      link.download = 'academic-table.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
      alert("Failed to export image.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <i className="fa-solid fa-table-cells text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-900">SciTable Converter</h1>
          </div>
          <div className="flex items-center space-x-4">
             <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Documentation</a>
             <a href="#" className="text-sm text-gray-500 hover:text-gray-900">About</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] min-h-[500px]">
          
          {/* Left Column: Input */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Markdown Input
              </label>
              <span className="text-xs text-gray-400">Paste your table below</span>
            </div>
            <textarea
              className="flex-1 w-full p-4 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm resize-none bg-white"
              placeholder="| Header 1 | Header 2 |\n|---|---|\n| Data 1 | Data 2 |"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Preview (Three-Line Style)
              </label>
              
              <div className="flex flex-wrap gap-2">
                {/* Copy for Word */}
                <button
                  onClick={handleCopyForWord}
                  disabled={!parsedData.isValid}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    copyStatus === 'success'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                  title="Copy formatted table for Word"
                >
                  {copyStatus === 'success' ? (
                    <>
                      <i className="fa-solid fa-check"></i> Copied
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-file-word"></i> Copy HTML
                    </>
                  )}
                </button>

                {/* Copy Image */}
                <button
                  onClick={handleCopyImage}
                  disabled={!parsedData.isValid || copyImageStatus === 'loading'}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    copyImageStatus === 'success'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                  title="Copy formatted table image to clipboard"
                >
                  {copyImageStatus === 'loading' ? (
                     <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : copyImageStatus === 'success' ? (
                    <>
                      <i className="fa-solid fa-check"></i> Copied
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy"></i> Copy Image
                    </>
                  )}
                </button>

                {/* Export PNG */}
                <button
                  onClick={handleExportPng}
                  disabled={!parsedData.isValid || isExporting}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  title="Download as PNG file"
                >
                  {isExporting ? (
                     <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-regular fa-image"></i>
                  )}
                  Export PNG
                </button>
              </div>
            </div>

            {/* Preview Container */}
            <PreviewArea ref={previewRef} data={parsedData} />
            
            <p className="text-xs text-gray-400 text-center">
              *The preview above renders the exact borders used for Word copy & Image export.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}