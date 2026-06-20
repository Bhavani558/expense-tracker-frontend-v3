const BASE_URL = 'https://expense-tracker-backend-v3.onrender.com/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// AUTH
export const register = (data) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.text());

export const login = (data) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.text());

// EXPENSES
export const getExpenses = () =>
  fetch(`${BASE_URL}/expenses`, { headers: headers() }).then((r) => r.json());

export const addExpense = (data) =>
  fetch(`${BASE_URL}/expenses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateExpense = (id, data) =>
  fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteExpense = (id) =>
  fetch(`${BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });

export const advancedFilter = (params) => {
  const q = new URLSearchParams();
  if (params.category && params.category !== 'All') q.append('category', params.category);
  if (params.keyword) q.append('keyword', params.keyword);
  if (params.start) q.append('start', params.start);
  if (params.end) q.append('end', params.end);
  return fetch(`${BASE_URL}/expenses/advanced-filter?${q}`, { headers: headers() }).then((r) => r.json());
};

// ANALYTICS
export const getDashboard = () =>
  fetch(`${BASE_URL}/expenses/dashboard`, { headers: headers() }).then((r) => r.json());

export const getCategorySummary = () =>
  fetch(`${BASE_URL}/expenses/category-summary`, { headers: headers() }).then((r) => r.json());

export const getMonthlyTrend = () =>
  fetch(`${BASE_URL}/expenses/monthly-trend`, { headers: headers() }).then((r) => r.json());

// BUDGET
export const getBudgetStatus = () =>
  fetch(`${BASE_URL}/budget/status`, { headers: headers() }).then((r) => r.json());

export const saveBudget = (monthlyBudget) =>
  fetch(`${BASE_URL}/budget`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ monthlyBudget }),
  }).then((r) => r.json());

// REPORT
export const downloadPdf = () => {
  fetch(`${BASE_URL}/reports/pdf`, { headers: headers() })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expense-report.pdf';
      a.click();
    });
};
