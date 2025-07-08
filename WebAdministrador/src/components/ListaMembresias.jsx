import React, { useEffect, useState } from "react";

function ListaMembresia() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/clientes")
      .then((res) => res.text())
      .then((data) => {
        const arr = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, apellido, rut, correo] = line.split("|");
            return { nombre, apellido, rut, correo };
          });
        setClientes(arr);
      })
      .catch((err) => console.error("Error al obtener clientes:", err));
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
      c.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
      c.rut.toLowerCase().includes(filtro.toLowerCase()) ||
      c.correo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "2rem auto",
        backgroundColor: "#1e1e1e",
        padding: "1rem",
        borderRadius: "8px",
        color: "white",
        fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Lista de Membresías</h2>

      <input
        type="text"
        placeholder="Filtrar por cualquier campo"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          borderRadius: "5px",
          border: "1px solid #555",
          backgroundColor: "#2a2a2a",
          color: "white",
          fontSize: "1rem",
        }}
      />

      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #444",
          borderRadius: "5px",
        }}
      >
        {/* Encabezado tipo tabla */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 2fr",
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
        </div>

        {clientesFiltrados.length === 0 ? (
          <p style={{ padding: "1rem", textAlign: "center" }}>
            No hay clientes que mostrar.
          </p>
        ) : (
          clientesFiltrados.map((cliente, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 2fr",
                padding: "0.75rem 1rem",
                backgroundColor: index % 2 === 0 ? "#222" : "#1a1a1a",
                borderBottom: "1px solid #444",
              }}
            >
              <div>{cliente.nombre}</div>
              <div>{cliente.apellido}</div>
              <div>{cliente.rut}</div>
              <div>{cliente.correo}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ListaMembresia;
