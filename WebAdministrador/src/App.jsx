import React, { useState } from "react";
import NuevoClienteForm from "./components/NuevoClienteForm";
import ListaMembresia from "./components/ListaMembresias";

function App() {
  const [vista, setVista] = useState("membresias");

  const renderContenido = () => {
    switch (vista) {
      case "membresias":
        return <ListaMembresia />;
      case "registrar":
        return <NuevoClienteForm />;
      case "ejercicios":
        return <h2 style={{ color: "white" }}>Administrar Ejercicios</h2>;
      case "inventario":
        return <h2 style={{ color: "white" }}>Inventario</h2>;
      default:
        return <NuevoClienteForm />;
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#121212" }}
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
        <button style={botonEstilo} onClick={() => setVista("membresias")}>
          Lista de
          <br />
          membresías
        </button>
        <button style={botonEstilo} onClick={() => setVista("registrar")}>
          Registrar
          <br />
          Usuario
        </button>
        <button style={botonEstilo} onClick={() => setVista("ejercicios")}>
          Administrar
          <br />
          Ejercicios
        </button>
        <button style={botonEstilo} onClick={() => setVista("inventario")}>
          Inventario
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
