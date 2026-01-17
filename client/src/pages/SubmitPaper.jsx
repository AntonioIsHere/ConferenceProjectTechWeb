import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SubmitPaper() {
    const navigate = useNavigate();
    const [conferences, setConferences] = useState([]);
    const [title, setTitle] = useState('');
    const [conferenceId, setConferenceId] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConferences();
    }, []);

    const fetchConferences = async () => {
        try {
            const res = await axios.get('/api/conferences');
            setConferences(res.data);
        } catch (error) {
            console.error('Error fetching conferences:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Please select a file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('conferenceId', conferenceId);
        formData.append('file', file);

        try {
            await axios.post('/api/papers', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/papers');
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting paper');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="page-title" style={{ marginBottom: '2rem' }}>Submit Paper</h1>

            {error && <div className="message message-error">{error}</div>}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Paper Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., A Novel Approach to Machine Learning"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Conference *</label>
                        <select
                            className="form-select"
                            value={conferenceId}
                            onChange={(e) => setConferenceId(e.target.value)}
                            required
                        >
                            <option value="">Select a conference</option>
                            {conferences.map(conf => (
                                <option key={conf.id} value={conf.id}>
                                    {conf.name} ({new Date(conf.startDate).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Paper Document * (PDF or DOC, max 10MB)</label>
                        <div
                            className="form-file"
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                            {file ? (
                                <div>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                                    <div style={{ fontWeight: '500' }}>{file.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
                                    <div>Click to upload or drag and drop</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        PDF, DOC up to 10MB
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Paper'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/papers')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
