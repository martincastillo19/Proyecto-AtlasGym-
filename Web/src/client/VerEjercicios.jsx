import React, { useEffect, useState } from "react";

function VerEjercicios() {
  // Estados principales
  const [ejercicios, setEjercicios] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [zonaSeleccionada, setZonaSeleccionada] = useState("");
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar ejercicios desde el backend
  const cargarEjercicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/ejercicios");
      if (!res.ok)
        throw new Error("No se pudo cargar el archivo de ejercicios");
      const data = await res.text();
      const arr = data
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [nombre, zona, linkvideo] = line.split("|");
          return { nombre, zona: zona.toLowerCase(), linkvideo };
        });
      setEjercicios(arr);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar zonas únicas para el filtro lateral
  const zonasUnicas = [...new Set(ejercicios.map((e) => e.zona))].sort();

  // Filtrado de ejercicios según texto y zona seleccionada
  const ejerciciosFiltrados = ejercicios.filter((e) => {
    const texto = filtroTexto.toLowerCase();
    const coincideTexto =
      e.nombre.toLowerCase().includes(texto) || e.zona.includes(texto);
    const coincideZona = zonaSeleccionada ? e.zona === zonaSeleccionada : true;
    return coincideTexto && coincideZona;
  });

  // Cerrar modal de video con tecla ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setVideoSeleccionado(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Carga los ejercicios cuando el componente monta
  useEffect(() => {
    document.body.style.overflow = "hidden";
    cargarEjercicios();
  }, []);

  return (
    <div style={styles.page}>
      {/* Sidebar con filtro por zona */}
      <div style={styles.sidebar}>
        <h3 style={{ textAlign: "center" }}>Filtrar por zona</h3>
        <button
          onClick={() => setZonaSeleccionada("")}
          style={styles.filterButton}
        >
          Mostrar todos
        </button>
        {zonasUnicas.map((zona) => (
          <button
            key={zona}
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

      {/* Contenedor principal */}
      <div style={styles.container}>
        <h2 style={styles.title}>Bienvenido/a - Rutina de Ejercicios</h2>

        {/* Campo de búsqueda */}
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

        {/* Mensajes de error o loading */}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {loading && (
          <p style={{ textAlign: "center" }}>Cargando ejercicios...</p>
        )}

        {/* Tabla de ejercicios */}
        {!loading && (
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
                  key={`${ejercicio.nombre}-${ejercicio.zona}`}
                  style={{
                    ...styles.fila,
                    backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
                  }}
                >
                  <div>{ejercicio.nombre}</div>
                  <div>{ejercicio.zona}</div>
                  <div>
                    <button
                      title={ejercicio.linkvideo}
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
        )}

        {/* Modal para reproducir video */}
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

// === ESTILOS ===
const styles = {
  page: {
    display: "flex",
    height: "90vh",
    width: "80vw",
    background: "linear-gradient(to right, #1e1e1e, #2a2a2a)",
    color: "white",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "250px",
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
    transition: "background-color 0.3s",
    ":hover": {
      backgroundColor: "#333",
    },
  },
  container: {
    flex: 1,
    padding: "0.5rem",
    width: "300vw",
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
