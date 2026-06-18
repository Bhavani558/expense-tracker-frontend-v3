import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';

const BASE_URL = 'http://localhost:8080/api';
const getToken = () => localStorage.getItem('token');

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [saving, setSaving] = useState(false);
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {});
    // Load profile from backend
    fetch(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setProfile({ name: d.name || '', email: d.email || user?.email || '' });
        setMemberSince(d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
      })
      .catch(() => {
        setProfile({ name: user?.name || '', email: user?.email || '' });
      });
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    setProfileMsg('');
    try {
      const res = await fetch(`${BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(profile),
      });
      const text = await res.text();
      setProfileMsg(text || 'Profile updated successfully!');
    } catch {
      setProfileMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPwMsg('');
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const text = await res.text();
      if (res.ok) {
        setPwMsg(text || 'Password updated successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwError(text || 'Failed to update password.');
      }
    } catch {
      setPwError('Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Profile</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Manage your account information</p>

      <div style={styles.grid}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile Info */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Profile Information</h3>
            {profileMsg && <div style={styles.successMsg}>{profileMsg}</div>}
            <label style={styles.label}>Name</label>
            <input style={styles.input} value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Your full name" />
            <label style={styles.label}>Email</label>
            <input style={styles.input} value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="your@email.com" />
            {memberSince && (
              <>
                <label style={styles.label}>Member Since</label>
                <div style={styles.staticField}>{memberSince}</div>
              </>
            )}
            <button onClick={handleUpdateProfile} disabled={saving} style={styles.btn}>
              {saving ? 'Saving…' : 'Edit Profile'}
            </button>
          </div>

          {/* Account Summary */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Account Summary</h3>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Expenses</div>
                <div style={styles.summaryValue}>{fmt(stats?.totalExpense)}</div>
                <div style={styles.summarySub}>All time</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Total Transactions</div>
                <div style={styles.summaryValue}>{stats?.transactionCount || 0}</div>
                <div style={styles.summarySub}>All time</div>
              </div>
              <div style={styles.summaryItem}>
                <div style={styles.summaryLabel}>Member Since</div>
                <div style={styles.summaryValue2}>{memberSince || '—'}</div>
                <div style={styles.summarySub}>Active member</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Change Password */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Change Password</h3>
          {pwMsg && <div style={styles.successMsg}>{pwMsg}</div>}
          {pwError && <div style={styles.errorMsg}>{pwError}</div>}
          <label style={styles.label}>Current Password</label>
          <input style={styles.input} type="password" placeholder="Enter current password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          <label style={styles.label}>New Password</label>
          <input style={styles.input} type="password" placeholder="Enter new password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          <label style={styles.label}>Confirm New Password</label>
          <input style={styles.input} type="password" placeholder="Confirm new password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
          <button onClick={handleUpdatePassword} disabled={saving} style={styles.btn}>
            {saving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 14, marginBottom: 5 },
  input: { width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  staticField: { padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 14, color: '#374151' },
  btn: { marginTop: 20, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  successMsg: { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14 },
  errorMsg: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 14 },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 8 },
  summaryItem: { textAlign: 'center' },
  summaryLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  summaryValue2: { fontSize: 16, fontWeight: 700, color: '#1e293b' },
  summarySub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
};
