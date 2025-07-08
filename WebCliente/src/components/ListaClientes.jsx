import { useEffect, useState } from "react";

function ListaClientes() {
  const [clientes, setClientes] = useState([]); // Array de objetos
  const [filtro, setFiltro] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/clientes")
      .then((res) => res.text())
      .then((data) => {
        // Parsear cada línea en objeto
        const arr = data
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const [nombre, apellido, rut, correo, fecha] = line.split("|");
            return { nombre, apellido, rut, correo, fecha };
          });
        setClientes(arr);
      })
      .catch((err) => console.error("Error al obtener clientes:", err));
  }, []);

  // Buscar cliente que coincida con filtro (rut o correo)
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

  return (
    <div>
      <h2>Buscar cliente por RUT o correo</h2>
      <input
        type="text"
        placeholder="Ingrese RUT o correo"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <button onClick={buscarCliente}>Buscar</button>

      {resultado === "No encontrado" && <p>No se encontró cliente.</p>}

      {resultado && resultado !== "No encontrado" && (
        <div style={{ marginTop: 20 }}>
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
            <strong>Fecha:</strong> {resultado.fecha}
          </p>
        </div>
      )}
    </div>
  );
}

export default ListaClientes;
