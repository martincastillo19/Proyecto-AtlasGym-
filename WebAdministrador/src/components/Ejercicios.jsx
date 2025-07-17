import React, { useEffect, useState } from "react";

function AdministracionEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    nombre: "",
    zona: "",
    archivo: null,
  });
  const [videoSeleccionado, setVideoSeleccionado] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const cargarEjercicios = () => {
    fetch("http://localhost:3000/ejercicios")
      .then((res) => res.text())
      .then((data) => {
        const arr = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, zona, linkvideo] = line.split("|");
            return { nombre, zona, linkvideo };
          });
        setEjercicios(arr);
      })
      .catch((err) => console.error("Error al obtener ejercicios:", err));
  };

  const abrirModal = (ejercicio) => {
    setEjercicioSeleccionado({ ...ejercicio, nuevoArchivo: null });
    setMostrarModal(true);
  };

  const guardarCambios = () => {
    const formData = new FormData();
    formData.append("nombre", ejercicioSeleccionado.nombre);
    formData.append("zona", ejercicioSeleccionado.zona);
    if (ejercicioSeleccionado.nuevoArchivo) {
      formData.append("archivo", ejercicioSeleccionado.nuevoArchivo);
    }

    fetch("http://localhost:3000/ejercicios/actualizar", {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.text())
      .then(() => {
        alert("Ejercicio actualizado correctamente.");
        setMostrarModal(false);
        cargarEjercicios();
      })
      .catch((err) => {
        console.error("Error al guardar cambios:", err);
        alert("Error al guardar.");
      });
  };

  const eliminarEjercicio = (nombre) => {
    if (!window.confirm(`¿Eliminar ejercicio ${nombre}?`)) return;

    fetch("http://localhost:3000/ejercicios/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
      .then((res) => res.text())
      .then(() => {
        alert("Ejercicio eliminado");
        cargarEjercicios();
      })
      .catch((err) => {
        console.error("Error al eliminar ejercicio:", err);
        alert("Error al eliminar.");
      });
  };

  const agregarEjercicio = () => {
    const { nombre, zona, archivo } = nuevoEjercicio;
    if (!nombre || !zona || !archivo) {
      alert("Completa todos los campos para agregar un ejercicio.");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("zona", zona);
    formData.append("archivo", archivo);

    fetch("http://localhost:3000/ejercicios/subir", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then(() => {
        alert("Ejercicio agregado correctamente.");
        setNuevoEjercicio({ nombre: "", zona: "", archivo: null });
        cargarEjercicios();
      })
      .catch((err) => {
        console.error("Error al agregar ejercicio:", err);
        alert("Error al agregar.");
      });
  };

  const ejerciciosFiltrados = ejercicios.filter(
    (e) =>
      e.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      e.zona.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    cargarEjercicios();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Administración de Ejercicios</h2>
      Búsqueda por nombre o zona:
      <input
        type="text"
        placeholder='ej: "sentadillas" o "piernas"'
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={styles.filtro}
      />
      <div style={styles.tabla}>
        <div style={styles.encabezado}>
          <div>Nombre</div>
          <div>Zona</div>
          <div>Video</div>
          <div></div>
          <div></div>
        </div>

        {ejerciciosFiltrados.length === 0 ? (
          <p style={{ padding: "1rem", textAlign: "center" }}>
            No hay ejercicios que mostrar.
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
                  style={{
                    ...styles.link,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Ver video
                </button>
              </div>
              <button
                onClick={() => abrirModal(ejercicio)}
                style={styles.iconButton}
                title="Modificar"
              >
                <img
                  src="/assets/archivo.png"
                  alt="Editar"
                  style={styles.icon}
                />
              </button>
              <button
                onClick={() => eliminarEjercicio(ejercicio.nombre)}
                style={styles.iconButton}
                title="Eliminar"
              >
                <img
                  src="/assets/basura.png"
                  alt="Eliminar"
                  style={styles.icon}
                />
              </button>
            </div>
          ))
        )}
      </div>
      {mostrarModal && ejercicioSeleccionado && (
        <div style={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Ejercicio</h3>
            {[
              { campo: "nombre", label: "Nombre" },
              { campo: "zona", label: "Zona" },
            ].map(({ campo, label }) => (
              <div style={{ marginBottom: "1rem" }} key={campo}>
                <label style={styles.label}>{label}:</label>
                <input
                  type="text"
                  value={ejercicioSeleccionado[campo]}
                  onChange={(e) =>
                    setEjercicioSeleccionado({
                      ...ejercicioSeleccionado,
                      [campo]: e.target.value,
                    })
                  }
                  style={styles.modalInput}
                />
              </div>
            ))}
            <div style={{ marginBottom: "1rem" }}>
              <label style={styles.label}>Nuevo archivo (opcional):</label>
              <input
                type="file"
                onChange={(e) =>
                  setEjercicioSeleccionado({
                    ...ejercicioSeleccionado,
                    nuevoArchivo: e.target.files[0],
                  })
                }
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalBotones}>
              <button onClick={guardarCambios} style={styles.botonVerde}>
                Guardar
              </button>
              <button
                onClick={() => setMostrarModal(false)}
                style={styles.botonRojo}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "1rem", // espacio entre video y botón
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
              <div style={styles.modalBotones}>
                <button
                  onClick={() => setVideoSeleccionado(null)}
                  style={styles.botonRojo}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      Agregar un nuevo ejercicio:
      <div style={styles.agregarGrid}>
        <input
          type="text"
          placeholder="ej: Press banca"
          value={nuevoEjercicio.nombre}
          onChange={(e) =>
            setNuevoEjercicio({ ...nuevoEjercicio, nombre: e.target.value })
          }
          style={styles.input}
        />
        <input
          type="text"
          placeholder="ej: Pecho"
          value={nuevoEjercicio.zona}
          onChange={(e) =>
            setNuevoEjercicio({ ...nuevoEjercicio, zona: e.target.value })
          }
          style={styles.input}
        />
        <input
          type="file"
          onChange={(e) =>
            setNuevoEjercicio({ ...nuevoEjercicio, archivo: e.target.files[0] })
          }
          style={styles.input_archivo}
        />
        <button onClick={agregarEjercicio} style={styles.botonAgregar}>
          Agregar
        </button>
      </div>
    </div>
  );
}

export default AdministracionEjercicios;

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "1rem auto",
    backgroundColor: "#1e1e1e",
    padding: "1rem",
    borderRadius: "8px",
    color: "white",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    height: "630px",
  },
  title: { textAlign: "center" },
  filtro: {
    width: "98.5%",
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #444",
    marginBottom: "1rem",
    fontSize: "1rem",
    backgroundColor: "#2a2a2a",
    color: "white",
  },
  agregarGrid: {
    marginBottom: "1rem",
    display: "grid",
    gridTemplateColumns: "2fr 2fr 3fr 2fr 100px",
    gap: "0.5rem",
    alignItems: "center",
  },
  input: {
    padding: "0.5rem",
    minWidth: "330px",
    borderRadius: "4px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
    fontSize: "1rem",
  },
  input_archivo: {
    padding: "0.5rem",
    minWidth: "370px",
    borderRadius: "4px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
    fontSize: "1rem",
  },
  botonAgregar: {
    padding: "0.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tabla: {
    maxHeight: "400px",
    height: "400px",
    overflowY: "auto",
    border: "1px solid #444",
    borderRadius: "5px",
  },
  encabezado: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 3fr 80px 80px",
    padding: "0.75rem 1rem",
    fontWeight: "bold",
    borderBottom: "1px solid #555",
    backgroundColor: "#2a2a2a",
    textAlign: "center",
    alignItems: "center",
  },
  fila: {
    display: "grid",
    gridTemplateColumns: "2fr 2fr 3fr 80px 80px",
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #444",
    alignItems: "center",
    textAlign: "center",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  icon: {
    width: "30px",
    height: "30px",
  },
  link: {
    color: "#0af",
    textDecoration: "underline",
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
  label: {
    display: "block",
    marginBottom: "0.3rem",
    fontWeight: "bold",
  },
  modalInput: {
    width: "100%",
    fontSize: "1.2rem",
    padding: "0.3rem",
    borderRadius: "4px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
  },
  modalBotones: {
    marginTop: "1rem",
    display: "flex",
    gap: "1rem",
  },
  botonVerde: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
  },
  botonRojo: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
  },
};
