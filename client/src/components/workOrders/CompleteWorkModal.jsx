import { useState } from 'react';
import { X, CheckCircle2, Camera, AlertTriangle, FileText } from 'lucide-react';
import workOrderService from '../../services/workOrderService';

const SAMPLE_AFTER_PHOTOS = [
  {
    label: 'Fixed Streetlight',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Paved Asphalt Road',
    url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Repaired Water Pipeline',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cleaned Drainage Basin',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
];

export function CompleteWorkModal({ isOpen, onClose, workOrder, onCompleted }) {
  const [repairNotes, setRepairNotes] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repairNotes.trim()) {
      setError('Please provide detailed repair notes describing the work completed.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await workOrderService.completeWork(workOrder.id, {
        repairNotes: repairNotes.trim(),
        afterImage: afterImageUrl.trim() || undefined,
        afterImageUrl: afterImageUrl.trim() || undefined,
      });

      if (res.success) {
        onCompleted(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete work order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Complete Repair Work</h2>
              <p className="text-xs text-slate-400 font-mono">{workOrder?.workOrderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Repair Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Repair Notes / Work Summary *</span>
            </label>
            <textarea
              rows={4}
              required
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              placeholder="Describe materials replaced, testing performed, diagnostic results, and site cleanup details..."
              className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* After Repair Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>After-Repair Photographic Proof (Image URL)</span>
            </label>
            <input
              type="url"
              value={afterImageUrl}
              onChange={(e) => setAfterImageUrl(e.target.value)}
              placeholder="https://example.com/repaired-photo.jpg"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />

            {/* Quick Demo Photo Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] text-slate-500 font-semibold">Quick Sample Photos:</span>
              {SAMPLE_AFTER_PHOTOS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setAfterImageUrl(p.url)}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
                >
                  + {p.label}
                </button>
              ))}
            </div>

            {/* Preview */}
            {afterImageUrl && (
              <div className="mt-3 p-2 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                  <img
                    src={afterImageUrl}
                    alt="After repair preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="text-xs">
                  <span className="text-[11px] font-bold text-emerald-400 block">Photo Attached</span>
                  <span className="text-slate-400 text-[10px] truncate max-w-xs block">{afterImageUrl}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !repairNotes.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting Completion...' : 'Mark Completed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteWorkModal;
