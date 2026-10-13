import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  FileText, 
  Sparkles, 
  UploadCloud, 
  Eye, 
  Download, 
  Printer, 
  Clock, 
  CheckCircle2,
  X
} from 'lucide-react';
import { 
  fetchAnalysisHistory, 
  deleteAnalysisHistoryItem, 
  AnalysisHistoryRecord, 
  exportToCsv, 
  triggerPrintReport 
} from '../services/api';

export const AnalysisHistoryView: React.FC = () => {
  const [history, setHistory] = useState<AnalysisHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<AnalysisHistoryRecord | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    const records = await fetchAnalysisHistory();
    setHistory(records);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: number) => {
    const success = await deleteAnalysisHistoryItem(id);
    if (success) {
      setHistory(history.filter((h) => h.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const handleExportCsv = () => {
    if (history.length === 0) return;
    const flat = history.map((h) => ({
      'ID': h.id,
      'Type': h.analysis_type,
      'Title': h.title,
      'Summary': h.summary,
      'Date': h.created_at
    }));
    exportToCsv('analysis_history.csv', flat);
  };

  const filteredHistory = filterType === 'All'
    ? history
    : history.filter((h) => h.analysis_type === filterType);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Personal Audit Trail
            </span>
            <span className="text-xs text-slate-500">Persistent SQLite Storage</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">User Analysis History & Saved Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review past single-review predictions, batch CSV analyses, and model comparisons performed during your sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerPrintReport('Analysis History Log')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['All', 'single_review', 'csv_batch'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              filterType === t
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t === 'All' ? 'All Activities' : t === 'single_review' ? 'Live Predictions' : 'CSV Batch Analyses'}
          </button>
        ))}
        <span className="text-slate-400 text-xs ml-auto">
          Total Saved: <strong>{filteredHistory.length}</strong>
        </span>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">No analysis history found</h4>
            <p className="text-xs">
              Runs generated in the Live Predictor or CSV Upload tools will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Summary Outcome</th>
                  <th className="py-3 px-4">Recorded Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        item.analysis_type === 'single_review'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {item.analysis_type === 'single_review' ? (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Live Review
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3 h-3" />
                            CSV Batch
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.summary || 'Completed successfully'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {item.created_at}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {selectedRecord.analysis_type}
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-1">{selectedRecord.title}</h3>
                <p className="text-[11px] text-slate-400">Recorded: {selectedRecord.created_at}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Outcome Summary:</span>
                <p className="text-slate-600">{selectedRecord.summary}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Technical Payload Details:</span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] overflow-x-auto font-mono max-h-64">
                  {JSON.stringify(selectedRecord.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
