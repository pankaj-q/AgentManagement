import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DistributedLists() {
  const [distribution, setDistribution] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribution();
  }, []);

  const fetchDistribution = async () => {
    try {
      const res = await api.get('/upload/lists');
      setDistribution(res.data);
    } catch (err) {
      setError('Failed to fetch distributed lists');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h2>Distributed Lists</h2>
      {error && <div className="error-msg">{error}</div>}

      {distribution.length === 0 ? (
        <p style={{ color: '#999' }}>No lists have been distributed yet. Upload a CSV file first.</p>
      ) : (
        <div className="distribution-grid">
          {distribution.map((group, idx) => (
            <div className="distribution-card" key={idx}>
              <h3>{group.agent.name} ({group.agent.email})</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>FirstName</th>
                    <th>Phone</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{item.firstName}</td>
                      <td>{item.phone}</td>
                      <td>{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="item-count">Total items: {group.items.length}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DistributedLists;
