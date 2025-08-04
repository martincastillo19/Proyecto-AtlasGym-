import React, { useState, useEffect } from "react";

function NuevoClienteForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    contrasenha: "",
  });

  const [mostrarFechas, setMostrarFechas] = useState(false);
  const [rutError, setRutError] = useState("");

  useEffect(() => {
    document.body.style.overflow = mostrarFechas ? "hidden" : "auto";
  }, [mostrarFechas]);

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

  function formatearRut(value) {
    let valor = value.replace(/[^0-9kK]/g, "").toUpperCase();
    if (valor.length === 0) return "";
    if (valor.length === 1) return valor;
    const cuerpo = valor.slice(0, -1);
    const dv = valor.slice(-1);
    return cuerpo + "-" + dv;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nuevoValor = value;
    if (name === "rut") {
      nuevoValor = formatearRut(value);
      setRutError("");
    }

    setFormData({
      ...formData,
      [name]: nuevoValor,
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
    const clienteString = `cliente|${formData.nombre}|${formData.apellido}|${
      formData.rut
    }|${formData.correo}|${
      formData.contrasenha
    }|${getFechaHoy()}|${getFechaVencimiento()}`;

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
          contrasenha: "",
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
    <form onSubmit={(e) => e.preventDefault()} style={estilos.form}>
      <h2 style={estilos.titulo}>Nuevo Cliente</h2>
      Nombre
      <input
        type="text"
        name="nombre"
        placeholder="ej: Juan"
        value={formData.nombre}
        onChange={handleChange}
        required
        style={estilos.input}
      />
      Apellido
      <input
        type="text"
        name="apellido"
        placeholder="ej: Pérez"
        value={formData.apellido}
        onChange={handleChange}
        required
        style={estilos.input}
      />
      RUT
      <input
        type="text"
        name="rut"
        placeholder='ej: 12345678-9 o "sin rut"'
        value={formData.rut}
        onChange={handleChange}
        required
        style={estilos.input}
      />
      {rutError && <div style={estilos.error}>{rutError}</div>}
      Correo
      <input
        type="email"
        name="correo"
        placeholder="ej: juan.perez@correo.com"
        value={formData.correo}
        onChange={handleChange}
        required
        style={estilos.input}
      />
      Contraseña
      <input
        type="password"
        name="contrasenha"
        placeholder="ej: MiClaveSegura123"
        value={formData.contrasenha}
        onChange={handleChange}
        required
        style={estilos.input}
      />
      {mostrarFechas ? (
        <div style={estilos.fechasContainer}>
          <p>
            <strong>Fecha actual:</strong> {getFechaHoy()}
          </p>
          <p>
            <strong>Fecha de vencimiento:</strong> {getFechaVencimiento()}
          </p>
          <div style={estilos.botonesContainer}>
            <button
              type="button"
              onClick={handleConfirmar}
              style={estilos.botonConfirmar}
            >
              Confirmar e Ingresar
            </button>
            <button
              type="button"
              onClick={handleCancelar}
              style={estilos.botonCancelar}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          style={estilos.botonIngresar}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#666")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
        >
          Ingresar Cliente
        </button>
      )}
    </form>
  );
}

export default NuevoClienteForm;

// === ESTILOS ===
const estilos = {
  form: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: "2rem",
    borderRadius: "10px",
    width: "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
  },
  titulo: {
    textAlign: "center",
  },
  input: {
    display: "block",
    width: "100%",
    maxWidth: "360px",
    margin: "0 auto 1rem",
    boxSizing: "border-box",
    padding: "0.5rem",
    backgroundColor: "#2a2a2a",
    color: "white",
    border: "1px solid #555",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  fechasContainer: {
    marginTop: "1rem",
    marginBottom: "1rem",
    textAlign: "center",
    border: "1px solid #555",
    padding: "0.5rem",
    borderRadius: "6px",
  },
  botonesContainer: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "1rem",
  },
  botonConfirmar: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  botonCancelar: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  botonIngresar: {
    backgroundColor: "#444",
    color: "white",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    width: "100%",
    transition: "background-color 0.3s",
  },
};
