import { useState } from 'react';
import { updateAccount, deleteAccount } from '../api/accounts';
import CountdownTimer from './CountdownTimer';

const COOLDOWNS = ['20h', '7d', '31d', '181d', '364d'];

// Converts a UTC date string to the format datetime-local needs: "YYYY-MM-DDTHH:mm"
function toDatetimeLocal(utcString) {
  if (!utcString) return '';
  const d = new Date(utcString);
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins  = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

export default function AccountRow({ account, onUpdate, onDelete }) {
  const [editing, setEditing]       = useState(false);
  const [name, setName]             = useState(account.name);
  const [jubas, setJubas]           = useState(account.jubas);
  const [cooldown, setCooldown]     = useState(account.cooldown || '7d');
  // 'preset' = use fixed dropdown | 'custom' = manual datetime picker
  const [mode, setMode]             = useState('preset');
  const [customUntil, setCustomUntil] = useState(
    account.jubas_until ? toDatetimeLocal(account.jubas_until) : ''
  );
  const [loading, setLoading]       = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { name, jubas };

      if (jubas) {
        if (mode === 'custom') {
          payload.custom_until = new Date(customUntil).toISOString();
        } else {
          payload.cooldown = cooldown;
        }
      }

      const updated = await updateAccount(account.id, payload);
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${account.name}"?`)) return;
    await deleteAccount(account.id);
    onDelete(account.id);
  };

  const handleCancelEdit = () => {
    // Reset state to original account values
    setName(account.name);
    setJubas(account.jubas);
    setCooldown(account.cooldown || '7d');
    setMode('preset');
    setCustomUntil(account.jubas_until ? toDatetimeLocal(account.jubas_until) : '');
    setEditing(false);
  };

  return (
    <tr className={account.jubas ? 'row-jubas' : 'row-clean'}>

      {/* Account name */}
      <td>
        {editing
          ? <input value={name} onChange={e => setName(e.target.value)} className="edit-input" />
          : <span className="acc-name">{account.name}</span>
        }
      </td>

      {/* Jubas? status */}
      <td>
        {editing ? (
          <select value={jubas ? 'yes' : 'no'} onChange={e => setJubas(e.target.value === 'yes')} className="edit-select">
            <option value="yes">🔴 Got Jubas</option>
            <option value="no">🟢 Clean</option>
          </select>
        ) : (
          <span className={`badge ${account.jubas ? 'badge-jubas' : 'badge-clean'}`}>
            {account.jubas ? '🔴 Got Jubas' : '🟢 Clean'}
          </span>
        )}
      </td>

      {/* Cooldown */}
      <td>
        {editing && jubas ? (
          <div className="cooldown-edit">
            {/* Toggle between preset and custom */}
            <div className="mode-toggle">
              <button
                className={`mode-btn ${mode === 'preset' ? 'active' : ''}`}
                onClick={() => setMode('preset')}
                type="button"
              >Preset</button>
              <button
                className={`mode-btn ${mode === 'custom' ? 'active' : ''}`}
                onClick={() => setMode('custom')}
                type="button"
              >Custom</button>
            </div>

            {mode === 'preset' ? (
              <select value={cooldown} onChange={e => setCooldown(e.target.value)} className="edit-select">
                {COOLDOWNS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                type="datetime-local"
                value={customUntil}
                onChange={e => setCustomUntil(e.target.value)}
                className="edit-input"
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        ) : account.jubas ? (
          <CountdownTimer remainingSeconds={account.remaining_seconds} />
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="actions-cell">
        {editing ? (
          <>
            <button onClick={handleSave} disabled={loading} className="btn btn-save">
              {loading ? '...' : 'Save'}
            </button>
            <button onClick={handleCancelEdit} className="btn btn-cancel">Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="btn btn-edit">Edit</button>
            <button onClick={handleDelete} className="btn btn-delete">Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}