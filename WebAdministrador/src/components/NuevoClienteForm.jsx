import React, { useState } from "react";

function NuevoClienteForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    ultimoPago: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clienteString = `${formData.nombre}|${formData.apellido}|${formData.rut}|${formData.correo}|${formData.ultimoPago}`;

    try {
      const response = await fetch("http://localhost:3000/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: clienteString }),
      });

      if (response.ok) {
        alert("Cliente guardado con éxito");
        setFormData({
          nombre: "",
          apellido: "",
          rut: "",
          correo: "",
          ultimoPago: "",
        });
      } else {
        alert("Error al guardar el cliente");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: "#1e1e1e",
        color: "white",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "400px",
        margin: "2rem auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        textAlign: "center", // Aquí centramos el texto
        fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
      }}
    >
      <h2>Nuevo Cliente</h2>

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
      <input
        type="text"
        name="ultimoPago"
        placeholder="Día de último pago (dd/mm/aa)"
        value={formData.ultimoPago}
        onChange={handleChange}
        required
        style={inputStyle}
      />

      <button
        type="submit"
        style={{
          backgroundColor: "#444",
          color: "white",
          padding: "0.75rem 1.5rem",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem",
          marginTop: "1rem",
          width: "100%",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#666")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
      >
        Ingresar Cliente
      </button>
    </form>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "0.5rem",
  marginBottom: "1rem",
  backgroundColor: "#2a2a2a",
  color: "white",
  border: "1px solid #555",
  borderRadius: "5px",
  fontSize: "1rem",
  textAlign: "center", // Centrar texto dentro de los inputs
};

export default NuevoClienteForm;
