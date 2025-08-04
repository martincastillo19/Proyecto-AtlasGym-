import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setTipoUsuario, setUsuario }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <img
          src="/assets/atlaslogo_blanco.png"
          alt="Atlas Logo Izquierdo"
          style={styles.logo}
        />
      </div>

      <div style={styles.box}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <label htmlFor="rutInput" style={styles.label}>
            RUT
          </label>
          <input
            id="rutInput"
            type="text"
            placeholder="RUT"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          <label htmlFor="passwordInput" style={styles.label}>
            Contraseña
          </label>
          <div style={styles.passwordWrapper}>
            <input
              id="passwordInput"
              type={mostrarPasswordLogin ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <img
              src={
                mostrarPasswordLogin ? "/assets/ocultar.png" : "/assets/ojo.png"
              }
              alt={
                mostrarPasswordLogin
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              onClick={() => setMostrarPasswordLogin(!mostrarPasswordLogin)}
              style={styles.showIcon}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setMostrarPasswordLogin(!mostrarPasswordLogin);
                }
              }}
            />
          </div>

          <button type="submit" style={styles.button}>
            Ingresar
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
      <div style={styles.logoContainer}>
        <img
          src="/assets/atlaslogo_blanco.png"
          alt="Atlas Logo Derecho"
          style={styles.logo}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#121212",
    color: "white",
    minHeight: "98vh",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem",
    padding: "2rem",
    overflow: "hidden",
    flexWrap: "nowrap",
    boxSizing: "border-box",
    width: "100%",
  },

  logoContainer: {
    flexShrink: 0,
    overflow: "hidden",
  },
  logo: {
    width: "400px",
    height: "400px",
    maxHeight: "88vh",
    objectFit: "contain",
  },
  box: {
    backgroundColor: "#1e1e1e",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 0 15px rgba(255,255,255,0.05)",
    width: "360px",
  },
  title: {
    fontSize: "2rem",
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "6px",
    fontWeight: "600",
    fontSize: "0.95rem",
    marginLeft: "2px",
  },
  input: {
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#2c2c2c",
    color: "white",
    fontSize: "1rem",
    marginBottom: "20px",
    paddingRight: "3rem",
    boxSizing: "border-box",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "20px",
  },
  showIcon: {
    position: "absolute",
    right: "10px",
    top: "40%",
    transform: "translateY(-50%)",
    width: "22px",
    height: "22px",
    cursor: "pointer",
    opacity: 0.8,
    userSelect: "none",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    transition: "background-color 0.3s",
    width: "100%",
  },
  error: {
    color: "#ff6b6b",
    marginTop: "10px",
    fontWeight: "600",
    textAlign: "center",
  },
};

export default Login;
