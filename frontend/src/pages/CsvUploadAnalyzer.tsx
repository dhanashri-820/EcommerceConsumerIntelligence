import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  Printer, 
  Trash2, 
  BarChart3, 
  Copy, 
  HelpCircle,
  Loader2,
  Table
} from 'lucide-react';
import { 
  uploadCsvFile, 
  analyzeUploadedCsv, 
  CsvUploadResponse, 
  CsvBatchAnalysisResponse, 
  exportToCsv, 
  triggerPrintReport 
} from '../services/api';
import { SentimentBadge } from '../components/SentimentBadge';

export const CsvUploadAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<CsvUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CsvBatchAnalysisResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [sampleLimit, setSampleLimit] = useState<number>(30);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setUploadError(null);
    setUploadResult(null);
    setAnalysisResult(null);
    setAnalysisError(null);

    // Client-side quick check
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only CSV files (.csv) are supported. Please select a valid CSV.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5 MB limit. Please select a smaller CSV file.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadCsvFile(file);
      setUploadResult(res);
    } catch (err: any) {
      setUploadError(err.message || 'CSV file validation failed on the server.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunBatchAnalysis = async () => {
    if (!uploadResult) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await analyzeUploadedCsv(uploadResult.file_id, sampleLimit);
      setAnalysisResult(res);
    } catch (err: any) {
      setAnalysisError(err.message || 'Batch ML analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportBatchCsv = () => {
    if (!analysisResult?.results) return;
    const flatRows = analysisResult.results.map((r) => ({
      'Row': r.row_index,
      'Review Text': r.review,
      'Predicted Sentiment': r.sentiment,
      'Confidence': `${(r.confidence * 100).toFixed(1)}%`,
      'Category': r.category,
      'Rating': r.rating || 'N/A',
      'Aspects': Object.keys(r.aspects).join(', ')
    }));
    exportToCsv(`batch_analysis_${uploadResult?.filename || 'dataset'}.csv`, flatRows);
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setAnalysisResult(null);
    setUploadError(null);
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Batch Intelligence
            </span>
            <span className="text-xs text-slate-500">Max 5 MB &bull; 1,000 Rows Limit</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Review Dataset CSV Upload & Batch Analyzer</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload custom Amazon review spreadsheets for automated server-side schema validation, duplicate detection, and batch sentiment inference.
          </p>
        </div>

        {analysisResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerPrintReport('CSV Batch Analysis Report')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportBatchCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Results CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* Upload Zone */}
      {!uploadResult ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/20"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv"
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <UploadCloud className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">
              {file ? file.name : 'Choose a CSV file or drag & drop here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Must contain a review text column (e.g. <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">review</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">text</code>). Optional columns: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">rating</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">category</code>, <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">asin</code>.
            </p>
            {file && (
              <p className="text-xs font-semibold text-indigo-600 mt-3">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Validation Error Message */}
          {uploadError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">File Validation Error</p>
                <p className="mt-0.5">{uploadError}</p>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Supported format: Standard CSV with UTF-8 encoding</span>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating CSV Structure...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Validate Dataset</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Validation Success & Dataset Preview */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">{uploadResult.filename}</h3>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Validated Successfully
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Detected Review Column: <strong className="text-indigo-600 font-mono">{uploadResult.detected_columns.review_column}</strong> &bull; Total Rows: <strong>{uploadResult.total_rows}</strong> &bull; Valid: <strong>{uploadResult.valid_rows_count}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Upload Different File</span>
              </button>
            </div>
          </div>

          {/* Duplicates Banner */}
          {uploadResult.duplicates_count > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-600" />
                <span>
                  <strong>Duplicate Detection:</strong> Found {uploadResult.duplicates_count} duplicated review texts. Only unique entries will be prioritized during batch analysis.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span><strong>Duplicate Check:</strong> 100% of reviews are unique. No repeated texts detected.</span>
            </div>
          )}

          {/* Dataset Preview Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-indigo-600" />
              Dataset Sample Preview (First 5 Rows)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Review Text</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">ASIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uploadResult.preview.map((p) => (
                    <tr key={p.row_index} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{p.row_index}</td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-md truncate">{p.review}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.rating ? `${p.rating} ★` : '—'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category || 'General'}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{p.asin || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Batch Trigger Section */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold">Batch Sample Limit:</span>
              <select
                value={sampleLimit}
                onChange={(e) => setSampleLimit(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value={15}>15 Reviews (Fastest)</option>
                <option value={30}>30 Reviews (Recommended)</option>
                <option value={50}>50 Reviews (Standard)</option>
                <option value={100}>100 Reviews (Comprehensive)</option>
              </select>
            </div>

            <button
              onClick={handleRunBatchAnalysis}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Running DistilBERT Inference...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Batch ML Sentiment Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Batch Inference Analytics</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated {analysisResult.summary.total_analyzed} reviews with DistilBERT three-class classification.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {analysisResult.summary.positive} Positive ({analysisResult.summary.positive_percentage}%)
                </span>
                <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  {analysisResult.summary.neutral} Neutral ({analysisResult.summary.neutral_percentage}%)
                </span>
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  {analysisResult.summary.negative} Negative ({analysisResult.summary.negative_percentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Top Aspects Extracted */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Aspect Mentions in Uploaded Reviews
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysisResult.summary.top_aspects).map(([asp, count]) => (
                <span
                  key={asp}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold border ${
                    count > 0 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {asp}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>

          {/* Annotated Rows Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Classified Review Items
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Customer Review</th>
                    <th className="py-2.5 px-3">DistilBERT Sentiment</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Extracted Aspects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysisResult.results.map((r) => (
                    <tr key={r.row_index} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{r.row_index}</td>
                      <td className="py-2.5 px-3 text-slate-800 max-w-lg">{r.review}</td>
                      <td className="py-2.5 px-3">
                        <SentimentBadge sentiment={r.sentiment} />
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {(r.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(r.aspects).length > 0 ? (
                            Object.keys(r.aspects).map((asp) => (
                              <span key={asp} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                {asp}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
