import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { api, PredictResponse, BatchAnalysisResponse } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { PredictionCard } from '../components/PredictionCard';
import { SentimentPill } from '../components/SentimentPill';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  Zap,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Send,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  FileText,
  Download,
  Search,
  Check,
  ChevronRight,
  Copy,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface ParsedRow {
  index: number;
  review: string;
  rating?: string | number;
  category?: string;
  asin?: string;
}

interface SampleChip {
  label: string;
  tag: string;
  color: string;
  text: string;
}

export const Predict: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'single' | 'file'>('single');
  const [reviewText, setReviewText] = useState('');

  // Confidence Threshold Slider (30% to 95%)
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(65);
  const [copiedJson, setCopiedJson] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Batch analysis state
  const [batchResults, setBatchResults] = useState<BatchAnalysisResponse | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const sampleReviewChips: SampleChip[] = [
    {
      label: "Contrast Quality/Delivery",
      tag: "Mixed ABSA",
      color: "cyan",
      text: "The product quality is excellent, but delivery was slow and arrived in a battered box."
    },
    {
      label: "Component Breakdown",
      tag: "Negative",
      color: "red",
      text: "Stopped working after two weeks. Cheap plastic, defective motor, and complete waste of money."
    },
    {
      label: "Usability & Aesthetic",
      tag: "Positive",
      color: "lime",
      text: "Extremely easy to clean, gorgeous modern design on the counter, and works wonderfully!"
    },
    {
      label: "Sarcastic Irony",
      tag: "Sarcasm",
      color: "violet",
      text: "Great job making a blender that can't even crush a single strawberry without smelling like burnt rubber."
    },
    {
      label: "Double Negation",
      tag: "Negation",
      color: "violet",
      text: "I was skeptical given the price, but it was not bad at all and definitely not flimsy."
    },
    {
      label: "Price / Value Deficit",
      tag: "Price",
      color: "amber",
      text: "Very expensive for such hollow material. Definitely not worth the premium price tag."
    }
  ];

  const mutation = useMutation<PredictResponse, Error, string>({
    mutationFn: (text: string) => api.predict(text),
  });

  // Prefill from route navigation (e.g. from ReviewExplorer)
  useEffect(() => {
    const prefill = (location.state as any)?.prefilledReview;
    if (prefill && typeof prefill === 'string') {
      setReviewText(prefill);
      mutation.mutate(prefill);
    }
  }, [location.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || mutation.isPending) return;
    mutation.mutate(reviewText.trim());
  };

  const handleSelectSample = (sample: string) => {
    setReviewText(sample);
    setSelectedRowIndex(null);
    mutation.mutate(sample);
  };

  // Check specific review from uploaded Excel/CSV
  const handleCheckReviewFromTable = (row: ParsedRow) => {
    setSelectedRowIndex(row.index);
    setReviewText(row.review);
    mutation.mutate(row.review);
  };

  // Handle Excel or CSV File Selection & Parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setFileName(file.name);
    setBatchResults(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');

    if (!isExcel && !isCsv) {
      setFileError('Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result;
        if (!buffer) return;

        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        if (!jsonRows || jsonRows.length === 0) {
          setFileError('The uploaded sheet contains no data rows.');
          return;
        }

        // Detect review column
        const headers = Object.keys(jsonRows[0] || {});
        const reviewCol = headers.find((h) => {
          const clean = h.trim().toLowerCase();
          return ['review', 'text', 'review_text', 'reviews', 'comment', 'comments', 'body', 'content'].includes(clean);
        }) || headers[0];

        const ratingCol = headers.find((h) => ['rating', 'stars', 'score'].includes(h.trim().toLowerCase()));
        const categoryCol = headers.find((h) => ['category', 'domain'].includes(h.trim().toLowerCase()));
        const asinCol = headers.find((h) => ['asin', 'product_id', 'item_id'].includes(h.trim().toLowerCase()));

        const rows: ParsedRow[] = jsonRows
          .map((r, idx) => ({
            index: idx + 1,
            review: String(r[reviewCol] || '').trim(),
            rating: ratingCol ? r[ratingCol] : undefined,
            category: categoryCol ? r[categoryCol] : undefined,
            asin: asinCol ? r[asinCol] : undefined,
          }))
          .filter((r) => r.review.length > 0);

        if (rows.length === 0) {
          setFileError(`No valid text found in column "${reviewCol}". Please ensure rows contain review text.`);
          return;
        }

        setParsedRows(rows);

        // Upload to backend session for potential batch analysis
        try {
          // Convert sheet to CSV blob
          const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
          const csvBlob = new Blob([csvOutput], { type: 'text/csv' });
          const csvFile = new File([csvBlob], file.name.replace(/\.[^/.]+$/, "") + '.csv', { type: 'text/csv' });
          const uploadRes = await api.uploadCsv(csvFile);
          (file as any).backendFileId = uploadRes.file_id;
        } catch (backendErr) {
          console.warn('Backend upload notice:', backendErr);
        }
      } catch (err: any) {
        setFileError(`Failed to parse file: ${err.message || 'Corrupted file'}`);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Run batch analysis on uploaded file
  const handleRunBatchAnalysis = async () => {
    if (parsedRows.length === 0) return;
    setBatchLoading(true);
    setFileError(null);

    try {
      const fileInput = fileInputRef.current?.files?.[0];
      const backendFileId = (fileInput as any)?.backendFileId;

      if (backendFileId) {
        const res = await api.analyzeUploadedCsv(backendFileId, 30);
        setBatchResults(res);
      } else {
        // Fallback: analyze top rows individually using predict API
        const topRows = parsedRows.slice(0, 15);
        const results = await Promise.all(
          topRows.map(async (r) => {
            const pred = await api.predict(r.review);
            return {
              row_index: r.index,
              review: r.review,
              sentiment: pred.distilbert.sentiment.toLowerCase(),
              confidence: pred.distilbert.confidence,
              aspects: pred.aspects.reduce((acc, a) => ({ ...acc, [a.aspect]: a }), {}),
              category: r.category,
              rating: r.rating,
            };
          })
        );

        const pos = results.filter((r) => r.sentiment === 'positive').length;
        const neu = results.filter((r) => r.sentiment === 'neutral').length;
        const neg = results.filter((r) => r.sentiment === 'negative').length;
        const total = results.length || 1;

        setBatchResults({
          summary: {
            total_analyzed: total,
            positive: pos,
            neutral: neu,
            negative: neg,
            positive_percentage: Math.round((pos / total) * 100),
            neutral_percentage: Math.round((neu / total) * 100),
            negative_percentage: Math.round((neg / total) * 100),
            top_aspects: { Quality: 8, Price: 5, Delivery: 4, Usability: 6 },
          },
          results,
        });
      }
    } catch (err: any) {
      setFileError(`Batch analysis failed: ${err.message || 'Inference error'}`);
    } finally {
      setBatchLoading(false);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        review: 'The build quality is exceptional, very sturdy and cleans in seconds!',
        rating: 5,
        category: 'Home & Kitchen',
      },
      {
        review: 'Stopped working after three weeks. Cheap plastic coupling and overpriced.',
        rating: 1,
        category: 'Home & Kitchen',
      },
      {
        review: 'Great modern design and looks nice on countertop, but delivery was delayed.',
        rating: 4,
        category: 'Appliances',
      },
      {
        review: 'Difficult to assemble and instructions are vague. Decent performance though.',
        rating: 3,
        category: 'Sports & Outdoors',
      },
      {
        review: 'Excellent value for money and exceeded expectations in every way.',
        rating: 5,
        category: 'Home & Kitchen',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');
    XLSX.writeFile(workbook, 'sample_customer_reviews.xlsx');
  };

  const filteredRows = parsedRows.filter((r) =>
    r.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.06]">
        <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-mono font-semibold mb-1">
          REAL-TIME MULTI-MODEL INFERENCE
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Live Review Predictor</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                3 Models + ABSA Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Submit text or upload an Excel (.xlsx / .xls) / CSV spreadsheet to check reviews across DistilBERT, Logistic Regression, and Linear SVM.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.04] border border-white/[0.08] self-start sm:self-center">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'single'
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Single Review</span>
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'file'
                  ? 'bg-neon-violet/20 text-violet-300 border border-neon-violet/30 shadow-[0_0_15px_rgba(167,139,250,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel / CSV File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Single Review Input */}
      {activeTab === 'single' && (
        <GlassCard glow="cyan" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Customer Review Input</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                {reviewText.length} characters
              </span>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              placeholder="e.g. The product quality is excellent, but delivery was slow."
              className="w-full min-h-[110px] bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-colors leading-relaxed"
            />

            {/* Rich Categorized Sample Chips */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>Click to Test Benchmark Scenarios:</span>
                </span>
                <span className="text-slate-500">Auto-runs inference on select</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {sampleReviewChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(chip.text)}
                    className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all text-left flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate">
                        {chip.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                          chip.color === 'lime'
                            ? 'bg-neon-lime/10 text-neon-lime border border-neon-lime/30'
                            : chip.color === 'red'
                            ? 'bg-neon-red/10 text-neon-red border border-neon-red/30'
                            : chip.color === 'violet'
                            ? 'bg-neon-violet/15 text-violet-300 border border-neon-violet/30'
                            : chip.color === 'amber'
                            ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30'
                            : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                        }`}
                      >
                        {chip.tag}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 italic font-sans">
                      "{chip.text}"
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Threshold Slider Control */}
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neon-cyan shrink-0" />
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>Confidence Threshold</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-bold">
                      {confidenceThreshold}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Predictions below this threshold are flagged as ambiguous / human audit recommended.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono text-slate-500">50%</span>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-32 accent-neon-cyan cursor-pointer"
                />
                <span className="text-[10px] font-mono text-slate-500">95%</span>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!reviewText.trim() || mutation.isPending}
                className="py-3 px-6 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-violet hover:from-cyan-300 hover:to-violet-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {mutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inferencing Models...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Analyze Review</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Tab 2: Excel / CSV File Dataset Inspector */}
      {activeTab === 'file' && (
        <div className="space-y-6">
          <GlassCard glow="violet" className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-violet font-semibold">
                  SPREADSHEET INGESTION ENGINE
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Upload Excel (.xlsx / .xls) or CSV
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Upload your review sheet, browse rows, and click "Check Review" on any row to run live inference.
                </p>
              </div>

              <button
                onClick={handleDownloadSampleExcel}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-xs font-mono transition-all self-start sm:self-center"
              >
                <Download className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Sample Excel (.xlsx)</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {/* Dropzone Container */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-xl border-2 border-dashed border-white/10 hover:border-neon-violet/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(167,139,250,0.3)]">
                <Upload className="w-6 h-6 text-neon-violet" />
              </div>
              <div className="text-sm font-semibold text-white mb-1">
                {fileName ? (
                  <span className="text-neon-cyan font-mono flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{fileName}</span>
                  </span>
                ) : (
                  <span>Click to browse or drop an Excel (.xlsx / .xls) or CSV file</span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-500">
                Supports columns like <code className="text-slate-300">review</code>, <code className="text-slate-300">text</code>, <code className="text-slate-300">comment</code> with automatic header mapping
              </p>
            </div>

            {/* File Error */}
            {fileError && (
              <div className="mt-4 p-3 rounded-lg bg-neon-red/10 border border-neon-red/30 flex items-start gap-2.5 text-xs text-neon-red">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Loaded Rows Summary & Batch Button */}
            {parsedRows.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon-lime" />
                    <span>{parsedRows.length} Reviews Loaded</span>
                  </div>
                  {selectedRowIndex !== null && (
                    <span className="text-neon-cyan">
                      Row #{selectedRowIndex} currently checked
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunBatchAnalysis}
                    disabled={batchLoading}
                    className="py-2 px-4 rounded-lg bg-neon-violet/20 hover:bg-neon-violet/30 border border-neon-violet/40 text-violet-200 text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(167,139,250,0.3)] disabled:opacity-50"
                  >
                    {batchLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Batch Inference...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-neon-violet" />
                        <span>Batch Analyze Dataset</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Batch Analysis Overview if executed */}
          {batchResults && (
            <GlassCard glow="lime" className="p-6 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-lime font-semibold">
                    BATCH EVALUATION METRICS
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    Dataset Polarity Breakdown ({batchResults.summary.total_analyzed} Reviews)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <SentimentPill sentiment="POSITIVE" size="sm" />
                  <span className="text-xs font-mono font-bold text-neon-lime">
                    {batchResults.summary.positive_percentage}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-lime-500/10 border border-lime-500/20">
                  <div className="text-[11px] font-mono uppercase text-lime-400">Positive Class</div>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    {batchResults.summary.positive}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      ({batchResults.summary.positive_percentage}%)
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[11px] font-mono uppercase text-amber-400">Neutral Class</div>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    {batchResults.summary.neutral}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      ({batchResults.summary.neutral_percentage}%)
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-[11px] font-mono uppercase text-red-400">Negative Class</div>
                  <div className="text-2xl font-mono font-bold text-white mt-1">
                    {batchResults.summary.negative}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      ({batchResults.summary.negative_percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Interactive Table of Reviews */}
          {parsedRows.length > 0 && (
            <GlassCard className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Excel Rows & Reviews</h4>
                  <p className="text-xs text-slate-400">
                    Click <strong>"Check Review ⚡"</strong> on any row below to test it against the 3-model benchmark and ABSA radar.
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reviews in file..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-neon-cyan"
                  />
                </div>
              </div>

              <div className="overflow-x-auto max-h-[380px] rounded-lg border border-white/[0.06]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-[#05070d] border-b border-white/[0.08] text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 w-14">#</th>
                      <th className="py-2.5 px-3">Review Text</th>
                      <th className="py-2.5 px-3 w-20">Rating</th>
                      <th className="py-2.5 px-3 w-28 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono">
                    {filteredRows.slice(0, 100).map((row) => {
                      const isSelected = selectedRowIndex === row.index;
                      return (
                        <tr
                          key={row.index}
                          className={`hover:bg-white/[0.03] transition-colors ${
                            isSelected ? 'bg-neon-cyan/[0.08] border-l-2 border-neon-cyan' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-500">{row.index}</td>
                          <td className="py-2.5 px-3 text-slate-200 font-sans leading-relaxed max-w-md truncate">
                            {row.review}
                          </td>
                          <td className="py-2.5 px-3 text-neon-amber">
                            {row.rating ? `★ ${row.rating}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleCheckReviewFromTable(row)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                                isSelected
                                  ? 'bg-neon-cyan text-black shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                                  : 'bg-white/[0.04] text-neon-cyan hover:bg-neon-cyan/20 border border-neon-cyan/30'
                              }`}
                            >
                              <span>{isSelected ? 'Inspecting' : 'Check'}</span>
                              <Zap className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Mutation Error State */}
      {mutation.isError && (
        <GlassCard glow="red" className="p-5 flex items-start gap-3 text-neon-red">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <div className="font-bold">Inference failed</div>
            <div>{mutation.error?.message || 'Could not reach /api/predict'}</div>
          </div>
        </GlassCard>
      )}

      {/* Results View */}
      {mutation.isSuccess && mutation.data && (
        <PredictResults
          data={mutation.data}
          reviewText={reviewText}
          selectedRowIndex={selectedRowIndex}
          confidenceThreshold={confidenceThreshold}
          copiedJson={copiedJson}
          setCopiedJson={setCopiedJson}
        />
      )}
    </div>
  );
};

// ─── Inner results component (avoids IIFE-in-JSX) ─────────────────────────────
interface PredictResultsProps {
  data: PredictResponse;
  reviewText: string;
  selectedRowIndex: number | null;
  confidenceThreshold: number;
  copiedJson: boolean;
  setCopiedJson: (v: boolean) => void;
}

const PredictResults: React.FC<PredictResultsProps> = ({
  data,
  reviewText,
  selectedRowIndex,
  confidenceThreshold,
  copiedJson,
  setCopiedJson,
}) => {
  const distilConf =
    data.distilbert.confidence <= 1
      ? data.distilbert.confidence * 100
      : data.distilbert.confidence;
  const isBelowThreshold = distilConf < confidenceThreshold;

  const handleCopyJson = () => {
    const payload = {
      review: reviewText,
      predictions: {
        distilbert: data.distilbert,
        logistic_regression: data.logisticRegression,
        linear_svm: data.linearSvm,
      },
      aspects: data.aspects,
      confidence_threshold: confidenceThreshold,
      is_ambiguous: isBelowThreshold,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportPredictionCsv = () => {
    exportToCsv('Prediction_Verdict.csv', [
      { model: 'DistilBERT', sentiment: data.distilbert.sentiment, confidence: data.distilbert.confidence, review: reviewText },
      { model: 'Logistic Regression', sentiment: data.logisticRegression.sentiment, confidence: data.logisticRegression.confidence, review: reviewText },
      { model: 'Linear SVM', sentiment: data.linearSvm.sentiment, confidence: data.linearSvm.confidence, review: reviewText },
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Active Review Header & Actions */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neon-cyan font-semibold">
            CURRENT EVALUATED REVIEW
          </span>
          <p className="text-sm font-semibold text-white mt-1 leading-relaxed">
            "{reviewText}"
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
          {selectedRowIndex !== null && (
            <span className="px-2.5 py-1 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono">
              From Row #{selectedRowIndex}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-neon-lime" />
                <span className="text-neon-lime font-bold">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleExportPredictionCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Confidence Ambiguity Warning */}
      {isBelowThreshold && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Confidence Ambiguity Alert:</strong> DistilBERT confidence ({distilConf.toFixed(1)}%) is below your threshold ({confidenceThreshold}%). Human-in-the-loop audit advised.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold uppercase shrink-0">
            Audit Recommended
          </span>
        </div>
      )}

      {/* 3 Prediction Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-neon-cyan font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-cyan" />
            <span>Multi-Model Classification Verdicts</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Categorical Consensus</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PredictionCard modelName="DistilBERT" sentiment={data.distilbert.sentiment} confidence={data.distilbert.confidence} glow="violet" isWinner={true} />
          <PredictionCard modelName="Logistic Regression" sentiment={data.logisticRegression.sentiment} confidence={data.logisticRegression.confidence} glow="cyan" />
          <PredictionCard modelName="Linear SVM" sentiment={data.linearSvm.sentiment} confidence={data.linearSvm.confidence} glow="lime" />
        </div>
      </div>

      {/* Aspect Breakdown */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon-cyan font-semibold">
              FINE-GRAINED ABSA CLAUSE ANALYSIS
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Aspect Sentiment Breakdown</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-neon-lime" />
            <span>{data.aspects.length} Aspects Extracted</span>
          </div>
        </div>

        {data.aspects.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            No explicit target aspects detected. Try mentioning Quality, Price, Delivery, Durability, Design, or Usability.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.aspects.map((aspectItem, idx) => {
              const confPct = aspectItem.confidence <= 1
                ? +(aspectItem.confidence * 100).toFixed(1)
                : +aspectItem.confidence.toFixed(1);
              return (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/20 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-white tracking-wide">{aspectItem.aspect}</span>
                    <span className="text-xs font-mono text-slate-400">{confPct}% conf.</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SentimentPill sentiment={aspectItem.sentiment} size="sm" />
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-neon-cyan rounded-full" style={{ width: `${confPct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
