import React, { useEffect, useState } from "react";

function ListaMembresia() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarSoloVencidos, setMostrarSoloVencidos] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [clienteEliminar, setClienteEliminar] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [formEditar, setFormEditar] = useState(null);

  const colorEstado = {
    verde: "#28a745",
    amarillo: "#ffc107",
    rojo: "#dc3545",
  };

  function calcularEstado(fecha) {
    const [dia, mes, anio] = fecha.split("/").map(Number);
    const fechaPago = new Date(2000 + anio, mes - 1, dia);
    const hoy = new Date();
    const diasRestantes =
      30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
    let estado =
      diasRestantes > 7 ? "verde" : diasRestantes > 0 ? "amarillo" : "rojo";
    return { estado, diasRestantes: Math.max(diasRestantes, 0) };
  }

  function formatearRut(value) {
    let valor = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (valor.length === 0) return "";
    if (valor.length === 1) return valor;
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);
    return cuerpo + "-" + dv;
  }

  const esCorreoValido = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const cargarClientes = () => {
    fetch("http://localhost:3000/clientes")
      .then((res) => res.text())
      .then((data) => {
        const arr = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, apellido, rut, correo, ultimoPago] = line.split("|");
            return { nombre, apellido, rut, correo, ultimoPago };
          });
        setClientes(arr);
      })
      .catch((err) => console.error("Error al obtener clientes:", err));
  };

  const abrirModalEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormEditar(cliente);
    setMostrarModalEditar(true);
  };

  const abrirModalEliminar = (cliente) => {
    setClienteEliminar(cliente);
    setMostrarModalEliminar(true);
  };

  const handleChangeEditar = (campo, valor) => {
    if (campo === "rut") {
      valor = formatearRut(valor);
    }
    setFormEditar((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardarCambios = () => {
    if (!formEditar) return;

    const rutNuevo = formEditar.rut.trim().toLowerCase();
    const correoNuevo = formEditar.correo.trim().toLowerCase();

    const rutRepetido =
      rutNuevo !== "sin rut" &&
      clientes.some(
        (c) =>
          c.rut.trim().toLowerCase() === rutNuevo &&
          c.correo !== clienteSeleccionado.correo
      );

    if (rutRepetido) {
      alert("Ya existe un cliente con ese RUT. Debes usar uno diferente.");
      return;
    }

    if (!esCorreoValido(correoNuevo)) {
      alert("El correo no tiene un formato válido.");
      return;
    }

    const correoRepetido =
      correoNuevo !== clienteSeleccionado.correo.toLowerCase() &&
      clientes.some((c) => c.correo.trim().toLowerCase() === correoNuevo);

    if (correoRepetido) {
      alert("Ya existe un cliente con ese correo. Usa otro diferente.");
      return;
    }

    fetch("http://localhost:3000/clientes/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formEditar,
        correoOriginal: clienteSeleccionado.correo,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((msg) => {
            throw new Error(msg);
          });
        }
        return res.json();
      })
      .then(() => {
        setMostrarModalEditar(false);
        setClientes((prev) =>
          prev.map((c) =>
            c.correo === clienteSeleccionado.correo ? formEditar : c
          )
        );
      })
      .catch((err) => {
        alert(err.message);
        console.error("Error al guardar:", err);
      });
  };

  const confirmarEliminar = () => {
    if (!clienteEliminar) return;

    fetch("http://localhost:3000/clientes/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteEliminar),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.text();
      })
      .then(() => {
        cargarClientes();
        setMostrarModalEliminar(false);
        setClienteEliminar(null);
      })
      .catch((err) => {
        alert("Error al eliminar cliente");
        console.error(err);
      });
  };

  const clientesFiltrados = clientes.filter((c) => {
    const coincideTexto = [c.nombre, c.apellido, c.rut, c.correo].some(
      (campo) => campo.toLowerCase().includes(filtro.toLowerCase())
    );
    const { diasRestantes } = calcularEstado(c.ultimoPago);
    return coincideTexto && (!mostrarSoloVencidos || diasRestantes === 0);
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div style={estilos.contenedor}>
      <h2 style={{ textAlign: "center" }}>Lista de Membresías</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filtrar por cualquier campo"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={estilos.filtro}
        />
        <button
          onClick={() => setMostrarSoloVencidos((prev) => !prev)}
          style={estilos.botonFiltro(mostrarSoloVencidos)}
        >
          {mostrarSoloVencidos ? "Mostrar Todos" : "Ver Vencidos"}
        </button>
      </div>

      <div
        style={{
          maxHeight: "465px",
          overflowY: "auto",
          border: "1px solid #444",
          borderRadius: "5px",
        }}
      >
        <div style={estilos.encabezadoTabla}>
          <div>Nombre</div>
          <div>Apellido</div>
          <div>RUT</div>
          <div>Correo</div>
          <div style={{ margin: "auto" }}>Estado</div>
          <div></div>
          <div></div>
        </div>

        {mostrarModalEditar && formEditar && (
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
            onClick={() => setMostrarModalEditar(false)}
          >
            <div
              style={{
                background: "#1e1e1e",
                padding: "2rem",
                borderRadius: "10px",
                color: "white",
                minWidth: "420px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Editar Cliente</h3>
              {["nombre", "apellido", "rut", "correo", "ultimoPago"].map(
                (campo) => (
                  <CampoModal
                    key={campo}
                    label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                    value={formEditar[campo]}
                    onChange={(e) => handleChangeEditar(campo, e.target.value)}
                  />
                )
              )}
              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button
                  onClick={guardarCambios}
                  style={estilos.boton("#28a745")}
                >
                  Guardar
                </button>
                <button
                  onClick={() => setMostrarModalEditar(false)}
                  style={estilos.boton("#dc3545")}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalEliminar && clienteEliminar && (
          <div
            style={{ ...estilos.modalOverlay, zIndex: 1100 }}
            onClick={() => setMostrarModalEliminar(false)}
          >
            <div
              style={{ ...estilos.modalContenido, textAlign: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>
                ¿Está seguro de querer eliminar a{" "}
                <strong>
                  {clienteEliminar.nombre} {clienteEliminar.apellido}
                </strong>
                ?
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={confirmarEliminar}
                  style={estilos.boton("#dc3545")}
                >
                  Aceptar
                </button>
                <button
                  onClick={() => setMostrarModalEliminar(false)}
                  style={estilos.boton("#444")}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {clientesFiltrados.length === 0 ? (
          <p style={{ padding: "1rem", textAlign: "center" }}>
            No hay clientes que mostrar.
          </p>
        ) : (
          clientesFiltrados.map((cliente, index) => {
            const { estado, diasRestantes } = calcularEstado(
              cliente.ultimoPago
            );
            return (
              <div key={index} style={estilos.fila(index)}>
                <div>{cliente.nombre}</div>
                <div>{cliente.apellido}</div>
                <div>{cliente.rut}</div>
                <div>{cliente.correo}</div>
                <div
                  style={estilos.estadoBox(colorEstado[estado])}
                  title={`${diasRestantes} días restantes`}
                >
                  {diasRestantes}
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => abrirModalEditar(cliente)}
                >
                  <img
                    src="/assets/archivo.png"
                    alt="Editar"
                    style={{ width: "30px" }}
                  />
                </button>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => abrirModalEliminar(cliente)}
                >
                  <img
                    src="/assets/basura.png"
                    alt="Eliminar"
                    style={{ width: "30px" }}
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// === ESTILOS ===
const estilos = {
  contenedor: {
    maxWidth: "1500px",
    margin: "0.05rem auto",
    backgroundColor: "#1e1e1e",
    padding: "1rem",
    borderRadius: "8px",
    color: "white",
    fontFamily: "system-ui",
    height: "600px",
  },
  filtro: {
    flex: 1,
    padding: "0.5rem",
    borderRadius: "5px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
    fontSize: "1rem",
  },
  botonFiltro: (activo) => ({
    padding: "0.5rem 1rem",
    backgroundColor: activo ? "#dc3545" : "#444",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  }),
  encabezadoTabla: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 80px 80px",
    padding: "0.75rem 1rem",
    fontWeight: "bold",
    borderBottom: "1px solid #555",
    backgroundColor: "#2a2a2a",
  },
  fila: (index) => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 80px 80px",
    padding: "0.75rem 1rem",
    backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
    borderBottom: "1px solid #444",
    alignItems: "center",
  }),
  estadoBox: (color) => ({
    width: "40px",
    height: "40px",
    backgroundColor: color,
    borderRadius: "4px",
    margin: "auto",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "0.75rem",
    fontWeight: "bold",
  }),
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
  modalContenido: {
    background: "#1e1e1e",
    padding: "2rem",
    borderRadius: "10px",
    color: "white",
    minWidth: "320px",
  },
  input: {
    width: "100%",
    fontSize: "1.2rem",
    padding: "0.3rem",
    borderRadius: "4px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
  },
  campoModal: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1rem",
  },
  boton: (color) => ({
    backgroundColor: color,
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: 1,
  }),
};

// === COMPONENTES AUXILIARES ===
const CampoModal = ({ label, value, onChange }) => (
  <div style={estilos.campoModal}>
    <label style={{ marginBottom: "0.25rem" }}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      style={estilos.input}
    />
  </div>
);

export default ListaMembresia;
