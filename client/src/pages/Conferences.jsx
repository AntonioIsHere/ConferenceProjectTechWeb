import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Conferences() {
    const { user } = useAuth();
    const [conferences, setConferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReviewerModal, setShowReviewerModal] = useState(null);
    const [allReviewers, setAllReviewers] = useState([]);
    const [selectedReviewers, setSelectedReviewers] = useState([]);

    useEffect(() => {
        fetchConferences();
        if (user.role === 'ORGANIZER') {
            fetchReviewers();
        }
    }, []);

    const fetchConferences = async () => {
        try {
            const res = await axios.get('/api/conferences');
            setConferences(res.data);
        } catch (error) {
            console.error('Error fetching conferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewers = async () => {
        try {
            const res = await axios.get('/api/conferences/users/reviewers');
            setAllReviewers(res.data);
        } catch (error) {
            console.error('Error fetching reviewers:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this conference?')) return;
        try {
            await axios.delete(`/api/conferences/${id}`);
            setConferences(conferences.filter(c => c.id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting conference');
        }
    };

    const openReviewerModal = (conference) => {
        setShowReviewerModal(conference);
        setSelectedReviewers(conference.reviewers?.map(r => r.id) || []);
    };

    const handleReviewerToggle = (reviewerId) => {
        setSelectedReviewers(prev =>
            prev.includes(reviewerId)
                ? prev.filter(id => id !== reviewerId)
                : [...prev, reviewerId]
        );
    };

    const saveReviewers = async () => {
        try {
            await axios.post(`/api/conferences/${showReviewerModal.id}/reviewers`, {
                reviewerIds: selectedReviewers
            });
            fetchConferences();
            setShowReviewerModal(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Error assigning reviewers');
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Conferences</h1>
                {user.role === 'ORGANIZER' && (
                    <Link to="/conferences/new" className="btn btn-primary">+ Create Conference</Link>
                )}
            </div>

            {conferences.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <div className="empty-state-title">No conferences available</div>
                    <p>Be the first to create one!</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {conferences.map(conf => (
                        <div key={conf.id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{conf.name}</h3>
                                    <div className="card-subtitle">📍 {conf.location}</div>
                                </div>
                                {conf.organizer && (
                                    <span className="status-badge status-submitted">
                                        by {conf.organizer.name}
                                    </span>
                                )}
                            </div>
                            <div className="card-body">
                                <p style={{ marginBottom: '1rem' }}>{conf.description}</p>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    📅 {new Date(conf.startDate).toLocaleDateString()} - {new Date(conf.endDate).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    👥 {conf.reviewers?.length || 0} reviewers assigned
                                </div>
                            </div>

                            {user.role === 'ORGANIZER' && conf.organizerId === user.id && (
                                <div className="card-footer">
                                    <Link to={`/conferences/${conf.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                                    <button onClick={() => openReviewerModal(conf)} className="btn btn-secondary btn-sm">
                                        Assign Reviewers
                                    </button>
                                    <button onClick={() => handleDelete(conf.id)} className="btn btn-danger btn-sm">Delete</button>
                                </div>
                            )}

                            {user.role === 'AUTHOR' && (
                                <div className="card-footer">
                                    <Link to="/papers/submit" className="btn btn-primary btn-sm">Submit Paper</Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showReviewerModal && (
                <div className="modal-overlay" onClick={() => setShowReviewerModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Assign Reviewers</h3>
                            <button className="modal-close" onClick={() => setShowReviewerModal(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {allReviewers.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>No reviewers registered yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {allReviewers.map(reviewer => (
                                        <label key={reviewer.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedReviewers.includes(reviewer.id)}
                                                onChange={() => handleReviewerToggle(reviewer.id)}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{reviewer.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{reviewer.email}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowReviewerModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={saveReviewers}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
