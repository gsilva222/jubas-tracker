import { useState, useEffect } from 'react';
import { getAccounts } from './api/accounts';
import AccountRow from './components/AccountRow';
import AddAccountModal from './components/AddAccountModal';
import './App.css';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (newAccount) => {
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleUpdate = (updated) => {
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleDelete = (id) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Stats
  const withJubas = accounts.filter(a => a.jubas).length;
  const clean = accounts.length - withJubas;

  return (
    <div className="app">
      <div className="container">

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <img
              src="/logo.png"
              alt="Jubas Tracker"
              className="header-logo"
            />
            <div className="header-title">
              <h1>Jubas Tracker</h1>
              <p className="subtitle">
                JUBAS has detected irregular gameplay and has canceled the match.
                The player who was flagged by JUBAS and their party have received a cooldown.
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Account
          </button>
        </header>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-chip stat-total">📋 {accounts.length} accounts</div>
          <div className="stat-chip stat-jubas">🔴 {withJubas} with jubas</div>
          <div className="stat-chip stat-clean">🟢 {clean} clean</div>
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div className="loading">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="empty-state">
              <p>No accounts yet.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add your first account</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Jubas?</th>
                  <th>Cooldown</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {showModal && (
        <AddAccountModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}