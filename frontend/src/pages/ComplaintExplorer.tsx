import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertOctagon, 
  Wrench, 
  Download, 
  Printer, 
  Tag, 
  Layers, 
  Quote, 
  Hash,
  X
} from 'lucide-react';
import { 
  fetchComplaints, 
  ComplaintExplorerItem, 
  ComplaintsExplorerResponse, 
  exportToCsv, 
  triggerPrintReport 
} from '../services/api';

export const ComplaintExplorer: React.FC = () => {
  const [complaints, setComplaints] = useState<ComplaintExplorerItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [aspects, setAspects] = useState<string[]>([]);
  const [severities, setSeverities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAspect, setSelectedAspect] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const loadData = async () => {
    setIsLoading(true);
    const res: ComplaintsExplorerResponse = await fetchComplaints({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      aspect: selectedAspect === 'All' ? undefined : selectedAspect,
      severity: selectedSeverity === 'All' ? undefined : selectedSeverity,
      query: searchQuery.trim() || undefined
    });

    setComplaints(res.complaints);
    setCategories(['All', ...res.available_categories]);
    setAspects(['All', ...res.available_aspects]);
    setSeverities(['All', ...res.severities]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedAspect, selectedSeverity]);

  // Debounced query search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleExportCsv = () => {
    if (complaints.length === 0) return;
    exportToCsv('customer_complaint_catalog.csv', complaints);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedAspect('All');
    setSelectedSeverity('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Voice of Customer
            </span>
            <span className="text-xs text-slate-500">Root Cause Clustering</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Customer Complaint & Friction Point Explorer</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify recurring product defects, failure modes, and operational pain points across customer feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerPrintReport('Customer Complaints Explorer')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={complaints.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaint phrases, failure modes, or recommended actions (e.g. 'plastic', 'broken', 'motor')..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 min-w-[70px]">Domain:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Aspect Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 min-w-[70px]">Aspect:</span>
            {aspects.map((asp) => (
              <button
                key={asp}
                onClick={() => setSelectedAspect(asp)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedAspect === asp
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {asp}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 min-w-[70px]">Severity:</span>
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedSeverity === sev
                    ? sev === 'High'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : sev === 'Medium'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}

            {(selectedCategory !== 'All' || selectedAspect !== 'All' || selectedSeverity !== 'All' || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="ml-auto text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{complaints.length}</strong> matching complaint patterns</span>
        <span>Ranked by frequency and customer return impact</span>
      </div>

      {/* Complaint Cards Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-3">
          <AlertOctagon className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="font-bold text-slate-700 text-sm">No complaints matched your filter criteria</h4>
          <p className="text-xs max-w-sm mx-auto">Try clearing your search query or selecting "All" for aspect and category.</p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 capitalize">
                      &ldquo;{item.phrase}&rdquo;
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.impact === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.impact} Impact
                    </span>
                  </div>

                  <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-400" />
                    {item.count} mentions
                  </span>
                </div>

                {/* Aspect and Category badges */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-200">
                    {item.aspect}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">
                    {item.category}
                  </span>
                </div>

                {/* Real quote sample */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic flex items-start gap-2">
                  <Quote className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>&ldquo;{item.sample_quote}&rdquo;</span>
                </div>
              </div>

              {/* Action item box */}
              <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-indigo-950 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/80">
                <Wrench className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[11px] text-indigo-900 block uppercase tracking-wide">
                    Engineering Action Item:
                  </span>
                  <p className="text-[11px] text-slate-700 mt-0.5">{item.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
