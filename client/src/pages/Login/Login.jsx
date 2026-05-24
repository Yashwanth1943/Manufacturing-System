import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth.js';
import './Login.css';

const roleDestinations = {
  admin: '/admin',
  production: '/production',
  defects: '/defects',
  quality: '/quality',
};

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(formData);
      navigate(roleDestinations[user.role]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Factory operations preview">
        <div className="factory-frame">
          <div className="factory-grid">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="conveyor">
            <div className="belt-line" />
            <div className="biscuit biscuit-one" />
            <div className="biscuit biscuit-two" />
            <div className="biscuit biscuit-three" />
          </div>
          <div className="machine-card">
            <p>Line A2</p>
            <strong>98.4%</strong>
            <span>Oven stability</span>
          </div>
          <div className="machine-card compact">
            <p>QC Gate</p>
            <strong>Live</strong>
          </div>
        </div>
      </section>

      <section className="login-card" aria-label="Login form">
        <div className="login-brand">
          <div className="brand-mark">MF</div>
          <div>
            <h1>Manufacturing Control</h1>
            <p>Biscuit production and defect tracking</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <label className="login-field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="operator@factory.com"
              required
            />
          </label>

          <label className="login-field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter secure password"
              required
            />
          </label>

          <label className="login-field" htmlFor="role">
            <span>Role</span>
            <select id="role" name="role" value={formData.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="production">Production Operator</option>
              <option value="defects">Defects Team</option>
              <option value="quality">Quality Inspector</option>
            </select>
          </label>

          <button className="login-button" type="submit" disabled={loading}>
            <span className="button-icon">IN</span>
            {loading ? 'Starting session...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
