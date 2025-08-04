import { useState, useEffect } from "react";

function Consulta({ usuario }) {
  const [estadoInfo, setEstadoInfo] = useState(null);

  useEffect(() => {
    if (usuario && usuario.fechaultimopago) {
      setEstadoInfo(calcularEstado(usuario.fechaultimopago));
    }
  }, [usuario]);

  const calcularEstado = (fecha) => {
    if (!fecha) return null;

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

  const colorMap = {
    verde: "#4CAF50",
    amarillo: "#FFB300",
    rojo: "#E53935",
  };

  if (!usuario)
    return (
      <p
        style={{
          color: "#bbb",
          fontSize: "1.2rem",
          textAlign: "center",
          marginTop: "2rem",
        }}
      >
        Cargando usuario...
      </p>
    );

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Información del usuario</h2>
      <div style={styles.row}>
        <span style={styles.label}>Nombre:</span>
        <span style={styles.value}>{usuario.nombre}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Apellido:</span>
        <span style={styles.value}>{usuario.apellido}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>RUT:</span>
        <span style={styles.value}>{usuario.rut}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Correo:</span>
        <span style={styles.value}>{usuario.correo}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Último pago:</span>
        <span style={styles.value}>
          {usuario.fechaultimopago || "No disponible"}
        </span>
      </div>

      {estadoInfo ? (
        <>
          <div style={styles.estadoContainer}>
            <span style={styles.label}>Estado de membresía:</span>
            <div
              style={{
                ...styles.estadoIndicador,
                backgroundColor: colorMap[estadoInfo.estado],
                boxShadow: `0 0 8px ${colorMap[estadoInfo.estado]}88`,
              }}
              title={`Estado: ${estadoInfo.estado}`}
            />
            <span style={styles.diasRestantes}>
              {estadoInfo.diasRestantes} día
              {estadoInfo.diasRestantes !== 1 ? "s" : ""} restantes
            </span>
          </div>
          <p style={styles.vence}>
            <strong>Vence el:</strong> {estadoInfo.fechaVencimiento}
          </p>
        </>
      ) : (
        <p style={styles.noInfo}>Información de membresía no disponible.</p>
      )}
    </div>
  );
}

// === ESTILOS ===
const styles = {
  card: {
    backgroundColor: "#222",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "450px",
    margin: "2rem auto",
    boxShadow: "0 8px 16px rgba(0,0,0,0.6)",
    color: "#eee",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "1.5rem",
    fontWeight: "700",
    fontSize: "1.8rem",
    color: "#90caf9",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.9rem",
    fontSize: "1.1rem",
  },
  label: {
    fontWeight: "600",
    color: "#90caf9",
  },
  value: {
    fontWeight: "400",
    color: "#ddd",
  },
  estadoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    marginTop: "1.8rem",
  },
  estadoIndicador: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "2px solid #444",
  },
  diasRestantes: {
    fontSize: "1rem",
    color: "#fff",
    fontWeight: "600",
  },
  vence: {
    marginTop: "0.6rem",
    fontSize: "1rem",
    color: "#bbb",
    textAlign: "center",
  },
  noInfo: {
    fontStyle: "italic",
    textAlign: "center",
    marginTop: "1.5rem",
    color: "#999",
  },
};

export default Consulta;
