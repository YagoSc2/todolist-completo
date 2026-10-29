import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { useDebounce } from './hooks/useDebounce.js';
import Sidebar from './components/Sidebar.jsx';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';
import { PlusIcon, MoonIcon, SunIcon, SearchIcon } from './components/Icons.jsx';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { task: null | Task }
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Busca na API só depois do debounce; cancela requisições antigas
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api
      .list({ search: debouncedSearch.trim(), status }, controller.signal)
      .then((data) => {
        setTasks(data.tasks);
        setTotals({ total: data.total, completed: data.completed });
        setError('');
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError('Não foi possível carregar as tarefas. O servidor está rodando?');
        setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedSearch, status, reloadKey]);

  async function run(action) {
    try {
      await action();
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  const handleToggle = (task) => run(() => api.update(task.id, { completed: !task.completed }));

  const handleDelete = (task) => {
    if (window.confirm(`Excluir a tarefa "${task.title}"?`)) run(() => api.remove(task.id));
  };

  async function handleSave(data) {
    if (modal.task) await api.update(modal.task.id, data);
    else await api.create(data);
    setModal(null);
    reload();
  }

  const pending = totals.total - totals.completed;
  const emptyMessage = debouncedSearch.trim()
    ? 'No tasks match your search.'
    : status === 'completed'
      ? 'You have no completed tasks.'
      : 'You have no pending tasks.';

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

      <main className="content">
        <button
          className="icon-btn theme-btn"
          onClick={() => setDark((d) => !d)}
          aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>

        <section className="panel">
          <h1>My Tasks</h1>

          <div className="toolbar">
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                value={search}
                placeholder="Search your tasks.."
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar tarefas"
              />
            </label>
            <button className="btn primary add" onClick={() => setModal({ task: null })}>
              <PlusIcon /> Add
            </button>
          </div>

          <div className="meta-row">
            <div className="filters" role="group" aria-label="Filtrar tarefas">
              {FILTERS.map((f, i) => (
                <span key={f.value}>
                  {i > 0 && <span className="sep"> | </span>}
                  <button
                    className={`filter ${status === f.value ? 'active' : ''}`}
                    onClick={() => setStatus(f.value)}
                    aria-pressed={status === f.value}
                  >
                    {f.label}
                  </button>
                </span>
              ))}
            </div>
            <span className="counter" aria-live="polite">
              {pending} {pending === 1 ? 'task' : 'tasks'} left · {totals.completed}/{totals.total} done
            </span>
          </div>

          {error && <p className="banner-error" role="alert">{error}</p>}

          {tasks.length > 0 ? (
            <ul className={`list ${loading ? 'loading' : ''}`}>
              {tasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onEdit={(task) => setModal({ task })}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          ) : (
            !loading && !error && <p className="empty">{emptyMessage}</p>
          )}
        </section>

        <footer className="footer">© {new Date().getFullYear()}</footer>
      </main>

      <button className="fab" onClick={() => setModal({ task: null })} aria-label="Criar tarefa">
        <PlusIcon />
      </button>

      {modal && (
        <TaskModal task={modal.task} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
