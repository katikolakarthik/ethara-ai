import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Layout from '../components/Layout';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProject({ name, description });
      setProjects((prev) => [res.data, ...prev]);
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <header className="page-header">
        <div>
          <h1>Your Projects</h1>
          <p>Collaborate with your team on tasks and track progress</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </header>

      {error && <p className="alert alert-error">{error}</p>}

      {showForm && (
        <form className="card form-card" onSubmit={handleCreate}>
          <h2>Create Project</h2>
          <label>
            Project Name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </form>
      )}

      {loading ? (
        <p className="muted">Loading projects...</p>
      ) : projects.length === 0 ? (
        <article className="card empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to start managing tasks.</p>
        </article>
      ) : (
        <section className="grid projects-grid">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="card project-card">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <footer>
                <span className={`badge badge-${project.myRole}`}>{project.myRole}</span>
                <span className="muted">{project.members?.length || 0} members</span>
              </footer>
            </Link>
          ))}
        </section>
      )}
    </Layout>
  );
}
