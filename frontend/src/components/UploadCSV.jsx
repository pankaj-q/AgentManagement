import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function UploadCSV() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgentCount = async () => {
      try {
        const res = await api.get('/agents');
        setAgentCount(res.data.length);
      } catch (err) {
        setError('Failed to check agents');
      }
    };
    fetchAgentCount();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();
    const allowed = ['.csv', '.xlsx', '.xls'];
    if (!allowed.includes(ext)) {
      setError('Only CSV, XLSX, and XLS files are allowed');
      setFile(null);
      e.target.value = '';
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (agentCount === 0) {
      setError('Please add at least one agent before uploading');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(`File uploaded successfully! ${res.data.distribution.length} agents received items.`);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload CSV & Distribute</h2>

      <div className="upload-container">
        {error && <div className="error-msg">{error}</div>}
        {success && (
          <div>
            <div className="success-msg">{success}</div>
            <button className="btn btn-sm btn-success" onClick={() => navigate('/distributed-lists')}>
              View Distributed Lists
            </button>
          </div>
        )}

        <div className="form-group">
          <label>Select CSV / Excel File</label>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
          <div className="file-info">
            Accepted formats: CSV, XLSX, XLS. File must have columns: FirstName, Phone, Notes.
          </div>
          <div className="file-info">
            Agents available: {agentCount}
          </div>
        </div>

        {file && (
          <div className="file-info" style={{ color: '#1a73e8' }}>
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        <button
          className="btn"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Uploading & Distributing...' : 'Upload & Distribute'}
        </button>
      </div>
    </div>
  );
}

export default UploadCSV;
