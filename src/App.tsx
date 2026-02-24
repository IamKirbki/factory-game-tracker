import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState<{ message: string; dbTime: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch from our local Express server
    fetch("http://localhost:3001/api/status")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="App">
      <h1>Factory App</h1>
      <div className="card">
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {data ? (
          <div>
            <p style={{ color: "#646cff", fontWeight: "bold" }}>
              {data.message}
            </p>
            <p>Database Time: {new Date(data.dbTime).toLocaleString()}</p>
          </div>
        ) : (
          <p>Connecting to Express backend...</p>
        )}
      </div>
    </div>
  );
}

export default App;
