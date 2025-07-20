import React, { useEffect, useState } from "react";

function VerEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [zonaSeleccionada, setZonaSeleccionada] = useState("");
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/ejercicios")
      .then((res) => res.text())
      .then((data) => {
        const arr = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, zona, linkvideo] = line.split("|");
            return { nombre, zona: zona.toLowerCase(), linkvideo };
          });
        setEjercicios(arr);
      })
      .catch((err) => console.error("Error al obtener ejercicios:", err));
  }, []);

  const zonasUnicas = [...new Set(ejercicios.map((e) => e.zona))];

  const ejerciciosFiltrados = ejercicios.filter((e) => {
    const coincideTexto =
      e.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      e.zona.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideZona = zonaSeleccionada ? e.zona === zonaSeleccionada : true;
    return coincideTexto && coincideZona;
  });

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <h3 style={{ textAlign: "center" }}>Filtrar por zona</h3>
        <button
          onClick={() => setZonaSeleccionada("")}
          style={styles.filterButton}
        >
          Mostrar todos
        </button>
        {zonasUnicas.map((zona, index) => (
          <button
            key={index}
            onClick={() => setZonaSeleccionada(zona)}
            style={{
              ...styles.filterButton,
              backgroundColor:
                zona === zonaSeleccionada ? "#444" : "transparent",
            }}
          >
            {zona.charAt(0).toUpperCase() + zona.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>Bienvenido/a - Rutina de Ejercicios</h2>

        <div>
          <p>Búsqueda por nombre o zona:</p>
          <input
            type="text"
            placeholder='ej: "sentadillas" o "piernas"'
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={styles.filtro}
          />
        </div>

        <div style={styles.tabla}>
          <div style={styles.encabezado}>
            <div>Nombre</div>
            <div>Zona</div>
            <div>Video</div>
          </div>

          {ejerciciosFiltrados.length === 0 ? (
            <p style={{ padding: "1rem", textAlign: "center" }}>
              No hay ejercicios para mostrar.
            </p>
          ) : (
            ejerciciosFiltrados.map((ejercicio, index) => (
              <div
                key={index}
                style={{
                  ...styles.fila,
                  backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
                }}
              >
                <div>{ejercicio.nombre}</div>
                <div>{ejercicio.zona}</div>
                <div>
                  <button
                    onClick={() => setVideoSeleccionado(ejercicio.linkvideo)}
                    style={styles.fileButton}
                  >
                    Ver video
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {videoSeleccionado && (
          <div
            style={styles.modalOverlay}
            onClick={() => setVideoSeleccionado(null)}
          >
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Reproduciendo Video</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <video
                  src={`http://localhost:3000/${videoSeleccionado}`}
                  controls
                  style={{
                    width: "360px",
                    maxWidth: "100%",
                    borderRadius: "5px",
                  }}
                />
                <button
                  onClick={() => setVideoSeleccionado(null)}
                  style={styles.botonRojo}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerEjercicios;

const styles = {
  page: {
    display: "flex",
    height: "90vh",
    width: "60vw",
    background: "linear-gradient(to right, #1e1e1e, #2a2a2a)",
    color: "white",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "200px",
    padding: "1rem",
    borderRight: "1px solid #444",
    backgroundColor: "#111",
    overflowY: "auto",
  },
  filterButton: {
    display: "block",
    width: "100%",
    backgroundColor: "transparent",
    color: "white",
    padding: "0.5rem",
    border: "1px solid #444",
    marginBottom: "0.5rem",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "left",
    fontSize: "1rem",
  },
  container: {
    flex: 1,
    padding: "2rem",
    width: "300vw",
    overflowY: "scroll",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
  },
  filtro: {
    width: "100%",
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #444",
    marginBottom: "1rem",
    fontSize: "1rem",
    backgroundColor: "#2a2a2a",
    color: "white",
  },
  tabla: {
    border: "1px solid #444",
    borderRadius: "5px",
    overflow: "hidden",
  },
  encabezado: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 3fr",
    padding: "0.75rem 1rem",
    fontWeight: "bold",
    borderBottom: "1px solid #555",
    backgroundColor: "#2a2a2a",
    textAlign: "center",
    alignItems: "center",
  },
  fila: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 3fr",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #444",
    alignItems: "center",
    textAlign: "center",
    transition: "background-color 0.2s",
  },
  fileButton: {
    color: "#6c75d8",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#1e1e1e",
    padding: "2rem",
    borderRadius: "10px",
    color: "white",
    minWidth: "400px",
  },
  botonRojo: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
