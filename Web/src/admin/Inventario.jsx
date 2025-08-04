import React, { useEffect, useState } from "react";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    cantidad: "",
    tipo: "",
  });

  const cargarInventario = () => {
    fetch("http://localhost:3000/inventario")
      .then((res) => res.text())
      .then((data) => {
        const arr = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, cantidad, tipo] = line.split("|");
            return { nombre, cantidad, tipo };
          });
        setProductos(arr);
      })
      .catch((err) => console.error("Error al obtener inventario:", err));
  };

  const abrirModal = (producto) => {
    setProductoSeleccionado({
      ...producto,
      nombreOriginal: producto.nombre,
    });
    setMostrarModal(true);
  };

  const guardarCambios = () => {
    fetch("http://localhost:3000/inventario/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoSeleccionado),
    })
      .then((res) => res.text())
      .then(() => {
        setMostrarModal(false);
        cargarInventario();
      })
      .catch((err) => {
        console.error("Error al guardar cambios:", err);
        alert("Error al guardar.");
      });
  };

  const eliminarProducto = (nombre) => {
    if (!window.confirm(`¿Eliminar producto ${nombre}?`)) return;

    fetch("http://localhost:3000/inventario/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
      .then((res) => res.text())
      .then(() => {
        cargarInventario();
      })
      .catch((err) => {
        console.error("Error al eliminar producto:", err);
        alert("Error al eliminar.");
      });
  };

  const agregarProducto = () => {
    const { nombre, cantidad, tipo } = nuevoProducto;
    if (!nombre || !cantidad) {
      alert("Nombre y cantidad son obligatorios.");
      return;
    }

    fetch("http://localhost:3000/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, cantidad, descripcion: tipo }),
    })
      .then((res) => res.text())
      .then(() => {
        setNuevoProducto({ nombre: "", cantidad: "", tipo: "" });
        cargarInventario();
      })
      .catch((err) => {
        console.error("Error al agregar producto:", err);
        alert("Error al agregar.");
      });
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      p.tipo.toLowerCase().includes(filtro.toLowerCase())
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    cargarInventario();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Inventario de Consumibles</h2>

      <div>
        <p>Búsqueda por nombre o tipo:</p>
        <input
          type="text"
          placeholder="ej: proteína, guantes..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={styles.filtro}
        />
      </div>

      <div style={styles.tabla}>
        <div style={styles.encabezado}>
          <div>Nombre</div>
          <div>Cantidad</div>
          <div>Tipo</div>
          <div></div>
          <div></div>
        </div>

        {productosFiltrados.length === 0 ? (
          <p style={{ padding: "1rem", textAlign: "center" }}>
            No hay productos que mostrar.
          </p>
        ) : (
          productosFiltrados.map((producto, index) => (
            <div
              key={index}
              style={{
                ...styles.fila,
                backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
              }}
            >
              <div>{producto.nombre}</div>
              <div>{producto.cantidad}</div>
              <div>{producto.tipo}</div>
              <button
                onClick={() => abrirModal(producto)}
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
                onClick={() => eliminarProducto(producto.nombre)}
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

      {mostrarModal && productoSeleccionado && (
        <div style={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Producto</h3>
            {["nombre", "cantidad", "tipo"].map((campo) => (
              <div key={campo} style={{ marginBottom: "1rem" }}>
                <label style={styles.label}>
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}:
                </label>
                <input
                  type="text"
                  value={productoSeleccionado[campo]}
                  onChange={(e) =>
                    setProductoSeleccionado({
                      ...productoSeleccionado,
                      [campo]: e.target.value,
                    })
                  }
                  style={styles.modalInput}
                />
              </div>
            ))}
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

      <p>Agregar un nuevo producto:</p>
      <div style={styles.agregarGrid}>
        <input
          type="text"
          placeholder="ej: Aminoácidos"
          value={nuevoProducto.nombre}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })
          }
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Cantidad"
          value={nuevoProducto.cantidad}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })
          }
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Tipo"
          value={nuevoProducto.tipo}
          onChange={(e) =>
            setNuevoProducto({ ...nuevoProducto, tipo: e.target.value })
          }
          style={styles.input}
        />
        <button onClick={agregarProducto} style={styles.botonAgregar}>
          Agregar
        </button>
      </div>
    </div>
  );
}

export default Inventario;

// === ESTILOS ===
const styles = {
  container: {
    maxWidth: "1150px",
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
    gridTemplateColumns: "2fr 2fr 3fr 100px",
    gap: "0.5rem",
    alignItems: "center",
  },
  input: {
    padding: "0.5rem",
    minWidth: "311px",
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
    maxHeight: "340px",
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
