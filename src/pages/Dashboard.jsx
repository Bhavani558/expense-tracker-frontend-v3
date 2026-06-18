import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getDashboard, getCategorySummary, getMonthlyTrend, getBudgetStatus, getExpenses } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#6b7280'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

export default function Dashboard() {
  


  const { user } = useAuth();
  console.log("User Object:", user);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [catData, setCatData] = useState([]);
  const [trend, setTrend] = useState([]);
  const [budget, setBudget] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    getDashboard().then(setStats).catch(() => {});
    getCategorySummary().then((d) =>
      setCatData(Object.entries(d).map(([name, value]) => ({ name, value })))
    ).catch(() => {});
    getMonthlyTrend().then(setTrend).catch(() => {});
    getBudgetStatus().then(setBudget).catch(() => {});
    getExpenses().then((list) => setRecent(list.slice(0, 5))).catch(() => {});
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const statCards = stats
    ? [
        { label: 'Total Expense', value: fmt(stats.totalExpense), sub: 'All time', icon: '💰', color: '#dcfce7', iconBg: '#16a34a' },
        { label: 'Highest Expense', value: fmt(stats.highestExpense), sub: 'Single transaction', icon: '🔥', color: '#fef3c7', iconBg: '#d97706' },
        { label: 'Average Expense', value: fmt(stats.averageExpense), sub: 'Per Transaction', icon: '📉', color: '#fee2e2', iconBg: '#dc2626' },
        { label: 'Transactions', value: stats.transactionCount, sub: 'Total', icon: '🧾', color: '#ede9fe', iconBg: '#7c3aed' },
      ]
    : [];

  return (
    <div style={styles.page}>
      <h2 style={styles.welcome}>
  Welcome Back, {user?.name?.includes('@') ? user?.email?.split('@')[0] : user?.name} 👋
</h2>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Here's your expense overview</p>

      {/* Stat Cards */}
      <div style={styles.cardGrid}>
        {statCards.map((c) => (
          <div key={c.label} style={{ ...styles.statCard, background: c.color }}>
            <div style={{ ...styles.statIcon, background: c.iconBg }}>{c.icon}</div>
            <div>
              <div style={styles.statLabel}>{c.label}</div>
              <div style={styles.statValue}>{c.value}</div>
              <div style={styles.statSub}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Pie */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={catData} cx="40%" cy="50%" outerRadius={80} dataKey="value">
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend layout="vertical" align="right" verticalAlign="middle"
                formatter={(val) => <span style={{ fontSize: 12 }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.legendList}>
            {catData.map((c, i) => (
              <div key={c.name} style={styles.legendItem}>
                <span style={{ ...styles.dot, background: COLORS[i % COLORS.length] }} />
                <span style={{ flex: 1 }}>{c.name}</span>
                <span style={{ fontWeight: 600 }}>{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Line */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Progress */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Budget Progress</h3>
          {budget ? (
            <>
              <div style={styles.budgetLabel}>Monthly Budget</div>
              <div style={styles.budgetAmount}>{fmt(budget.budget)}</div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min(budget.percentageUsed, 100)}%`,
                    background: budget.percentageUsed >= 100 ? '#ef4444' : '#22c55e',
                  }}
                />
              </div>
              <div style={styles.budgetMeta}>
                <span>{fmt(budget.spent)} spent</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>{budget.percentageUsed}%</span>
              </div>
              <div style={{
                marginTop: 16, background: budget.percentageUsed >= 100 ? '#fef2f2' : '#f0fdf4',
                color: budget.percentageUsed >= 100 ? '#dc2626' : '#16a34a',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, textAlign: 'center',
              }}>
                {budget.alert}
              </div>
            </>
          ) : (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>No budget set yet. Go to Budget Goals to set one.</p>
          )}
          <button onClick={() => navigate('/expenses')} style={styles.viewBtn}>View All Expenses</button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Recent Transactions</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Title', 'Category', 'Amount', 'Date'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((e) => (
              <tr key={e.id} style={styles.tr}>
                <td style={styles.td}>{e.title}</td>
                <td style={styles.td}>{e.category}</td>
                <td style={styles.td}>{fmt(e.amount)}</td>
                <td style={styles.td}>{e.date}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No transactions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1280, margin: '0 auto' },
  welcome: { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 },
  statIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: 500 },
  statValue: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  statSub: { fontSize: 11, color: '#9ca3af' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 },
  chartCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  legendList: { marginTop: 12 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '3px 0' },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  budgetLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  budgetAmount: { fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
  progressBar: { background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.3s' },
  budgetMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' },
  viewBtn: {
    marginTop: 16, width: '100%', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  tableCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 14px', fontSize: 14, color: '#374151' },
};
