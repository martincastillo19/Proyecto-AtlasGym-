import React, { useState, useEffect } from "react";
import ListaClientes from "./components/ListaClientes";

function App() {
  const [vista, setVista] = useState("Consulta");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        flexDirection: isMobile ? "column" : "row",
        height: "100vh",
        backgroundColor: "#121212",
      }}
    >
      <div
        style={{
          width: isMobile ? "100%" : "220px",
          backgroundColor: "#1e1e1e",
          padding: "1rem",
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: "1rem",
          alignItems: "center",
          justifyContent: isMobile ? "space-around" : "flex-start",
        }}
      >
        {!isMobile && (
          <div>
            <img
              src="/assets/atlaslogo_blanco.png"
              alt="Logo"
              style={{
                width: "100px",
                display: "block",
                margin: "0 auto",
              }}
            />
          </div>
        )}
        <button
          style={botonEstilo(isMobile)}
          onClick={() => setVista("Consulta")}
        >
          Consultar <br /> membresía
        </button>
        <button
          style={botonEstilo(isMobile)}
          onClick={() => setVista("ejercicios")}
        >
          Ver <br /> ejercicios
        </button>
      </div>

      <div style={{ flex: 1, padding: isMobile ? "1rem" : "2rem" }}>
        {renderContenido()}
      </div>
    </div>
  );
}

const botonEstilo = (isMobile) => ({
  backgroundColor: "#444",
  color: "white",
  border: "none",
  padding: isMobile ? "0.8rem" : "1rem",
  borderRadius: "8px",
  fontSize: isMobile ? "0.9rem" : "1rem",
  cursor: "pointer",
  transition: "background-color 0.3s",
  textAlign: "center",
  width: isMobile ? "45%" : "100%",
});

export default App;
