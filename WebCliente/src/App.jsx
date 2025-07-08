import React, { useState } from "react";
import ListaClientes from "./components/ListaClientes";

function App() {
  const [vista, setVista] = useState("consulta");

  const renderContenido = () => {
    switch (vista) {
      case "consulta":
        return <ListaClientes />;
      case "ejercicios":
        return <h2 style={{ color: "white" }}>Ejercicios</h2>;
      default:
        return <ListaClientes />;
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#121212" }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          backgroundColor: "#1e1e1e",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <img
            src="/assets/atlaslogo_blanco.png"
            alt="Logo"
            style={{
              width: "100px", // o el tamaño que tú prefieras
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
        <button style={botonEstilo} onClick={() => setVista("consulta")}>
          Consulta de
          <br />
          membresía
        </button>
        <button style={botonEstilo} onClick={() => setVista("ejercicios")}>
          Ejercicios
        </button>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, padding: "2rem" }}>{renderContenido()}</div>
    </div>
  );
}

const botonEstilo = {
  backgroundColor: "#444",
  color: "white",
  border: "none",
  padding: "1rem",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
  transition: "background-color 0.3s",
  textAlign: "left",
};

export default App;
