import { useEffect, useState } from "react";

function Consulta() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [resultado, setResultado] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [nuevaFecha, setNuevaFecha] = useState("");

  const validarRut = (rut) => {
    rut = rut.replace(/\s+/g, "").toLowerCase();
    const rutRegex = /^(\d{7,8})-([\dk])$/;
    const match = rut.match(rutRegex);
    if (!match) return false;

    const cuerpo = match[1];
    const dv = match[2];

    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado =
      dvEsperado === 11 ? "0" : dvEsperado === 10 ? "k" : dvEsperado.toString();

    return dv === dvCalculado;
  };

  const calcularEstado = (fecha) => {
    const [dia, mes, anio] = fecha.split("/").map((v) => parseInt(v));
    const fechaPago = new Date(2000 + anio, mes - 1, dia);
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

    const vencimientoFormateado = fechaVencimiento.toLocaleDateString("es-CL");

    return {
      estado,
      diasRestantes: Math.max(diasRestantes, 0),
      fechaVencimiento: vencimientoFormateado,
    };
  };

  const buscarCliente = () => {
    const busqueda = filtro.trim().toLowerCase();
    if (!busqueda) {
      setResultado(null);
      return;
    }

    if (!busqueda.includes("@")) {
      if (!validarRut(busqueda)) {
        setResultado("RUT inválido");
        return;
      }
    }

    const encontrado = clientes.find(
      (c) =>
        c.rut.toLowerCase() === busqueda || c.correo.toLowerCase() === busqueda
    );

    setResultado(encontrado || "No encontrado");
  };

  // función para actualizar la fecha de pago
  const actualizarFecha = async () => {
    if (!nuevaFecha || !resultado) return;

    // Convertir de yyyy-mm-dd a dd/mm/yy
    const [anio, mes, dia] = nuevaFecha.split("-");
    const nuevoPagoFormateado = `${dia}/${mes}/${anio.slice(-2)}`;

    try {
      const res = await fetch(
        `http://localhost:3000/clientes/${resultado.rut}/vencimiento`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevoPago: nuevoPagoFormateado }),
        }
      );

      if (res.ok) {
        alert("Fecha de pago actualizada con éxito.");
        // Actualizar el cliente en el array general
        setClientes((prevClientes) =>
          prevClientes.map((c) =>
            c.rut === resultado.rut
              ? { ...c, ultimoPago: nuevoPagoFormateado }
              : c
          )
        );
        // Actualizar en el resultado de búsqueda
        setResultado({ ...resultado, ultimoPago: nuevoPagoFormateado });
        setNuevaFecha(""); // Limpiar el input
      } else {
        alert("Error al actualizar la fecha en el servidor.");
      }
    } catch (error) {
      console.error("Error en la actualización:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const containerStyle = {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: isMobile ? "1rem" : "2rem",
    borderRadius: "10px",
    maxWidth: isMobile ? "90%" : "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    textAlign: "center",
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

  const inputStyle = {
    display: "block",
    width: "95.5%",
    padding: "0.5rem",
    marginBottom: "1rem",
    backgroundColor: "#2a2a2a",
    color: "white",
    border: "1px solid #555",
    borderRadius: "5px",
    fontSize: isMobile ? "0.9rem" : "1rem",
  };

  const buttonStyle = {
    backgroundColor: "#444",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: isMobile ? "0.9rem" : "1rem",
    transition: "background-color 0.3s",
    marginBottom: "1rem",
    width: "100%",
  };

  const resultadoStyle = {
    marginTop: "1rem",
    backgroundColor: "#2a2a2a",
    padding: "1rem",
    borderRadius: "8px",
    textAlign: "left",
    lineHeight: "1.5",
    fontSize: isMobile ? "0.9rem" : "1rem",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>
        Consultar estado membresía
      </h2>
      <input
        type="text"
        placeholder="Ingrese RUT (sin puntos y con guión) o correo"
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

      {resultado === "RUT inválido" && (
        <p style={{ fontWeight: "bold", color: "tomato" }}>
          RUT inválido. Asegúrese de usar el formato correcto (12345678-k).
        </p>
      )}

      {resultado === "No encontrado" && (
        <p style={{ fontWeight: "bold" }}>No se encontró cliente.</p>
      )}

      {resultado &&
        typeof resultado === "object" &&
        (() => {
          const { estado, diasRestantes, fechaVencimiento } = calcularEstado(
            resultado.ultimoPago
          );
          const colorMap = {
            verde: "limegreen",
            amarillo: "gold",
            rojo: "red",
          };

          return (
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
                <strong>Último pago:</strong> {resultado.ultimoPago}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                <strong>Estado:</strong>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: colorMap[estado],
                    borderRadius: "4px",
                    border: "1px solid #999",
                  }}
                >
                  <strong>Estado:</strong>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: colorMap[estado],
                      borderRadius: "4px",
                      border: "1px solid #999",
                    }}
                  />
                  <span>{diasRestantes} días restantes</span>
                </div>
                <p style={{ marginTop: "0.5rem" }}>
                  <strong>Vence el:</strong> {fechaVencimiento}
                </p>

                {/* NUEVA SECCIÓN PARA ACTUALIZAR */}
                <div style={{ marginTop: "1rem" }}>
                  <label>
                    <strong>Actualizar fecha de pago:</strong>
                  </label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    style={{ ...inputStyle, marginTop: "0.5rem" }}
                  />
                  <button onClick={actualizarFecha} style={buttonStyle}>
                    Guardar nueva fecha
                  </button>
                </div>
              </div>
              <p style={{ marginTop: "0.5rem" }}>
                <strong>Vence el:</strong> {fechaVencimiento}
              </p>

              {/* NUEVA SECCIÓN PARA ACTUALIZAR */}
              <div style={{ marginTop: "1rem" }}>
                <label>
                  <strong>Actualizar fecha de pago:</strong>
                </label>
                <input
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  style={{ ...inputStyle, marginTop: "0.5rem" }}
                />
                <button onClick={actualizarFecha} style={buttonStyle}>
                  Guardar nueva fecha
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default Consulta;
