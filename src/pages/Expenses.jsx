import { useEffect, useState } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, advancedFilter } from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];
const CAT_COLORS = {
  Food: '#22c55e', Transport: '#3b82f6', Shopping: '#f59e0b',
  Bills: '#ef4444', Entertainment: '#a855f7', Others: '#6b7280',
};
const PAGE_SIZE = 10;

const emptyForm = { title: '', amount: '', category: 'Food', date: '', description: '' };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState({ category: 'All', keyword: '', start: '', end: '' });
  const [loading, setLoading] = useState(false);

  const load = () => getExpenses().then((d) => { setExpenses(d); setFiltered(d); });

  useEffect(() => { load(); }, []);

  const applyFilter = async () => {
    try {
      const result = await advancedFilter(filter);
      setFiltered(result);
      setPage(1);
    } catch { setFiltered(expenses); }
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (e) => {
    setForm({ title: e.title, amount: e.amount, category: e.category, date: e.date, description: e.description || '' });
    setEditId(e.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount || !form.date) return alert('Please fill all required fields');
    setLoading(true);
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editId) await updateExpense(editId, payload);
      else await addExpense(payload);
      setShowModal(false);
      load();
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await deleteExpense(id);
    load();
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Expenses</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Manage and track all your expenses</p>
        </div>
        <button onClick={openAdd} style={styles.addBtn}>+ Add Expense</button>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <select style={styles.select} value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input style={styles.input} placeholder="Search expenses…" value={filter.keyword}
          onChange={(e) => setFilter({ ...filter, keyword: e.target.value })} />
        <input style={styles.input} type="date" value={filter.start}
          onChange={(e) => setFilter({ ...filter, start: e.target.value })} />
        <input style={styles.input} type="date" value={filter.end}
          onChange={(e) => setFilter({ ...filter, end: e.target.value })} />
        <button onClick={applyFilter} style={styles.filterBtn}>Filter</button>
        <button onClick={() => { setFilter({ category: 'All', keyword: '', start: '', end: '' }); load(); }} style={styles.resetBtn}>Reset</button>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Title', 'Category', 'Amount', 'Date', 'Actions'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((e) => (
              <tr key={e.id} style={styles.tr}>
                <td style={styles.td}>{e.title}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: CAT_COLORS[e.category] + '22', color: CAT_COLORS[e.category] }}>
                    {e.category}
                  </span>
                </td>
                <td style={styles.td}>{fmt(e.amount)}</td>
                <td style={styles.td}>{e.date}</td>
                <td style={styles.td}>
                  <button onClick={() => openEdit(e)} style={styles.editBtn}>✏️</button>
                  <button onClick={() => handleDelete(e.id)} style={styles.delBtn}>🗑️</button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>No expenses found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} expenses
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} style={styles.pageBtn} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ ...styles.pageBtn, ...(p === page ? styles.activePage : {}) }}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={styles.pageBtn} disabled={page === totalPages}>›</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{editId ? 'Edit Expense' : 'Add Expense'}</h3>
            <label style={styles.label}>Title *</label>
            <input style={styles.minput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Grocery Shopping" />
            <label style={styles.label}>Amount *</label>
            <input style={styles.minput} type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            <label style={styles.label}>Category *</label>
            <select style={styles.minput} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <label style={styles.label}>Date *</label>
            <input style={styles.minput} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <label style={styles.label}>Description</label>
            <input style={styles.minput} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleSave} disabled={loading} style={styles.saveBtn}>{loading ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 24, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
  addBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  filterBar: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  select: { border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#fff' },
  input: { border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14, minWidth: 140 },
  filterBtn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  resetBtn: { background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer', fontSize: 14 },
  tableWrap: { background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: 14, color: '#374151' },
  badge: { borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, marginRight: 6 },
  delBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  pageBtn: { border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13 },
  activePage: { background: '#2563eb', color: '#fff', border: '1px solid #2563eb' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal: { background: '#fff', borderRadius: 12, padding: 28, width: 420, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 12, marginBottom: 4 },
  minput: { width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  saveBtn: { flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  cancelBtn: { flex: 1, background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
};
