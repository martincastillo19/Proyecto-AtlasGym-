import { useEffect, useState } from "react";

function ListaClientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [resultado, setResultado] = useState(null);

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
    const [dia, mes, anio] = fecha.split("/").map((v) => parseInt(v));
    const fechaPago = new Date(2000 + anio, mes - 1, dia);
    const hoy = new Date();

    const diferenciaDias = Math.floor(
      (hoy - fechaPago) / (1000 * 60 * 60 * 24)
    );

    const diasRestantes = 30 - diferenciaDias;

    let estado = "rojo";
    if (diasRestantes > 7) estado = "verde";
    else if (diasRestantes > 0) estado = "amarillo";

    return { estado, diasRestantes: Math.max(diasRestantes, 0) };
  };

  const buscarCliente = () => {
    const busqueda = filtro.trim().toLowerCase();
    if (!busqueda) {
      setResultado(null);
      return;
    }
    const encontrado = clientes.find(
      (c) =>
        c.rut.toLowerCase() === busqueda || c.correo.toLowerCase() === busqueda
    );
    setResultado(encontrado || "No encontrado");
  };

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
  };

  const buttonStyle = {
    backgroundColor: "#444",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.3s",
    marginBottom: "1rem",
    width: "100%",
  };

  const containerStyle = {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: "2rem",
    borderRadius: "10px",
    maxWidth: "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    textAlign: "center",
  };

  const resultadoStyle = {
    marginTop: "1rem",
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
    textAlign: "left",
    lineHeight: "1.5",
  };

  return (
    <div style={containerStyle}>
      <h2>Buscar cliente por RUT o correo</h2>
      <input
        type="text"
        placeholder="Ingrese RUT o correo"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        style={inputStyle}
      />
      <button
        onClick={buscarCliente}
        style={buttonStyle}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#666")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#444")}
      >
        Buscar
      </button>

      {resultado === "No encontrado" && (
        <p style={{ fontWeight: "bold" }}>No se encontró cliente.</p>
      )}

      {resultado && resultado !== "No encontrado" && (
        <div style={resultadoStyle}>
          <p>
            <strong>Nombre:</strong> {resultado.nombre}
          </p>
          <p>
            <strong>Apellido:</strong> {resultado.apellido}
          </p>
          <p>
            <strong>RUT:</strong> {resultado.rut}
          </p>
          <p>
            <strong>Correo:</strong> {resultado.correo}
          </p>
          <p>
            <strong>Último Pago:</strong> {resultado.ultimoPago}
          </p>
          <p>
            <strong>Días restantes:</strong>{" "}
            {calcularEstado(resultado.ultimoPago).diasRestantes}
          </p>
        </div>
      )}
    </div>
  );
}

export default ListaClientes;
