import { useEffect, useState } from "react";

function Spinner() {
  return <div>Loading repositories...</div>;
}

function ErrorMessage({ message }) {
  return (
    <div style={{ color: "red" }}>
      <p>Failed to load repositories.</p>
      <p>{message}</p>
    </div>
  );
}

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const apiUrl = "https://api.github.com/users/Bhushan-patil-git/repos";

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRepos(data);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>
      <ErrorMessage message={error} />
      <button type="button" onClick={fetchRepos} style={{ marginTop: 12 }}>
        Retry
      </button>
    </div>;
  }

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Projects</h2>

      <label htmlFor="repo-search">Search repositories</label>
      <input
        id="repo-search"
        type="text"
        placeholder="Filter by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ display: "block", margin: "10px 0", padding: "6px" }}
      />

      {filteredRepos.length === 0 ? (
        <p>No repositories match your search.</p>
      ) : (
        <ul>
          {filteredRepos.map((repo) => (
            <li key={repo.id}>
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                {repo.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Projects;