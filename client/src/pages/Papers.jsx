import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Papers() {
    const { user } = useAuth();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revisionFile, setRevisionFile] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const res = await axios.get('/api/papers');
            setPapers(res.data);
        } catch (error) {
            console.error('Error fetching papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRevisionUpload = async (paperId) => {
        if (!revisionFile) return;

        setUploadingId(paperId);
        const formData = new FormData();
        formData.append('file', revisionFile);

        try {
            await axios.put(`/api/papers/${paperId}/revision`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setRevisionFile(null);
            fetchPapers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error uploading revision');
        } finally {
            setUploadingId(null);
        }
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status?.toLowerCase()}`;
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">
                    {user.role === 'AUTHOR' ? 'My Papers' : 'All Papers'}
                </h1>
                {user.role === 'AUTHOR' && (
                    <Link to="/papers/submit" className="btn btn-primary">+ Submit Paper</Link>
                )}
            </div>

            {papers.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📄</div>
                    <div className="empty-state-title">No papers found</div>
                    {user.role === 'AUTHOR' && (
                        <Link to="/papers/submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            Submit Your First Paper
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-2">
                    {papers.map(paper => (
                        <div key={paper.id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{paper.title}</h3>
                                    <div className="card-subtitle">
                                        Conference: {paper.Conference?.name || 'N/A'}
                                    </div>
                                </div>
                                <span className={getStatusClass(paper.status)}>
                                    {paper.status?.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="card-body">
                                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-muted)' }}>Version:</span>{' '}
                                        <strong>{paper.version}</strong>
                                    </div>
                                    {paper.author && (
                                        <div>
                                            <span style={{ color: 'var(--text-muted)' }}>Author:</span>{' '}
                                            {paper.author.name}
                                        </div>
                                    )}
                                    <div>
                                        <a
                                            href={paper.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'var(--primary-light)' }}
                                        >
                                            📎 Download Paper
                                        </a>
                                    </div>
                                </div>

                                {paper.Reviews && paper.Reviews.length > 0 && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Reviews:</div>
                                        {paper.Reviews.map(review => (
                                            <div key={review.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span>{review.reviewer?.name || 'Reviewer'}</span>
                                                    <span className={getStatusClass(review.status)}>
                                                        {review.status?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {review.feedback && (
                                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                        "{review.feedback}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {user.role === 'AUTHOR' && paper.status === 'REVISION_REQUESTED' && (
                                <div className="card-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--warning)' }}>
                                        📝 Revision requested. Please upload an updated version.
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setRevisionFile(e.target.files[0])}
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleRevisionUpload(paper.id)}
                                        disabled={!revisionFile || uploadingId === paper.id}
                                    >
                                        {uploadingId === paper.id ? 'Uploading...' : 'Upload Revision'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
