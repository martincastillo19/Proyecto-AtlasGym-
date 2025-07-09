import React, { useState } from "react";

function NuevoClienteForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
  });

  const [mostrarFechas, setMostrarFechas] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getFechaHoy = () => {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = String(hoy.getFullYear()).slice(-2);
    return `${dia}/${mes}/${anio}`;
  };

  const getFechaVencimiento = () => {
    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 30);
    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = String(hoy.getFullYear());
    return `${dia}/${mes}/${anio}`;
  };

  const handleClick = (e) => {
    e.preventDefault();
    setMostrarFechas(true);
  };

  const handleCancelar = () => {
    setMostrarFechas(false);
  };

  const handleConfirmar = async () => {
    const fechaHoy = getFechaHoy();
    const clienteString = `${formData.nombre}|${formData.apellido}|${formData.rut}|${formData.correo}|${fechaHoy}`;

    try {
      const response = await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: clienteString }),
      });

      if (response.ok) {
        setFormData({
          nombre: "",
          apellido: "",
          rut: "",
          correo: "",
        });
        setMostrarFechas(false);
      } else {
        alert("Error al guardar el cliente");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{
        backgroundColor: "#1e1e1e",
        color: "white",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "400px",
        margin: "2rem auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Nuevo Cliente</h2>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <input
        type="text"
        name="apellido"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <input
        type="text"
        name="rut"
        placeholder="RUT (ej: 9-4)"
        value={formData.rut}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      <input
        type="email"
        name="correo"
        placeholder="Correo"
        value={formData.correo}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      {mostrarFechas && (
        <div
          style={{
            marginTop: "1rem",
            marginBottom: "1rem",
            textAlign: "center",
            border: "1px solid #555",
            padding: "0.5rem",
            borderRadius: "6px",
          }}
        >
          <p>
            <strong>Fecha actual:</strong> {getFechaHoy()}
          </p>
          <p>
            <strong>Fecha de vencimiento:</strong> {getFechaVencimiento()}
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            <button
              type="button"
              onClick={handleConfirmar}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Confirmar e Ingresar
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!mostrarFechas && (
        <button
          type="button"
          onClick={handleClick}
          style={{
            backgroundColor: "#444",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "1rem",
            width: "100%",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#666")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
        >
          Ingresar Cliente
        </button>
      )}
    </form>
  );
}

const inputStyle = {
  display: "block",
  width: "380px",
  padding: "0.5rem",
  marginBottom: "1rem",
  backgroundColor: "#2a2a2a",
  color: "white",
  border: "1px solid #555",
  borderRadius: "5px",
  fontSize: "1rem",
};

export default NuevoClienteForm;
