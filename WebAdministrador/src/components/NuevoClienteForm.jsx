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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212", // opcional: fondo general
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#1e1e1e",
          color: "white",
          padding: "2rem",
          borderRadius: "10px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          textAlign: "center",
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
          placeholder="RUT (sin puntos y con guión ej: 9-4)"
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

        <button
          type="submit"
          style={{
            backgroundColor: "#444",
            color: "white",
            padding: "0.75rem 0.75rem",
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
    </div>
  );
}

const inputStyle = {
  width: "100%",
  maxWidth: "370px",
  padding: "0.5rem",
  margin: "0.5rem auto",
  borderRadius: "5px",
  border: "1px solid #666",
  backgroundColor: "#2a2a2a",
  color: "white",
  display: "block",
};

export default NuevoClienteForm;
