import { useState } from 'react';
import { createAccount } from '../api/accounts';

const COOLDOWNS = ['20h', '7d', '31d', '181d', '364d'];

export default function AddAccountModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [jubas, setJubas] = useState(false);
  const [cooldown, setCooldown] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Account name is required');

    setLoading(true);
    setError('');
    try {
      const newAccount = await createAccount({
        name: name.trim(),
        jubas,
        cooldown: jubas ? cooldown : null,
      });
      onAdd(newAccount);
      onClose();
    } catch (err) {
      setError('Failed to create account. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Account</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Account Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. mosquito 1"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={jubas ? 'yes' : 'no'} onChange={e => setJubas(e.target.value === 'yes')}>
              <option value="no">🟢 Clean</option>
              <option value="yes">🔴 Got Jubas</option>
            </select>
          </div>

          {jubas && (
            <div className="form-group">
              <label>Cooldown Duration</label>
              <select value={cooldown} onChange={e => setCooldown(e.target.value)}>
                {COOLDOWNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-save">
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}