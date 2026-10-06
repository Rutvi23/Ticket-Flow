import { useEffect, useState } from 'react';
import 'chart.js/auto';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import api, { errMsg } from '../api';
import { useToast } from '../ToastContext';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const countOf = (rows, key, value) => rows.find((r) => r[key] === value)?.count || 0;

export default function Dashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data)).catch((e) => toast(errMsg(e), 'error'));
  }, []);

  if (!stats) return <p className="muted">Loading dashboard...</p>;

  const statusCounts = STATUSES.map((s) => countOf(stats.byStatus, 'status', s));
  const total = statusCounts.reduce((a, b) => a + b, 0);

  return (
    <>
      <h1>Dashboard</h1>
      <div className="kpis">
        <div className="card kpi"><span>Total tickets</span><b>{total}</b></div>
        <div className="card kpi"><span>Open</span><b>{statusCounts[0]}</b></div>
        <div className="card kpi"><span>In progress</span><b>{statusCounts[1]}</b></div>
        <div className="card kpi"><span>Resolved or closed</span><b>{statusCounts[2] + statusCounts[3]}</b></div>
      </div>

      {total === 0 ? (
        <div className="card empty">No tickets yet. Create your first ticket to see charts here.</div>
      ) : (
        <div className="charts">
          <div className="card">
            <h3>Tickets by status</h3>
            <Doughnut data={{ labels: ['Open', 'In progress', 'Resolved', 'Closed'], datasets: [{ data: statusCounts, backgroundColor: ['#e0852d', '#2f6fdb', '#2e9d6a', '#8a93a3'] }] }} />
          </div>
          <div className="card">
            <h3>Tickets by priority</h3>
            <Bar options={{ plugins: { legend: { display: false } } }} data={{ labels: ['Low', 'Medium', 'High'], datasets: [{ data: PRIORITIES.map((p) => countOf(stats.byPriority, 'priority', p)), backgroundColor: ['#8a93a3', '#2f6fdb', '#d64545'] }] }} />
          </div>
          <div className="card wide">
            <h3>Tickets created in the last 7 days</h3>
            <Line options={{ plugins: { legend: { display: false } } }} data={{ labels: stats.perDay.map((d) => d.day), datasets: [{ data: stats.perDay.map((d) => d.count), borderColor: '#2f6fdb', tension: 0.3 }] }} />
          </div>
        </div>
      )}
    </>
  );
}
