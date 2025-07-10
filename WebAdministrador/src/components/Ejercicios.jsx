import React, { useEffect, useState } from "react";

function AdministracionEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    nombre: "",
    zona: "",
    linkvideo: "",
  });

  useEffect(() => {
    cargarEjercicios();
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
    setEjercicioSeleccionado(ejercicio);
    setMostrarModal(true);
  };

  const guardarCambios = () => {
    fetch("http://localhost:3000/ejercicios/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ejercicioSeleccionado),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Ejercicio actualizado correctamente.");
        setMostrarModal(false);
        setEjercicios((prev) =>
          prev.map((e) =>
            e.nombre === ejercicioSeleccionado.nombre
              ? ejercicioSeleccionado
              : e
          )
        );
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
        setEjercicios((prev) => prev.filter((e) => e.nombre !== nombre));
      })
      .catch((err) => {
        console.error("Error al eliminar ejercicio:", err);
        alert("Error al eliminar.");
      });
  };

  const agregarEjercicio = () => {
    const { nombre, zona, linkvideo } = nuevoEjercicio;
    if (!nombre || !zona || !linkvideo) {
      alert("Completa todos los campos para agregar un ejercicio.");
      return;
    }

    const dataString = `${nombre}|${zona}|${linkvideo}`;
    fetch("http://localhost:3000/ejercicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataString }),
    })
      .then((res) => res.text())
      .then(() => {
        alert("Ejercicio agregado correctamente.");
        setNuevoEjercicio({ nombre: "", zona: "", linkvideo: "" });
        cargarEjercicios();
      })
      .catch((err) => {
        console.error("Error al agregar ejercicio:", err);
        alert("Error al agregar.");
      });
  };

  // Filtrar ejercicios por nombre o zona
  const ejerciciosFiltrados = ejercicios.filter(
    (e) =>
      e.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      e.zona.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "1rem auto",
        backgroundColor: "#1e1e1e",
        padding: "1rem",
        borderRadius: "8px",
        color: "white",
        fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
        height: "700px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Administración de Ejercicios</h2>

      {/* Filtro */}
      <input
        type="text"
        placeholder="Buscar por nombre o zona..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: "5px",
          border: "1px solid #444",
          marginBottom: "1rem",
          fontSize: "1rem",
          backgroundColor: "#2a2a2a",
          color: "white",
        }}
      />

      {/* Agregar ejercicio */}
      <div
        style={{
          marginBottom: "1rem",
          display: "grid",
          gridTemplateColumns: "2fr 2fr 3fr 100px",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoEjercicio.nombre}
          onChange={(e) =>
            setNuevoEjercicio({ ...nuevoEjercicio, nombre: e.target.value })
          }
          style={{
            padding: "0.4rem",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#2a2a2a",
            color: "white",
            fontSize: "1rem",
          }}
        />
        <input
          type="text"
          placeholder="Zona"
          value={nuevoEjercicio.zona}
          onChange={(e) =>
            setNuevoEjercicio({ ...nuevoEjercicio, zona: e.target.value })
          }
          style={{
            padding: "0.4rem",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#2a2a2a",
            color: "white",
            fontSize: "1rem",
          }}
        />
        <input
          type="text"
          placeholder="Link Video"
          value={nuevoEjercicio.linkvideo}
          onChange={(e) =>
            setNuevoEjercicio({ ...nuevoEjercicio, linkvideo: e.target.value })
          }
          style={{
            padding: "0.4rem",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#2a2a2a",
            color: "white",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={agregarEjercicio}
          style={{
            padding: "0.5rem",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Agregar
        </button>
      </div>

      {/* Tabla de ejercicios */}
      <div
        style={{
          maxHeight: "520px",
          overflowY: "auto",
          border: "1px solid #444",
          borderRadius: "5px",
        }}
      >
        {/* Encabezado */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 3fr 80px 80px",
            padding: "0.75rem 1rem",
            fontWeight: "bold",
            borderBottom: "1px solid #555",
            backgroundColor: "#2a2a2a",
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <div>Nombre</div>
          <div>Zona</div>
          <div>Link Video</div>
          <div></div>
          <div></div>
        </div>

        {/* Filas */}
        {ejerciciosFiltrados.length === 0 ? (
          <p style={{ padding: "1rem", textAlign: "center" }}>
            No hay ejercicios que mostrar.
          </p>
        ) : (
          ejerciciosFiltrados.map((ejercicio, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 3fr 80px 80px",
                padding: "0.75rem 1rem",
                backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
                borderBottom: "1px solid #444",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div>{ejercicio.nombre}</div>
              <div>{ejercicio.zona}</div>
              <div>
                <a
                  href={ejercicio.linkvideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0af", textDecoration: "underline" }}
                >
                  Ver video
                </a>
              </div>

              <button
                onClick={() => abrirModal(ejercicio)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Modificar"
              >
                <img
                  src="/assets/archivo.png"
                  alt="Modificar"
                  style={{ width: "30px", height: "30px" }}
                />
              </button>

              <button
                onClick={() => eliminarEjercicio(ejercicio.nombre)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                title="Eliminar"
              >
                <img
                  src="/assets/basura.png"
                  alt="Eliminar"
                  style={{ width: "30px", height: "30px" }}
                />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal para editar */}
      {mostrarModal && ejercicioSeleccionado && (
        <div
          style={{
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
          }}
          onClick={() => setMostrarModal(false)}
        >
          <div
            style={{
              background: "#1e1e1e",
              padding: "2rem",
              borderRadius: "10px",
              color: "white",
              minWidth: "320px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Editar Ejercicio</h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.3rem",
                  fontWeight: "bold",
                }}
              >
                Nombre:
              </label>
              <input
                type="text"
                value={ejercicioSeleccionado.nombre}
                onChange={(e) =>
                  setEjercicioSeleccionado({
                    ...ejercicioSeleccionado,
                    nombre: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  fontSize: "1.2rem",
                  padding: "0.3rem",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  backgroundColor: "#2a2a2a",
                  color: "white",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.3rem",
                  fontWeight: "bold",
                }}
              >
                Zona:
              </label>
              <input
                type="text"
                value={ejercicioSeleccionado.zona}
                onChange={(e) =>
                  setEjercicioSeleccionado({
                    ...ejercicioSeleccionado,
                    zona: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  fontSize: "1.2rem",
                  padding: "0.3rem",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  backgroundColor: "#2a2a2a",
                  color: "white",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.3rem",
                  fontWeight: "bold",
                }}
              >
                Link video:
              </label>
              <input
                type="text"
                value={ejercicioSeleccionado.linkvideo}
                onChange={(e) =>
                  setEjercicioSeleccionado({
                    ...ejercicioSeleccionado,
                    linkvideo: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  fontSize: "1.2rem",
                  padding: "0.3rem",
                  borderRadius: "4px",
                  border: "1px solid #555",
                  backgroundColor: "#2a2a2a",
                  color: "white",
                }}
              />
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <button
                onClick={guardarCambios}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Guardar
              </button>

              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdministracionEjercicios;
