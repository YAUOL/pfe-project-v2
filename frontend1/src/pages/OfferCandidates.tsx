import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, FileText, Award, CheckCircle,
  XCircle, Clock, Loader2, Download, ChevronDown, ChevronUp,
  Brain, Sparkles, Search, Eye
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  getCVsWithScores,
  calculateMatchingScore,
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

function isAccepted(statut: string) {
  return statut === 'ACCEPTED' || statut === 'ACCEPTE';
}

function isRejected(statut: string) {
  return statut === 'REJECTED' || statut === 'REFUSE';
}

function statusInfo(statut: string) {
  if (isAccepted(statut)) {
    return {
      label: 'Accepted',
      cls: 'bg-green-100 text-green-700',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    };
  }

  if (isRejected(statut)) {
    return {
      label: 'Rejected',
      cls: 'bg-red-100 text-red-700',
      icon: <XCircle className="h-4 w-4 text-red-500" />
    };
  }

  return {
    label: 'Pending',
    cls: 'bg-blue-100 text-blue-700',
    icon: <Clock className="h-4 w-4 text-blue-500" />
  };
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
  const [offerTitle, setOfferTitle] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCVsWithScores(Number(offerId));
      setCandidates(data);

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
    try {
      setCalculatingScores(true);
      const token = localStorage.getItem('authToken');

      for (const candidate of candidates) {
        await fetch(`http://localhost:8080/api/cv/${candidate.cv.id}/reextract`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        try {
          await calculateMatchingScore(candidate.cv.id);
        } catch (err) {
          console.error(`Score error for CV ${candidate.cv.id}:`, err);
        }
      }

      await loadCandidates();
      alert('✅ Text extracted and scores calculated!');
    } catch (err) {
      console.error('Failed:', err);
      alert('Error during extraction');
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
      console.error('Failed to update status:', err);
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

  const filtered = candidates.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.cv.candidat.prenom.toLowerCase().includes(q) ||
      c.cv.candidat.nom.toLowerCase().includes(q) ||
      c.cv.candidat.email.toLowerCase().includes(q)
    );
  });

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

  const scoredCandidates = candidates.filter(c => c.matchingScore);
  const avgScore = scoredCandidates.length > 0
    ? Math.round(
        scoredCandidates.reduce((sum, c) => sum + Number(c.matchingScore?.score ?? 0), 0) /
        scoredCandidates.length
      )
    : 0;

  return (
    <div className="bg-surface min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <Button
          variant="ghost"
          onClick={() => onNavigate('employer-dashboard')}
          className="mb-6 text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="mb-0">Candidates for: {offerTitle}</h1>
              <p className="text-secondary text-sm">
                Applications ranked by AI matching score
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-color p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-secondary text-xs">Total Applicants</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-color p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgScore}%</p>
                <p className="text-secondary text-xs">Average Score</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-color p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {scoredCandidates.length}/{candidates.length}
                </p>
                <p className="text-secondary text-xs">Scored</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary" />
            <input
              type="text"
              placeholder="Search candidates by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-color rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <Button
            onClick={reExtractAndCalculate}
            disabled={calculatingScores}
            className="bg-primary hover:bg-primary-hover text-white rounded-lg whitespace-nowrap"
          >
            {calculatingScores ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract & Calculate Scores
              </>
            )}
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-color overflow-hidden">
          <div className="p-6 border-b border-color">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="mb-0">Applications ({filtered.length})</h2>
              <span className="text-xs text-secondary ml-2">
                Sorted by matching score ↓
              </span>
            </div>
          </div>

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
                    <div
                      className={`flex items-center gap-4 p-5 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-primary-light/30' : 'hover:bg-surface'
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : cv.id)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      </div>

                      <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {cv.candidat.prenom?.[0]}{cv.candidat.nom?.[0]}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="font-semibold text-sm">
                            {cv.candidat.prenom} {cv.candidat.nom}
                          </p>
                          <div className="flex items-center gap-1">
                            {status.icon}
                            <Badge className={`${status.cls} border-0 text-xs`}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-secondary flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cv.candidat.email}
                          </span>
                          <span>•</span>
                          <span>{timeAgo(cv.uploadedAt)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {cv.nomFichier}
                          </span>
                        </div>
                      </div>

                      {matchingScore && sc ? (
                        <div className="flex items-center gap-3 min-w-[140px] justify-end">
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className={`text-xl font-bold ${sc.text}`}>
                                {Number(matchingScore.score).toFixed(0)}%
                              </span>
                              <Badge className={`${sc.bg} ${sc.text} border-0 text-xs`}>
                                {sc.label}
                              </Badge>
                            </div>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1 ml-auto">
                              <div
                                className={`h-full rounded-full ${sc.bar}`}
                                style={{ width: `${matchingScore.score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">
                          Not scored
                        </Badge>
                      )}

                      <div
                        className="flex items-center gap-2 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          onClick={() => handleUpdateStatus(cv.id, 'ACCEPTED')}
                          disabled={updatingStatus === cv.id || accepted}
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50 rounded-lg px-3 py-2"
                          title="Accept"
                          aria-label="Accept"
                        >
                          {updatingStatus === cv.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Accept
                        </Button>

                        <Button
                          onClick={() => handleUpdateStatus(cv.id, 'REJECTED')}
                          disabled={updatingStatus === cv.id || rejected}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 rounded-lg px-3 py-2"
                          title="Reject"
                          aria-label="Reject"
                        >
                          {updatingStatus === cv.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>

                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-5 pb-5 bg-primary-light/10 border-t border-color/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Candidate Information
                              </h4>

                              <div className="bg-white rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-secondary">Full Name</span>
                                  <span className="font-medium">
                                    {cv.candidat.prenom} {cv.candidat.nom}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-secondary">Email</span>
                                  <span className="font-medium">{cv.candidat.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-secondary">CV File</span>
                                  <span className="font-medium flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {cv.nomFichier}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-secondary">Applied</span>
                                  <span className="font-medium">
                                    {new Date(cv.uploadedAt).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm items-center">
                                  <span className="text-secondary">Status</span>
                                  <div className="flex items-center gap-1">
                                    {status.icon}
                                    <Badge className={`${status.cls} border-0 text-xs`}>
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex gap-2 mb-4">
                              <a
                                href={`http://localhost:8080/api/cv/${cv.id}/file`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  className="w-full border-primary text-primary hover:bg-primary-light rounded-lg"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View CV File
                                </Button>
                              </a>

                              <Button
                                variant="outline"
                                className="border-color rounded-lg"
                                disabled={downloadingId === cv.id}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDownload(cv.id, cv.nomFichier);
                                }}
                              >
                                {downloadingId === cv.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>

                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Eye className="h-4 w-4 text-primary" />
                              CV Content Preview
                            </h4>

                            <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                              {cv.texteExtrait ? (
                                <pre className="text-xs text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                                  {cv.texteExtrait}
                                </pre>
                              ) : (
                                <div className="text-center py-8">
                                  <FileText className="h-8 w-8 text-muted mx-auto mb-2" />
                                  <p className="text-xs text-secondary">
                                    No text extracted — click "Extract & Calculate Scores"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-color/50">
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            {status.icon}
                            <span>
                              Current status: <strong>{status.label}</strong>
                            </span>
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