import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth.js';
import useToast from '../context/useToast.js';
import './ProfileDropdown.css';

function ProfileDropdown({ user }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-header">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Factory User')}&background=176b5b&color=fff`} alt="" />
        <div>
          <strong>{user?.name || 'Factory User'}</strong>
          <span>{user?.email || 'user@factory.com'}</span>
          <small>{user?.role || 'operator'}</small>
        </div>
      </div>
      <button type="button" onClick={() => showToast('Profile settings are synced with the authenticated account', 'info')}>Profile settings</button>
      <button type="button" onClick={() => showToast('Shift preferences saved for this session', 'info')}>Shift preferences</button>
      <button className="profile-logout" type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default ProfileDropdown;
