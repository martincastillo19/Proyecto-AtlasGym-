import React, { useEffect, useState } from "react";

function VerEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/ejercicios")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener ejercicios");
        return res.text();
      })
      .then((data) => {
        const lista = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, zona, linkvideo] = line.split("|");
            return { nombre, zona, linkvideo };
          });
        setEjercicios(lista);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  if (ejercicios.length === 0) {
    return (
      <div style={{ color: "white" }}>No hay ejercicios para mostrar.</div>
    );
  }

  return (
    <div style={{ color: "white", maxWidth: "800px", margin: "auto" }}>
      <h2>Lista de Ejercicios</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#222",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Nombre</th>
            <th style={thStyle}>Zona</th>
            <th style={thStyle}>Video</th>
          </tr>
        </thead>
        <tbody>
          {ejercicios.map(({ nombre, zona, linkvideo }, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? "#2a2a2a" : "#1f1f1f",
              }}
            >
              <td style={tdStyle}>{nombre}</td>
              <td style={tdStyle}>{zona}</td>
              <td style={tdStyle}>
                <a
                  href={linkvideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0af" }}
                >
                  Ver video
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  borderBottom: "2px solid #444",
  padding: "0.5rem",
  textAlign: "left",
};

const tdStyle = {
  padding: "0.5rem",
  textAlign: "left",
};

export default VerEjercicios;
