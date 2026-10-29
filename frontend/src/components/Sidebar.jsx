import { MenuIcon, TasksIcon, SettingsIcon } from './Icons.jsx';

export default function Sidebar({ open, onToggle }) {
  return (
    <aside className={`sidebar ${open ? '' : 'collapsed'}`}>
      <button className="icon-btn menu-btn" onClick={onToggle} aria-label="Alternar menu" aria-expanded={open}>
        <MenuIcon />
      </button>

      <div className="profile">
        <img
          className="avatar"
          src="https://i.pravatar.cc/120?img=47"
          alt="Jane Doe"
          width="48"
          height="48"
        />
        <strong className="profile-name">Jane Doe</strong>
        <span className="profile-mail">janedoe@gmail.com</span>
      </div>

      <nav className="nav">
        <a className="nav-item active" href="#tasks" aria-current="page">
          <TasksIcon /> <span>My Tasks</span>
        </a>
        <a className="nav-item" href="#settings">
          <SettingsIcon /> <span>Settings</span>
        </a>
      </nav>
    </aside>
  );
}
