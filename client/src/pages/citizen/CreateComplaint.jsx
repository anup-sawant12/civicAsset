import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CitizenHeader from '../../components/citizen/CitizenHeader';
import ComplaintForm from '../../components/complaints/ComplaintForm';
import complaintService from '../../services/complaintService';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function CreateComplaint() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successCode, setSuccessCode] = useState(null);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await complaintService.createComplaint(formData);
      if (res.success) {
        setSuccessCode(res.data.complaintCode);
        setTimeout(() => {
          navigate(`/citizen/complaints/${res.data.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to create complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check your inputs.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <CitizenHeader activePage="report issue" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>

        {/* Title */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Citizen Reporting Hotline
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Report Municipal Issue</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Submit a direct citizen report to municipal authorities. Pinpoint the street location on our GIS map, link nearby assets, and attach photo evidence.
          </p>
        </div>

        {/* Success Alert */}
        {successCode && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-sm font-bold text-white">Complaint Submitted Successfully!</strong>
              <span>Your tracking ticket <strong className="font-mono text-cyan-300">{successCode}</strong> has been logged. Redirecting...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <ComplaintForm onSubmit={handleSubmit} loading={submitting} />
        </div>
      </main>
    </div>
  );
}

export default CreateComplaint;
