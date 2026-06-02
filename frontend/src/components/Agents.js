import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Agents() {
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents');
      setAgents(res.data);
    } catch (err) {
      setError('Failed to fetch agents');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.mobile || !form.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/agents', form);
      setAgents([res.data, ...agents]);
      setForm({ name: '', email: '', mobile: '', password: '' });
      setSuccess('Agent added successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add agent');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      await api.delete(`/agents/${id}`);
      setAgents(agents.filter((a) => a._id !== id));
      setSuccess('Agent deleted successfully');
    } catch (err) {
      setError('Failed to delete agent');
    }
  };

  return (
    <div>
      <h2>Manage Agents</h2>

      <div className="add-agent-form">
        <h3>Add New Agent</h3>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Agent name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Agent email"
              />
            </div>
            <div className="form-group">
              <label>Mobile (with country code)</label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
              />
            </div>
          </div>
          <button className="btn btn-success" style={{ marginTop: 16 }} disabled={loading}>
            {loading ? 'Adding...' : 'Add Agent'}
          </button>
        </form>
      </div>

      <div className="agents-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#999' }}>
                  No agents added yet
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent._id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.mobile}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(agent._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Agents;
