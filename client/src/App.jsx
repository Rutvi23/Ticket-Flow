import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketForm from './pages/TicketForm';
import TicketDetail from './pages/TicketDetail';
import Categories from './pages/Categories';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <>
      <header className="nav">
        <strong className="brand">TicketFlow</strong>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          {user.role === 'agent' && <NavLink to="/categories">Categories</NavLink>}
        </nav>
        <div className="who">
          {user.name} ({user.role})
          <button className="btn small ghost" onClick={() => { logout(); nav('/login'); }}>Log out</button>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}

const Page = ({ roles, children }) => (
  <ProtectedRoute roles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Page><Dashboard /></Page>} />
      <Route path="/tickets" element={<Page><Tickets /></Page>} />
      <Route path="/tickets/new" element={<Page><TicketForm /></Page>} />
      <Route path="/tickets/:id" element={<Page><TicketDetail /></Page>} />
      <Route path="/tickets/:id/edit" element={<Page><TicketForm /></Page>} />
      <Route path="/categories" element={<Page roles={['agent']}><Categories /></Page>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
