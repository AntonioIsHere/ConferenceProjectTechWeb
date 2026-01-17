import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ConferenceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        location: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            fetchConference();
        }
    }, [id]);

    const fetchConference = async () => {
        try {
            const res = await axios.get(`/api/conferences/${id}`);
            const conf = res.data;
            setForm({
                name: conf.name,
                location: conf.location,
                description: conf.description || '',
                startDate: conf.startDate,
                endDate: conf.endDate
            });
        } catch (error) {
            setError('Conference not found');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isEdit) {
                await axios.put(`/api/conferences/${id}`, form);
            } else {
                await axios.post('/api/conferences', form);
            }
            navigate('/conferences');
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving conference');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 className="page-title" style={{ marginBottom: '2rem' }}>
                {isEdit ? 'Edit Conference' : 'Create Conference'}
            </h1>

            {error && <div className="message message-error">{error}</div>}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Conference Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., International AI Conference 2024"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            placeholder="e.g., Berlin, Germany"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe the conference theme, topics, etc."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Start Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">End Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (isEdit ? 'Update Conference' : 'Create Conference')}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/conferences')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
