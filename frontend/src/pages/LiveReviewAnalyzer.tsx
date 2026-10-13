import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Layers, 
  AlertCircle, 
  Tag, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { predictReviewSentiment, PredictionResponse } from '../services/api';
import { SentimentBadge } from '../components/SentimentBadge';

const PRESETS = [
  {
    category: 'Home & Kitchen',
    title: 'Positive Kitchenware (Quality & Usability)',
    text: 'This blender is fantastic! High quality motor, very easy to clean, and the stainless steel finish looks great on the counter.'
  },
  {
    category: 'Appliances',
    title: 'Negative Appliance (Durability & Price)',
    text: 'Complete waste of money. The cheap plastic gear coupling broke after just two days of light use.'
  },
  {
    category: 'Sports & Outdoors',
    title: 'Nuanced Outdoor Gear (Mixed Quality & Delivery)',
    text: 'The tent material is superb and waterproof, but delivery was slow and arrived late with a ripped outer carton.'
  }
];

export const LiveReviewAnalyzer: React.FC = () => {
  const [category, setCategory] = useState<string>('Home & Kitchen');
  const [reviewText, setReviewText] = useState<string>(PRESETS[0].text);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  
  // Validation errors
  const [textError, setTextError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const handlePredict = async () => {
    setTextError(null);
    setCategoryError(null);
    setServerError(null);

    // Validation 1: Category
    if (!category) {
      setCategoryError('Please select a valid product category.');
      return;
    }

    // Validation 2: Review text
    const trimmed = reviewText.trim();
    if (!trimmed) {
      setTextError('Review text cannot be empty or consist only of whitespace.');
      return;
    }

    if (trimmed.length < 5) {
      setTextError('Please provide a meaningful review (minimum 5 characters).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await predictReviewSentiment(trimmed, selectedModel, category);
      setResult(res);
    } catch (err: any) {
      setServerError(err.message || 'Inference service is currently unavailable. Please check the backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = reviewText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Input Section Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Customer Review Predictor</h3>
              <p className="text-xs text-slate-500">Classify sentiment and extract aspect-level feedback in real time</p>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Compare All 3 Models</option>
              <option value="distilbert">DistilBERT (Transformer - Recommended)</option>
              <option value="logistic">Logistic Regression (TF-IDF)</option>
              <option value="svm">Linear SVM (TF-IDF)</option>
            </select>
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Product Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {['Home & Kitchen', 'Appliances', 'Sports & Outdoors'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  if (categoryError) setCategoryError(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold text-left border flex items-center justify-between transition-all ${
                  category === cat
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{cat}</span>
                </div>
                {category === cat && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
          {categoryError && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{categoryError}</p>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCategory(p.category);
                setReviewText(p.text);
                setResult(null);
                setTextError(null);
                setCategoryError(null);
              }}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors border border-slate-200/60"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Review Text Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Customer Review Text *
          </label>
          <textarea
            rows={4}
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              if (textError) setTextError(null);
            }}
            placeholder="Type or paste any customer review to analyze (e.g., 'The blender works well but was noisy and expensive.')..."
            className={`w-full p-3.5 text-sm text-slate-800 rounded-lg border focus:outline-none transition-all placeholder-slate-400 font-sans leading-relaxed ${
              textError
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            }`}
          />
          {textError && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{textError}</p>
          )}
        </div>

        {/* Footer controls & Length Guidance */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
            <span>{wordCount} words ({reviewText.length} characters)</span>
            <span className="text-slate-300">•</span>
            <span className={wordCount >= 10 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
              {wordCount >= 10 ? 'Optimal length for ABSA' : 'Short review (10+ words recommended)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReviewText('');
                setResult(null);
                setTextError(null);
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handlePredict}
              disabled={isLoading || !reviewText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing ML Models...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyze Review</span>
                </>
              )}
            </button>
          </div>
        </div>

        {serverError && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}
      </div>

      {/* Actual Prediction Results Output */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Classification Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Predicted Overall Sentiment ({category})
              </h3>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Real Model Output
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(result.predictions).map(([mName, pDetail]) => {
                const norm = pDetail.sentiment.toLowerCase();
                const cardTheme = norm === 'positive' 
                  ? 'border-emerald-200 bg-emerald-50/50' 
                  : (norm === 'negative' ? 'border-rose-200 bg-rose-50/50' : 'border-amber-200 bg-amber-50/50');

                return (
                  <div key={mName} className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${cardTheme}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{mName}</span>
                      <SentimentBadge sentiment={pDetail.sentiment} size="sm" />
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black capitalize text-slate-900">
                        {pDetail.sentiment}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium">
                        Model Confidence: <strong className="text-slate-800">{(pDetail.confidence * 100).toFixed(1)}%</strong>
                      </div>
                    </div>

                    {/* Probability Distribution */}
                    {pDetail.probabilities && (
                      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/60">
                        {Object.entries(pDetail.probabilities).map(([cName, prob]) => (
                          <div key={cName} className="text-[11px]">
                            <div className="flex justify-between text-slate-600 mb-0.5 capitalize">
                              <span>{cName}</span>
                              <span className="font-mono font-semibold">{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  cName === 'positive' ? 'bg-emerald-500' : (cName === 'negative' ? 'bg-rose-500' : 'bg-amber-500')
                                }`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aspect-Level Extraction */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Aspect-Level Sentiment Breakdown</h3>
                  <p className="text-xs text-slate-500">Fine-grained sentiment attributed to specific product attributes</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {Object.keys(result.aspects).length} Aspects Identified
              </span>
            </div>

            {Object.keys(result.aspects).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {Object.entries(result.aspects).map(([aspName, aspDetail]) => (
                  <div key={aspName} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900">{aspName}</span>
                      <SentimentBadge sentiment={aspDetail.sentiment} confidence={aspDetail.confidence} size="sm" />
                    </div>
                    <p className="text-xs text-slate-700 font-sans italic my-1">
                      "{aspDetail.supporting_text}"
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Matched keyword: <code className="bg-slate-200 px-1 py-0.2 rounded text-indigo-700 font-mono">{aspDetail.matched_keyword}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No specific predefined aspects (Quality, Price, Delivery, Durability, Design, Usability) were detected in this review.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
