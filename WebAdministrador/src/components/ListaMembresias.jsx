import React, { useEffect, useState } from "react";

function ListaMembresia() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarSoloVencidos, setMostrarSoloVencidos] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const inputStyle = {
    width: "100%",
    fontSize: "1.2rem",
    padding: "0.3rem",
    borderRadius: "4px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
  };

  const CampoModal = ({ label, value, onChange }) => (
    <div
      style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}
    >
      <label style={{ marginBottom: "0.25rem" }}>{label}</label>
      <input type="text" value={value} onChange={onChange} style={inputStyle} />
    </div>
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  useEffect(() => {
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
  }, []);

  const calcularEstado = (fecha) => {
    const [dia, mes, anio] = fecha.split("/").map(Number);
    const fechaPago = new Date(2000 + anio, mes - 1, dia);
    const hoy = new Date();
    const diasRestantes =
      30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
    let estado =
      diasRestantes > 7 ? "verde" : diasRestantes > 0 ? "amarillo" : "rojo";
    return { estado, diasRestantes: Math.max(diasRestantes, 0) };
  };

  const abrirModal = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModal(true);
  };

  const actualizarCampo = (campo, valor) => {
    setClienteSeleccionado((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardarCambios = () => {
    fetch("http://localhost:3000/clientes/actualizar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clienteSeleccionado),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Cliente actualizado correctamente.");
        setMostrarModal(false);
        setClientes((prev) =>
          prev.map((c) =>
            c.rut === clienteSeleccionado.rut ? clienteSeleccionado : c
          )
        );
      })
      .catch((err) => {
        console.error("Error al guardar cambios:", err);
        alert("Error al guardar.");
      });
  };

  const colorEstado = {
    verde: "#28a745",
    amarillo: "#ffc107",
    rojo: "#dc3545",
  };

  const clientesFiltrados = clientes.filter((c) => {
    const coincideTexto = [c.nombre, c.apellido, c.rut, c.correo].some(
      (campo) => campo.toLowerCase().includes(filtro.toLowerCase())
    );
    const { diasRestantes } = calcularEstado(c.ultimoPago);
    return coincideTexto && (!mostrarSoloVencidos || diasRestantes === 0);
  });

  return (
    <div
      style={{
        maxWidth: "1500px",
        margin: "0.05rem auto",
        backgroundColor: "#1e1e1e",
        padding: "1rem",
        borderRadius: "8px",
        color: "white",
        fontFamily: "system-ui",
        height: "600px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Lista de Membresías</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filtrar por cualquier campo"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #555",
            backgroundColor: "#2a2a2a",
            color: "white",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={() => setMostrarSoloVencidos((prev) => !prev)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: mostrarSoloVencidos ? "#dc3545" : "#444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 80px 80px",
            padding: "0.75rem 1rem",
            fontWeight: "bold",
            borderBottom: "1px solid #555",
            backgroundColor: "#2a2a2a",
          }}
        >
          <div>Nombre</div>
          <div>Apellido</div>
          <div>RUT</div>
          <div>Correo</div>
          <div style={{ margin: "auto" }}>Estado</div>
          <div></div>
          <div></div>
        </div>

        {mostrarModal && clienteSeleccionado && (
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
              <h3>Editar Cliente</h3>
              {["nombre", "apellido", "rut", "correo", "ultimoPago"].map(
                (campo) => (
                  <CampoModal
                    key={campo}
                    label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                    value={clienteSeleccionado[campo]}
                    onChange={(e) => actualizarCampo(campo, e.target.value)}
                  />
                )
              )}
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
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 80px 80px",
                  padding: "0.75rem 1rem",
                  backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
                  borderBottom: "1px solid #444",
                  alignItems: "center",
                }}
              >
                <div>{cliente.nombre}</div>
                <div>{cliente.apellido}</div>
                <div>{cliente.rut}</div>
                <div>{cliente.correo}</div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: colorEstado[estado],
                    borderRadius: "4px",
                    margin: "auto",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
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
                  onClick={() => abrirModal(cliente)}
                >
                  <img
                    src="/assets/archivo.png"
                    alt="Editar"
                    style={{ width: "30px", height: "30px" }}
                  />
                </button>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => alert(`Eliminar a ${cliente.nombre}`)}
                >
                  <img
                    src="/assets/basura.png"
                    alt="Eliminar"
                    style={{ width: "30px", height: "30px" }}
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

export default ListaMembresia;
