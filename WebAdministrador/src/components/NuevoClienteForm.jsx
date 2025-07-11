import React, { useState } from "react";

function NuevoClienteForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
  });

  const [mostrarFechas, setMostrarFechas] = useState(false);
  const [rutError, setRutError] = useState("");

  const validarRut = (rut) => {
    const valor = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
    if (!/^\d{7,8}[0-9K]$/.test(valor)) return false;

    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvFinal = "";

    if (dvEsperado === 11) dvFinal = "0";
    else if (dvEsperado === 10) dvFinal = "K";
    else dvFinal = dvEsperado.toString();

    return dvFinal === dv;
  };

  const esCorreoValido = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "rut") setRutError("");
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

    const rutValido =
      formData.rut.toLowerCase() === "sin rut" ||
      validarRut(formData.rut) ||
      (esCorreoValido(formData.correo) &&
        formData.rut.toLowerCase() === "sin rut");

    if (!rutValido) {
      setRutError(
        'RUT inválido. Usa formato válido (ej: 12345678-9) o "sin rut" si no tiene.'
      );
      return;
    }

    setMostrarFechas(true);
  };

  const handleCancelar = () => {
    setMostrarFechas(false);
    setRutError("");
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
        setRutError("");
      } else {
        alert("Error al guardar el cliente");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} style={formStyle}>
      <h2 style={tituloStyle}>Nuevo Cliente</h2>

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
        placeholder='RUT (ej: 12345678-9 o "sin rut")'
        value={formData.rut}
        onChange={handleChange}
        required
        style={inputStyle}
      />
      {rutError && <div style={errorStyle}>{rutError}</div>}
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
        <div style={fechasContainerStyle}>
          <p>
            <strong>Fecha actual:</strong> {getFechaHoy()}
          </p>
          <p>
            <strong>Fecha de vencimiento:</strong> {getFechaVencimiento()}
          </p>
          <div style={botonesContainerStyle}>
            <button
              type="button"
              onClick={handleConfirmar}
              style={botonConfirmarStyle}
            >
              Confirmar e Ingresar
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              style={botonCancelarStyle}
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
          style={botonIngresarStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#666")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
        >
          Ingresar Cliente
        </button>
      )}
    </form>
  );
}

const formStyle = {
  backgroundColor: "#1e1e1e",
  color: "white",
  padding: "2rem",
  borderRadius: "10px",
  maxWidth: "400px",
  margin: "2rem auto",
  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
};

const tituloStyle = {
  textAlign: "center",
};

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

const errorStyle = {
  color: "red",
  marginBottom: "1rem",
  fontSize: "0.9rem",
};

const fechasContainerStyle = {
  marginTop: "1rem",
  marginBottom: "1rem",
  textAlign: "center",
  border: "1px solid #555",
  padding: "0.5rem",
  borderRadius: "6px",
};

const botonesContainerStyle = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  marginTop: "1rem",
};

const botonConfirmarStyle = {
  backgroundColor: "#28a745",
  color: "white",
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonCancelarStyle = {
  backgroundColor: "#dc3545",
  color: "white",
  padding: "0.5rem 1rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
};

const botonIngresarStyle = {
  backgroundColor: "#444",
  color: "white",
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "1rem",
  width: "100%",
  transition: "background-color 0.3s",
};

export default NuevoClienteForm;
