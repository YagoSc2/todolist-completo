import { EditIcon, TrashIcon } from './Icons.jsx';

export function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const done = Boolean(task.completed);
  const dueISO = task.due_date ? task.due_date.slice(0, 10) : null;
  const overdue = !done && dueISO !== null && dueISO < todayISO();

  return (
    <li className={`task ${done ? 'done' : ''} ${overdue ? 'overdue' : ''}`}>
      <label className="check">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task)}
          aria-label={`Marcar "${task.title}" como ${done ? 'pendente' : 'concluída'}`}
        />
        <span className="box" aria-hidden="true">
          <svg viewBox="0 0 12 12" width="10" height="10"><path d="m2 6.5 2.5 2.5L10 3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </label>

      <div className="task-body">
        <span className="task-title">{task.title}</span>
        {(dueISO || overdue) && (
          <span className="task-meta">
            {dueISO && <time dateTime={dueISO}>{formatDate(dueISO)}</time>}
            {overdue && <span className="badge">Em atraso</span>}
          </span>
        )}
      </div>

      <div className="actions">
        <button className="icon-btn" onClick={() => onEdit(task)} aria-label={`Editar "${task.title}"`}>
          <EditIcon />
        </button>
        <button className="icon-btn" onClick={() => onDelete(task)} aria-label={`Excluir "${task.title}"`}>
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
