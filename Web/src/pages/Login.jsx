import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_PIN = "123456";

function Login({ setTipoUsuario, setUsuario }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [registro, setRegistro] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    pin: "",
  });

  // Estado local para usuarios registrados (en producción usar API)
  const [usuarios, setUsuarios] = useState([]);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut: username, password }),
      });

      if (!res.ok) {
        setError("Usuario o contraseña incorrectos.");
        return;
      }

      const usuario = await res.json();
      localStorage.setItem("tipoUsuario", usuario.rol);
      localStorage.setItem("usuario", JSON.stringify(usuario));
      setTipoUsuario(usuario.rol);
      setUsuario(usuario);
      navigate(usuario.rol === "admin" ? "/admin" : "/cliente");
    } catch (err) {
      setError("Error en la conexión al servidor.");
    }
  };

  const handleRegistro = (e) => {
    e.preventDefault();
    const { nombre, apellido, rut, correo, pin } = registro;

    if (pin !== ADMIN_PIN) {
      setError("PIN incorrecto. Solo los administradores pueden registrar.");
      return;
    }

    // Aquí agregarías llamada API para registrar el usuario en backend
    // Por ahora actualizamos localmente:
    const nuevoCliente = {
      username: rut,
      password: rut.slice(-4), // contraseña inicial = últimos 4 dígitos del rut
      rol: "cliente",
      nombre,
      apellido,
      rut,
      correo,
      fechaultimopago: "",
      fechavencimiento: "",
    };

    setUsuarios([...usuarios, nuevoCliente]);
    setMostrarModal(false);
    setRegistro({ nombre: "", apellido: "", rut: "", correo: "", pin: "" });
    setError("");
    alert("Cliente registrado correctamente.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="RUT"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Ingresar
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
        <button
          onClick={() => setMostrarModal(true)}
          style={styles.linkButton}
          type="button"
        >
          Registrar Usuario (Admin)
        </button>
      </div>

      {/* Modal de registro */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Registro de nuevo cliente</h3>
            <form onSubmit={handleRegistro} style={styles.modalForm}>
              <input
                type="text"
                placeholder="Nombre"
                value={registro.nombre}
                onChange={(e) =>
                  setRegistro({ ...registro, nombre: e.target.value })
                }
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Apellido"
                value={registro.apellido}
                onChange={(e) =>
                  setRegistro({ ...registro, apellido: e.target.value })
                }
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="RUT"
                value={registro.rut}
                onChange={(e) =>
                  setRegistro({ ...registro, rut: e.target.value })
                }
                required
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Correo"
                value={registro.correo}
                onChange={(e) =>
                  setRegistro({ ...registro, correo: e.target.value })
                }
                required
                style={styles.input}
              />
              <input
                type="password"
                placeholder="PIN de administrador"
                value={registro.pin}
                onChange={(e) =>
                  setRegistro({ ...registro, pin: e.target.value })
                }
                required
                style={styles.input}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.button}>
                  Registrar
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setMostrarModal(false);
                    setError("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#121212",
    color: "white",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#1e1e1e",
    padding: "2rem",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 0 15px rgba(255,255,255,0.05)",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  input: {
    margin: "10px 0",
    padding: "10px",
    width: "250px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#2c2c2c",
    color: "white",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  cancelButton: {
    marginLeft: "10px",
    padding: "10px 20px",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#4FC3F7",
    marginTop: "20px",
    cursor: "pointer",
    fontSize: "1rem",
    textDecoration: "underline",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    padding: "2rem",
    borderRadius: "10px",
    width: "300px",
    color: "white",
    textAlign: "center",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  modalButtons: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
};

export default Login;
