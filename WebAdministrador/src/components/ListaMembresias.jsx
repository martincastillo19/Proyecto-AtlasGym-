import React, { useEffect, useState } from "react";

function ListaMembresia() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [mostrarSoloVencidos, setMostrarSoloVencidos] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [clienteEliminar, setClienteEliminar] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto"; // por si se desmonta
    };
  }, []);

  // Cargar clientes desde backend
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

  useEffect(() => {
    cargarClientes();
  }, []);

  const calcularEstado = (fecha) => {
    const [dia, mes, anio] = fecha.split("/").map((v) => parseInt(v));
    const fechaPago = new Date(2000 + anio, mes - 1, dia); // dd/mm/yy
    const fechaVencimiento = new Date(fechaPago);
    fechaVencimiento.setDate(fechaPago.getDate() + 30);

    const hoy = new Date();
    const diferenciaDias = Math.floor(
      (hoy - fechaPago) / (1000 * 60 * 60 * 24)
    );
    const diasRestantes = 30 - diferenciaDias;

    let estado = "rojo";
    if (diasRestantes > 7) estado = "verde";
    else if (diasRestantes > 0) estado = "amarillo";

    const fechaVencimientoFormateada =
      fechaVencimiento.toLocaleDateString("es-CL");

    return {
      estado,
      diasRestantes: Math.max(diasRestantes, 0),
      fechaVencimiento: fechaVencimientoFormateada,
    };
  };

  const colorEstado = {
    verde: "#28a745",
    amarillo: "#ffc107",
    rojo: "#dc3545",
  };

  const abrirModalEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModalEditar(true);
  };

  const abrirModalEliminar = (cliente) => {
    setClienteEliminar(cliente);
    setMostrarModalEliminar(true);
  };

  const confirmarEliminar = () => {
    if (!clienteEliminar) return;

    fetch("http://localhost:3000/eliminar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut: clienteEliminar.rut }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al eliminar");
        return res.text();
      })
      .then(() => {
        // Actualizar lista
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
    const coincideTexto =
      c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      c.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
      c.rut.toLowerCase().includes(filtro.toLowerCase()) ||
      c.correo.toLowerCase().includes(filtro.toLowerCase());

    const { diasRestantes } = calcularEstado(c.ultimoPago);

    const coincideVencido = mostrarSoloVencidos ? diasRestantes === 0 : true;

    return coincideTexto && coincideVencido;
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
        fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
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
          <div
            style={{
              margin: "auto",
            }}
          >
            Estado
          </div>
          <div></div>
          <div></div>
        </div>

        {/* Modal Editar */}
        {mostrarModalEditar && clienteSeleccionado && (
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
            onClick={() => setMostrarModalEditar(false)} // cerrar al hacer clic fuera
          >
            <div
              style={{
                background: "#1e1e1e",
                padding: "2rem",
                borderRadius: "10px",
                color: "white",
                minWidth: "300px",
              }}
              onClick={(e) => e.stopPropagation()} // evita cierre al hacer clic dentro
            >
              <h3>Editar Cliente</h3>
              <p>
                <strong>Nombre:</strong> {clienteSeleccionado.nombre}
              </p>
              <p>
                <strong>Apellido:</strong> {clienteSeleccionado.apellido}
              </p>
              <p>
                <strong>RUT:</strong> {clienteSeleccionado.rut}
              </p>
              <p>
                <strong>Correo:</strong> {clienteSeleccionado.correo}
              </p>
              <p>
                <strong>Último pago:</strong> {clienteSeleccionado.ultimoPago}
              </p>
              <p>
                <strong>Vence el:</strong>{" "}
                {
                  calcularEstado(clienteSeleccionado.ultimoPago)
                    .fechaVencimiento
                }
              </p>

              {/* Puedes reemplazar esto por formularios reales */}
              <button
                onClick={() => setMostrarModalEditar(false)}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal Confirmar Eliminar */}
        {mostrarModalEliminar && clienteEliminar && (
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
              zIndex: 1100,
            }}
            onClick={() => setMostrarModalEliminar(false)} // cerrar al hacer clic fuera
          >
            <div
              style={{
                background: "#1e1e1e",
                padding: "2rem",
                borderRadius: "10px",
                color: "white",
                minWidth: "300px",
                textAlign: "center",
              }}
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
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    padding: "0.5rem 1.5rem",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Aceptar
                </button>

                <button
                  onClick={() => setMostrarModalEliminar(false)}
                  style={{
                    backgroundColor: "#444",
                    color: "white",
                    padding: "0.5rem 1.5rem",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
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

                {/* Botón Editar */}
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
                    style={{ width: "30px", height: "30px" }}
                  />
                </button>

                {/* Botón Eliminar */}
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
