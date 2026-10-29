import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, ReviewItem, Sentiment } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { SentimentPill } from '../components/SentimentPill';
import { exportToCsv, exportToJson } from '../lib/export';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Layers,
  Star,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';

export const ReviewExplorer: React.FC = () => {
  const navigate = useNavigate();

  // Query state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [aspectFilter, setAspectFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['reviews', domainFilter, sentimentFilter, aspectFilter, activeSearch, page, pageSize],
    queryFn: () =>
      api.getReviews({
        domain: domainFilter || undefined,
        sentiment: sentimentFilter || undefined,
        aspect: aspectFilter || undefined,
        q: activeSearch || undefined,
        page,
        page_size: pageSize,
      }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setDomainFilter('');
    setSentimentFilter('');
    setAspectFilter('');
    setPage(1);
  };

  const handleAnalyzeInPredictor = (text: string) => {
    // Navigate to predict with pre-filled state
    navigate('/predict', { state: { prefilledReview: text } });
  };

  const handleExportCsv = () => {
    if (!data || !data.items || data.items.length === 0) return;
    const rows = data.items.map((r) => ({
      id: r.id,
      domain: r.domain,
      rating: r.rating,
      sentiment: r.sentiment,
      text: r.text,
      aspects: JSON.stringify(r.aspects),
    }));
    exportToCsv(`Review_Explorer_Page_${page}.csv`, rows);
  };

  const handleExportJson = () => {
    if (!data || !data.items) return;
    exportToJson(`Review_Explorer_Page_${page}.json`, data);
  };

  const domains = [
    { label: 'All Domains', value: '' },
    { label: 'Home & Kitchen', value: 'home_kitchen' },
    { label: 'Appliances', value: 'appliances' },
    { label: 'Sports & Outdoors', value: 'sports_outdoors' },
  ];

  const sentiments = [
    { label: 'All Sentiments', value: '' },
    { label: 'Positive (4-5★)', value: 'POSITIVE' },
    { label: 'Neutral (3★)', value: 'NEUTRAL' },
    { label: 'Negative (1-2★)', value: 'NEGATIVE' },
  ];

  const aspects = [
    'All Aspects',
    'Quality',
    'Price',
    'Delivery',
    'Durability',
    'Design',
    'Usability',
  ];

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan font-mono font-semibold mb-1 flex items-center gap-2">
            <span>CORPUS DATA EXPLORER</span>
            {isFetching && (
              <RefreshCw className="w-3 h-3 text-neon-cyan animate-spin inline" />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Review Explorer</span>
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-md bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan">
              45,000 Balanced Corpus
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={!data || data.items.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            disabled={!data || data.items.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-slate-200 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-neon-violet" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <GlassCard className="p-5 space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keywords (e.g. 'stopped working', 'clean', 'broken packaging')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-neon-cyan text-black text-xs font-mono font-bold hover:bg-neon-cyan/90 transition-colors shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          >
            Search
          </button>
          {(activeSearch || domainFilter || sentimentFilter || aspectFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.05] text-xs">
          {/* Domain Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Domain</label>
            <select
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-neon-cyan"
            >
              {domains.map((d) => (
                <option key={d.value} value={d.value} className="bg-slate-900">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Sentiment Class</label>
            <select
              value={sentimentFilter}
              onChange={(e) => {
                setSentimentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-neon-cyan"
            >
              {sentiments.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-900">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Filter */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Product Aspect</label>
            <select
              value={aspectFilter}
              onChange={(e) => {
                setAspectFilter(e.target.value === 'All Aspects' ? '' : e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-200 text-xs font-mono focus:outline-none focus:border-neon-cyan"
            >
              {aspects.map((a) => (
                <option key={a} value={a === 'All Aspects' ? '' : a} className="bg-slate-900">
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Results Header with Match Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <div>
          {isLoading ? (
            <span>Loading reviews...</span>
          ) : data ? (
            <span>
              Showing <strong className="text-white">{data.items.length}</strong> of{' '}
              <strong className="text-white">{data.total.toLocaleString()}</strong> reviews
              {activeSearch && ` matching "${activeSearch}"`}
            </span>
          ) : null}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          {[10, 20, 50].map((size) => (
            <button
              key={size}
              onClick={() => {
                setPageSize(size);
                setPage(1);
              }}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                pageSize === size
                  ? 'bg-neon-cyan/20 text-neon-cyan font-bold border border-neon-cyan/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
      ) : isError || !data || data.items.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No matching reviews found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search terms or clearing active domain and sentiment filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan text-xs font-mono font-semibold"
          >
            Clear Filters
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {data.items.map((review) => {
            const hasAspects = Object.keys(review.aspects).length > 0;
            return (
              <GlassCard
                key={review.id}
                className="p-5 border border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                {/* Review Card Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-neon-cyan font-semibold px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20">
                      {review.id}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      {review.domain.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3 h-3 ${
                            idx < review.rating ? 'fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SentimentPill sentiment={review.sentiment} size="sm" />
                    <button
                      onClick={() => handleAnalyzeInPredictor(review.text)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-neon-violet/15 hover:bg-neon-violet/30 border border-neon-violet/30 text-[11px] font-mono text-violet-300 transition-colors"
                      title="Run live inference on this review"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Test Live</span>
                    </button>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {review.text}
                </p>

                {/* Aspect Tags */}
                {hasAspects && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">
                      Detected Aspects:
                    </span>
                    {Object.entries(review.aspects).map(([asp, sent]) => (
                      <span
                        key={asp}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          sent === 'POSITIVE'
                            ? 'bg-neon-lime/10 text-neon-lime border-neon-lime/30'
                            : sent === 'NEGATIVE'
                            ? 'bg-neon-red/10 text-neon-red border-neon-red/30'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        <span>{asp}:</span>
                        <strong className="uppercase">{sent}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] text-xs font-mono">
          <div className="text-slate-400">
            Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

