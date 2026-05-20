import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import Layout from '../components/Layout';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [tab, setTab] = useState('tasks');
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignee: '',
    status: 'todo',
  });

  const isAdmin = project?.myRole === 'admin';

  const loadAll = useCallback(async () => {
    try {
      const [projRes, tasksRes, dashRes] = await Promise.all([
        api.getProject(id),
        api.getTasks(id),
        api.getDashboard(id),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setDashboard(dashRes.data);
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.addMember(id, memberEmail);
      setMemberEmail('');
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.removeMember(id, userId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const body = {
        ...taskForm,
        assignee: taskForm.assignee || undefined,
        dueDate: taskForm.dueDate || undefined,
      };
      await api.createTask(id, body);
      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignee: '',
        status: 'todo',
      });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await api.updateTask(id, taskId, updates);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(id, taskId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!project && !error) {
    return (
      <Layout>
        <p className="muted">Loading project...</p>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <p className="alert alert-error">{error || 'Project not found'}</p>
        <Link to="/">Back to projects</Link>
      </Layout>
    );
  }

  const members = project.members || [];

  return (
    <Layout>
      <header className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Projects
          </Link>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <span className={`badge badge-${project.myRole}`}>{project.myRole}</span>
      </header>

      {error && <p className="alert alert-error">{error}</p>}

      <nav className="tabs">
        <button
          type="button"
          className={tab === 'tasks' ? 'active' : ''}
          onClick={() => setTab('tasks')}
        >
          Tasks
        </button>
        <button
          type="button"
          className={tab === 'dashboard' ? 'active' : ''}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
        {isAdmin && (
          <button
            type="button"
            className={tab === 'members' ? 'active' : ''}
            onClick={() => setTab('members')}
          >
            Members
          </button>
        )}
      </nav>

      {tab === 'dashboard' && dashboard && (
        <section className="dashboard-grid">
          <article className="card stat-card">
            <h3>Total Tasks</h3>
            <p className="stat-value">{dashboard.totalTasks}</p>
          </article>
          <article className="card stat-card">
            <h3>To Do</h3>
            <p className="stat-value">{dashboard.tasksByStatus.todo}</p>
          </article>
          <article className="card stat-card">
            <h3>In Progress</h3>
            <p className="stat-value">{dashboard.tasksByStatus.in_progress}</p>
          </article>
          <article className="card stat-card">
            <h3>Done</h3>
            <p className="stat-value">{dashboard.tasksByStatus.done}</p>
          </article>

          <article className="card span-2">
            <h3>Tasks per User</h3>
            {dashboard.tasksPerUser.length === 0 ? (
              <p className="muted">No assigned tasks yet</p>
            ) : (
              <ul className="user-stats">
                {dashboard.tasksPerUser.map((u) => (
                  <li key={u.userId}>
                    <span>{u.name}</span>
                    <strong>{u.count}</strong>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="card span-2">
            <h3>Overdue Tasks</h3>
            {dashboard.overdueTasks.length === 0 ? (
              <p className="muted">No overdue tasks</p>
            ) : (
              <ul className="overdue-list">
                {dashboard.overdueTasks.map((t) => (
                  <li key={t._id}>
                    <span>{t.title}</span>
                    <span className="muted">
                      {t.assignee?.name || 'Unassigned'} · Due{' '}
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      )}

      {tab === 'members' && isAdmin && (
        <section>
          <form className="card form-card inline-form" onSubmit={handleAddMember}>
            <label>
              Add member by email
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@email.com"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
          <ul className="member-list card">
            {members.map((m) => (
              <li key={m.user._id}>
                <span>
                  {m.user.name} ({m.user.email})
                </span>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {isAdmin && m.role === 'member' && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveMember(m.user._id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'tasks' && (
        <section>
          {isAdmin && (
            <form className="card form-card" onSubmit={handleCreateTask}>
              <h2>Create Task</h2>
              <div className="form-row">
                <label>
                  Title
                  <input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Priority
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <label>
                Description
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                />
              </label>
              <div className="form-row">
                <label>
                  Due Date
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </label>
                <label>
                  Assign to
                  <select
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user._id} value={m.user._id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                Add Task
              </button>
            </form>
          )}

          <section className="task-list">
            {tasks.length === 0 ? (
              <article className="card empty-state">
                <p>No tasks {isAdmin ? 'yet. Create one above.' : 'assigned to you.'}</p>
              </article>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isAdmin={isAdmin}
                  members={members}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </section>
        </section>
      )}
    </Layout>
  );
}

function TaskCard({ task, isAdmin, members, onUpdate, onDelete }) {
  const canEditFull = isAdmin;
  const canUpdateStatus = isAdmin || task.assignee?._id;

  return (
    <article className={`card task-card priority-${task.priority}`}>
      <header>
        <h3>{task.title}</h3>
        <span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
      </header>
      {task.description && <p>{task.description}</p>}
      <p className="task-meta">
        {task.assignee ? `Assigned to ${task.assignee.name}` : 'Unassigned'}
        {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString()}`}
      </p>

      {canUpdateStatus && (
        <label className="status-select">
          Status
          <select
            value={task.status}
            onChange={(e) => onUpdate(task._id, { status: e.target.value })}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}

      {canEditFull && (
        <footer className="task-actions">
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </footer>
      )}
    </article>
  );
}
