import { useEffect, useState } from "react";

function Projects() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://api.github.com/users/Bhushan-patil-git/repos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }

        return response.json();
      })
      .then((data) => {
        setRepositories(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <section>
      <h2>My GitHub Projects</h2>

      {loading && <p>Loading repositories...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div>
          {repositories.map((repo) => (
            <div key={repo.id}>
              <h3>{repo.name}</h3>
              <a href={repo.html_url} target="_blank" rel="noreferrer">
                View Repository
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Projects;