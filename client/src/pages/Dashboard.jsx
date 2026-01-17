import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ conferences: 0, papers: 0, reviews: 0 });
    const [recentConferences, setRecentConferences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const confRes = await axios.get('/api/conferences');
            setRecentConferences(confRes.data.slice(0, 3));

            let paperCount = 0;
            let reviewCount = 0;

            if (user.role === 'AUTHOR' || user.role === 'ORGANIZER') {
                try {
                    const paperRes = await axios.get('/api/papers');
                    paperCount = paperRes.data.length;
                } catch (e) { }
            }

            if (user.role === 'REVIEWER') {
                try {
                    const reviewRes = await axios.get('/api/reviews/my');
                    reviewCount = reviewRes.data.length;
                } catch (e) { }
            }

            setStats({
                conferences: confRes.data.length,
                papers: paperCount,
                reviews: reviewCount
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Welcome, {user.name}!</h1>
                {user.role === 'ORGANIZER' && (
                    <Link to="/conferences/new" className="btn btn-primary">+ Create Conference</Link>
                )}
                {user.role === 'AUTHOR' && (
                    <Link to="/papers/submit" className="btn btn-primary">+ Submit Paper</Link>
                )}
            </div>

            <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div className="card-body">
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {stats.conferences}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Conferences</div>
                    </div>
                </div>

                {(user.role === 'AUTHOR' || user.role === 'ORGANIZER') && (
                    <div className="card">
                        <div className="card-body">
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--secondary)' }}>
                                {stats.papers}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                {user.role === 'AUTHOR' ? 'My Papers' : 'Total Papers'}
                            </div>
                        </div>
                    </div>
                )}

                {user.role === 'REVIEWER' && (
                    <div className="card">
                        <div className="card-body">
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                                {stats.reviews}
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>Assigned Reviews</div>
                        </div>
                    </div>
                )}
            </div>

            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Recent Conferences</h2>

            {recentConferences.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <div className="empty-state-title">No conferences yet</div>
                    <p>Check back later or create one if you're an organizer.</p>
                </div>
            ) : (
                <div className="grid grid-3">
                    {recentConferences.map(conf => (
                        <div key={conf.id} className="card">
                            <div className="card-header">
                                <div>
                                    <h3 className="card-title">{conf.name}</h3>
                                    <div className="card-subtitle">📍 {conf.location}</div>
                                </div>
                            </div>
                            <div className="card-body">
                                <p style={{ marginBottom: '0.5rem' }}>{conf.description?.substring(0, 100)}...</p>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    📅 {new Date(conf.startDate).toLocaleDateString()} - {new Date(conf.endDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="card-footer">
                                <Link to="/conferences" className="btn btn-secondary btn-sm">View Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
