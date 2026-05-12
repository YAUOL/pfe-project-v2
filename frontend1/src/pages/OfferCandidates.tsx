import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, FileText, Award, CheckCircle,
  XCircle, Clock, Loader2, Download, ChevronDown, ChevronUp,
  Brain, Sparkles, Search, Eye, AlertCircle, Users, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  getCVsWithScores,
  updateCandidatureStatusNew,
  downloadCVFile,
  CandidateWithScore
} from '../api';

interface OfferCandidatesProps {
  offerId: string;
  onNavigate: (page: string) => void;
}

function scoreColor(score: number) {
  if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-500', label: 'Excellent' };
  if (score >= 60) return { text: 'text-blue-600', bg: 'bg-blue-100', bar: 'bg-blue-500', label: 'Good' };
  if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-100', bar: 'bg-orange-400', label: 'Average' };
  return { text: 'text-red-600', bg: 'bg-red-100', bar: 'bg-red-400', label: 'Low' };
}

function isAccepted(statut: string) { return statut === 'ACCEPTED' || statut === 'ACCEPTE'; }
function isRejected(statut: string) { return statut === 'REJECTED' || statut === 'REFUSE'; }

function statusInfo(statut: string) {
  if (isAccepted(statut)) return { label: 'Accepted', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-4 w-4 text-green-600" /> };
  if (isRejected(statut)) return { label: 'Rejected', cls: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4 text-red-500" /> };
  return { label: 'Pending', cls: 'bg-blue-100 text-blue-700', icon: <Clock className="h-4 w-4 text-blue-500" /> };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function OfferCandidates({ offerId, onNavigate }: OfferCandidatesProps) {
  const [candidates, setCandidates] = useState<CandidateWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatingScores, setCalculatingScores] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [offerTitle, setOfferTitle] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCVsWithScores(Number(offerId));
      const sorted = [...data].sort((a, b) =>
        Number(b.matchingScore?.score ?? -1) - Number(a.matchingScore?.score ?? -1)
      );
      setCandidates(sorted);
      const token = localStorage.getItem('authToken');
      const offerResponse = await fetch(`http://localhost:8080/api/offres/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const offer = await offerResponse.json();
      setOfferTitle(offer.titre);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const reExtractAndCalculate = async () => {
    if (candidates.length === 0) { alert('No candidates to process.'); return; }
    try {
      setCalculatingScores(true);
      const token = localStorage.getItem('authToken');
      let extractOk = 0, extractFail = 0, scoreOk = 0, scoreFail = 0;
      const errors: string[] = [];

      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        const name = `${candidate.cv.candidat.prenom} ${candidate.cv.candidat.nom}`;
        setProcessingStatus(`Processing ${i + 1}/${candidates.length}: ${name}...`);

        try {
          const res = await fetch(`http://localhost:8080/api/cv/${candidate.cv.id}/reextract`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) { errors.push(`[${name}] Extract failed (${res.status}): ${await res.text()}`); extractFail++; }
          else extractOk++;
        } catch (err) {
          errors.push(`[${name}] Extract error: ${err instanceof Error ? err.message : 'Network error'}`);
          extractFail++;
        }

        try {
          const scoreRes = await fetch(`http://localhost:8080/api/matching/recalculate/${candidate.cv.id}`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` },
          });
          if (!scoreRes.ok) { errors.push(`[${name}] Score failed (${scoreRes.status}): ${await scoreRes.text()}`); scoreFail++; }
          else scoreOk++;
        } catch (err) {
          errors.push(`[${name}] Score error: ${err instanceof Error ? err.message : 'Network error'}`);
          scoreFail++;
        }
      }

      setProcessingStatus('Refreshing results...');
      await loadCandidates();
      setProcessingStatus('');

      if (errors.length === 0) {
        alert(`✅ All done!\n\nExtracted: ${extractOk}/${candidates.length}\nScored: ${scoreOk}/${candidates.length}`);
      } else {
        alert(`⚠️ Completed with errors:\n\n✅ Extracted: ${extractOk} | ❌ Failed: ${extractFail}\n✅ Scored: ${scoreOk} | ❌ Failed: ${scoreFail}\n\nDetails:\n${errors.join('\n')}`);
      }
    } catch (err) {
      setProcessingStatus('');
      alert(`❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCalculatingScores(false);
    }
  };

  const handleUpdateStatus = async (cvId: number, statut: 'ACCEPTED' | 'REJECTED') => {
    try {
      setUpdatingStatus(cvId);
      await updateCandidatureStatusNew(cvId, statut);
      await loadCandidates();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDownload = async (cvId: number, fileName: string) => {
    try {
      setDownloadingId(cvId);
      await downloadCVFile(cvId, fileName);
    } catch (err) {
      alert('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewCV = async (cvId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setViewingId(cvId);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/cv/${cvId}/file`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const blob = await response.blob();
      const finalBlob = blob.type === 'application/octet-stream'
        ? new Blob([blob], { type: 'application/pdf' }) : blob;
      const url = URL.createObjectURL(finalBlob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      alert('Failed to open CV file. Please try downloading it instead.');
    } finally {
      setViewingId(null);
    }
  };

  const filtered = candidates.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.cv.candidat.prenom.toLowerCase().includes(q) ||
      c.cv.candidat.nom.toLowerCase().includes(q) ||
      c.cv.candidat.email.toLowerCase().includes(q)
    );
  });

  const scoredCandidates = candidates.filter(c => c.matchingScore);
  const avgScore = scoredCandidates.length > 0
    ? Math.round(scoredCandidates.reduce((sum, c) => sum + Number(c.matchingScore?.score ?? 0), 0) / scoredCandidates.length)
    : 0;
  const topScore = scoredCandidates.length > 0
    ? Math.round(Math.max(...scoredCandidates.map(c => Number(c.matchingScore?.score ?? 0))))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Back ── */}
        <Button variant="ghost" onClick={() => onNavigate('employer-dashboard')}
          className="mb-6 text-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* ── Header ── */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="mb-0">{offerTitle}</h1>
            <p className="text-secondary text-sm">Applications ranked by AI matching score</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-color p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{candidates.length}</h3>
            <p className="text-secondary text-sm">Total Applicants</p>
          </div>

          <div className="bg-white rounded-xl border border-color p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{avgScore}%</h3>
            <p className="text-secondary text-sm">Average Score</p>
          </div>

          <div className="bg-white rounded-xl border border-color p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-primary">AI</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{scoredCandidates.length}/{candidates.length}</h3>
            <p className="text-secondary text-sm">Scored</p>
          </div>

          <div className="bg-white rounded-xl border border-color p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-green-600">Top</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{topScore}%</h3>
            <p className="text-secondary text-sm">Best Match</p>
          </div>
        </div>

        {/* ── Warning ── */}
        {candidates.some(c => !c.cv.texteExtrait) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Some CVs have no extracted text yet. Click <strong>Extract & Calculate Scores</strong> to process them.
            </p>
          </div>
        )}

        {/* ── Main card ── */}
        <div className="bg-white rounded-xl border border-color overflow-hidden">

          {/* Card header */}
          <div className="p-6 border-b border-color">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="mb-0">Applications ({filtered.length})</h2>
                <span className="text-xs text-secondary ml-1">· sorted by score ↓</span>
              </div>
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 bg-surface border border-color rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    onClick={reExtractAndCalculate}
                    disabled={calculatingScores}
                    className="bg-primary hover:bg-primary-hover text-white rounded-lg whitespace-nowrap"
                  >
                    {calculatingScores
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                      : <><Sparkles className="h-4 w-4 mr-2" />Extract & Calculate Scores</>}
                  </Button>
                  {processingStatus && (
                    <p className="text-xs text-secondary flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />{processingStatus}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-secondary">
                {searchQuery ? 'No candidates match your search' : 'No applications yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-color">
              {filtered.map((candidate, index) => {
                const { cv, matchingScore } = candidate;
                const status = statusInfo(cv.statut);
                const isExpanded = expandedId === cv.id;
                const sc = matchingScore ? scoreColor(Number(matchingScore.score)) : null;
                const accepted = isAccepted(cv.statut);
                const rejected = isRejected(cv.statut);

                return (
                  <div key={cv.id} className="group">

                    {/* ── Row ── */}
                    <div
                      className={`flex items-center gap-4 p-5 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-primary-light/30' : 'hover:bg-surface'
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : cv.id)}
                    >
                      {/* Rank */}
                      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      </div>

                      {/* Avatar */}
                      <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {cv.candidat.prenom?.[0]}{cv.candidat.nom?.[0]}
                        </span>
                      </div>

                      {/* ── Name + pills ── */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1: name + status */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-semibold text-sm">
                            {cv.candidat.prenom} {cv.candidat.nom}
                          </p>
                          <div className="flex items-center gap-1">
                            {status.icon}
                            <Badge className={`${status.cls} border-0 text-xs`}>{status.label}</Badge>
                          </div>
                        </div>
                        {/* Row 2: pill chips */}
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 bg-surface border border-color rounded-full px-2.5 py-0.5 text-xs text-secondary">
                            <Mail className="h-3 w-3 text-primary flex-shrink-0" />
                            {cv.candidat.email}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-surface border border-color rounded-full px-2.5 py-0.5 text-xs text-secondary">
                            <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                            {timeAgo(cv.uploadedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-surface border border-color rounded-full px-2.5 py-0.5 text-xs text-secondary">
                            <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                            {cv.nomFichier}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      {matchingScore && sc ? (
                        <div className="flex-shrink-0 text-right min-w-[130px]">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className={`text-xl font-bold ${sc.text}`}>
                              {Number(matchingScore.score).toFixed(0)}%
                            </span>
                            <Badge className={`${sc.bg} ${sc.text} border-0 text-xs`}>{sc.label}</Badge>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${sc.bar}`}
                              style={{ width: `${matchingScore.score}%` }} />
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 border-0 text-xs flex-shrink-0">
                          Not scored
                        </Badge>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <Button
                          onClick={() => handleUpdateStatus(cv.id, 'ACCEPTED')}
                          disabled={updatingStatus === cv.id || accepted}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 text-xs"
                        >
                          {updatingStatus === cv.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(cv.id, 'REJECTED')}
                          disabled={updatingStatus === cv.id || rejected}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 text-xs"
                        >
                          {updatingStatus === cv.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <XCircle className="h-3.5 w-3.5 mr-1" />}
                          Reject
                        </Button>
                      </div>

                      {/* Chevron */}
                      <div className="flex-shrink-0">
                        {isExpanded
                          ? <ChevronUp className="h-5 w-5 text-muted" />
                          : <ChevronDown className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />}
                      </div>
                    </div>

                    {/* ── Expanded panel ── */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-surface border-t border-color">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">

                          {/* Left */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              Candidate Information
                            </h4>
                            <div className="bg-white rounded-xl border border-color p-4 space-y-3">
                              {[
                                ['Full Name', `${cv.candidat.prenom} ${cv.candidat.nom}`],
                                ['Email', cv.candidat.email],
                                ['CV File', cv.nomFichier],
                                ['Applied', new Date(cv.uploadedAt).toLocaleString()],
                              ].map(([label, value]) => (
                                <div key={label} className="flex justify-between text-sm">
                                  <span className="text-secondary">{label}</span>
                                  <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm items-center">
                                <span className="text-secondary">Status</span>
                                <div className="flex items-center gap-1">
                                  {status.icon}
                                  <Badge className={`${status.cls} border-0 text-xs`}>{status.label}</Badge>
                                </div>
                              </div>
                            </div>

                            {matchingScore && (
                              <div className="bg-white rounded-xl border border-color p-4 space-y-3">
                                <p className="text-sm font-semibold flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-primary" />
                                  AI Score Breakdown
                                </p>
                                <div className="flex items-center gap-3">
                                  <span className={`text-3xl font-bold ${sc?.text}`}>
                                    {Number(matchingScore.score).toFixed(0)}%
                                  </span>
                                  <Badge className={`${sc?.bg} ${sc?.text} border-0`}>{sc?.label}</Badge>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${sc?.bar}`}
                                    style={{ width: `${matchingScore.score}%` }} />
                                </div>
                                {matchingScore.matchedSkills && matchingScore.matchedSkills !== 'None' && (
                                  <div>
                                    <p className="text-xs text-secondary mb-1 font-medium">✅ Matched Skills</p>
                                    <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                      {matchingScore.matchedSkills}
                                    </p>
                                  </div>
                                )}
                                {matchingScore.missingSkills && matchingScore.missingSkills !== 'None' && (
                                  <div>
                                    <p className="text-xs text-secondary mb-1 font-medium">❌ Missing Skills</p>
                                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                      {matchingScore.missingSkills}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              CV Preview
                            </h4>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1 border-primary text-primary hover:bg-primary-light rounded-lg"
                                disabled={viewingId === cv.id}
                                onClick={e => handleViewCV(cv.id, e)}
                              >
                                {viewingId === cv.id
                                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Opening...</>
                                  : <><Eye className="h-4 w-4 mr-2" />View CV File</>}
                              </Button>
                              <Button
                                variant="outline"
                                className="border-color rounded-lg"
                                disabled={downloadingId === cv.id}
                                onClick={e => { e.stopPropagation(); handleDownload(cv.id, cv.nomFichier); }}
                              >
                                {downloadingId === cv.id
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Download className="h-4 w-4" />}
                              </Button>
                            </div>

                            <div className="bg-white rounded-xl border border-color p-4 max-h-72 overflow-y-auto">
                              {cv.texteExtrait ? (
                                <pre className="text-xs text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                                  {cv.texteExtrait}
                                </pre>
                              ) : (
                                <div className="text-center py-10">
                                  <FileText className="h-10 w-10 text-muted mx-auto mb-3" />
                                  <p className="text-sm text-secondary">No text extracted yet</p>
                                  <p className="text-xs text-muted mt-1">Click "Extract & Calculate Scores" to process</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded footer */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-color">
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            {status.icon}
                            <span>Current status: <strong>{status.label}</strong></span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateStatus(cv.id, 'ACCEPTED')}
                              disabled={updatingStatus === cv.id || accepted}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />Accept
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(cv.id, 'REJECTED')}
                              disabled={updatingStatus === cv.id || rejected}
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <XCircle className="h-4 w-4 mr-1" />Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}