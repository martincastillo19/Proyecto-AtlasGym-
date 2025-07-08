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
    <form onSubmit={handleSubmit}>
      <h2>Nuevo Cliente</h2>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
      />
      <br />
      <input
        type="text"
        name="apellido"
        placeholder="Apellido"
        value={formData.apellido}
        onChange={handleChange}
        required
      />
      <br />
      <input
        type="text"
        name="rut"
        placeholder="RUT (ej: 9-4)"
        value={formData.rut}
        onChange={handleChange}
        required
      />
      <br />
      <input
        type="email"
        name="correo"
        placeholder="Correo"
        value={formData.correo}
        onChange={handleChange}
        required
      />
      <br />
      <input
        type="text"
        name="ultimoPago"
        placeholder="Día de último pago (dd/mm/aa)"
        value={formData.ultimoPago}
        onChange={handleChange}
        required
      />
      <br />

      <button type="submit">Ingresar Cliente</button>
    </form>
  );
}

export default NuevoClienteForm;
