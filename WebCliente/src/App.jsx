import React, { useState } from "react";
import ListaClientes from "./components/ListaClientes";

function App() {
  const [vista, setVista] = useState("Consulta");

  const renderContenido = () => {
    switch (vista) {
      case "Consulta":
        return <ListaClientes />;
      case "ejercicios":
        return <h2 style={{ color: "white" }}>Ver ejercicios</h2>;
      default:
        return <h2 style={{ color: "white" }}>Selecciona una opción</h2>;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#121212",
      }}
    >
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
        <button style={botonEstilo} onClick={() => setVista("Consulta")}>
          Consultar <br /> membresía
        </button>
        <button style={botonEstilo} onClick={() => setVista("ejercicios")}>
          Ver <br /> ejercicios
        </button>
      </div>

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
