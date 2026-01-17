import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReview, setActiveReview] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get('/api/reviews/my');
            setReviews(res.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (review) => {
        setActiveReview(review);
        setFeedback(review.feedback || '');
        setStatus(review.status === 'PENDING' ? '' : review.status);
    };

    const submitReview = async () => {
        if (!status) {
            alert('Please select a decision');
            return;
        }

        setSubmitting(true);
        try {
            await axios.put(`/api/reviews/${activeReview.id}`, { status, feedback });
            setActiveReview(null);
            fetchReviews();
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting review');
        } finally {
            setSubmitting(false);
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
                <h1 className="page-title">My Reviews</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <div className="empty-state-title">No papers to review</div>
                    <p>You'll see papers here when they're assigned to you.</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {reviews.map(review => (
                        <div key={review.id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{review.Paper?.title}</h3>
                                    <div className="card-subtitle">
                                        by {review.Paper?.author?.name || 'Author'}
                                    </div>
                                </div>
                                <span className={getStatusClass(review.status)}>
                                    {review.status?.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="card-body">
                                <div style={{ marginBottom: '1rem' }}>
                                    <a
                                        href={review.Paper?.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--primary-light)' }}
                                    >
                                        📎 Download Paper (v{review.Paper?.version})
                                    </a>
                                </div>

                                {review.feedback && (
                                    <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            Your feedback:
                                        </div>
                                        <p style={{ margin: 0 }}>{review.feedback}</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openReviewModal(review)}
                                >
                                    {review.status === 'PENDING' ? 'Submit Review' : 'Edit Review'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeReview && (
                <div className="modal-overlay" onClick={() => setActiveReview(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Review: {activeReview.Paper?.title}</h3>
                            <button className="modal-close" onClick={() => setActiveReview(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Decision *</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">Select decision</option>
                                    <option value="ACCEPTED">Accept Paper</option>
                                    <option value="REVISION_REQUESTED">Request Revision</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Feedback to Author</label>
                                <textarea
                                    className="form-textarea"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide constructive feedback for the author..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setActiveReview(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
