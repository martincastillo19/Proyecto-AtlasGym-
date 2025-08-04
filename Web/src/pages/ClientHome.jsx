import React, { useState, useEffect } from "react";
import Consulta from "../client/Consulta";
import VerEjercicios from "../client/VerEjercicios";
import { useNavigate } from "react-router-dom";

function ClientHome({ setTipoUsuario }) {
  const [vista, setVista] = useState("Consulta");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("usuario");
    if (userStr) {
      setUsuario(JSON.parse(userStr));
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("tipoUsuario");
    localStorage.removeItem("usuario");
    setTipoUsuario(null);
    navigate("/");
  };

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
        return <Consulta usuario={usuario} />;
      case "ejercicios":
        return <VerEjercicios />;
      default:
        return <h2 style={{ color: "white" }}>Selecciona una opción</h2>;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: "98vh",
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

        {isMobile ? (
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button onClick={cerrarSesion} style={botonCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button onClick={cerrarSesion} style={botonCerrarSesion}>
            Cerrar sesión
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          padding: isMobile ? "1rem" : "2rem",
          maxWidth: "100%",
          maxheight: "90%",
          margin: "0 auto",
          maxHeight: "calc(100vh - 2rem)",
        }}
      >
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

const botonCerrarSesion = {
  marginTop: "auto",
  backgroundColor: "#ff4d4d",
  color: "white",
  border: "none",
  padding: "0.8rem",
  borderRadius: "8px",
  fontSize: "1rem",
  cursor: "pointer",
  width: "100%",
};

export default ClientHome;
