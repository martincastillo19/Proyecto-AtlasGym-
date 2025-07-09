// BACKEND - server.js
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Ruta para obtener clientes
app.get("/clientes", (req, res) => {
  fs.readFile("clientes.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer:", err);
      return res.status(500).send("Error al leer");
    }
    res.send(data);
  });
});

// Ruta para guardar nuevo cliente
app.post("/clientes", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).send("Sin datos");

  fs.appendFile("clientes.txt", data + "\n", (err) => {
    if (err) {
      console.error("Error al guardar:", err);
      return res.status(500).send("Error al guardar");
    }
    res.send("Guardado correctamente");
  });
});

// Ruta para eliminar cliente por RUT
app.post("/eliminar", (req, res) => {
  const { rut } = req.body;
  if (!rut) return res.status(400).send("Falta RUT");

  fs.readFile("clientes.txt", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer");

    const lineas = data
      .split("\n")
      .filter((line) => !line.includes(rut))
      .join("\n");

    fs.writeFile("clientes.txt", lineas, (err) => {
      if (err) return res.status(500).send("Error al escribir");
      res.send("Cliente eliminado");
    });
  });
});

// Ruta para editar cliente por RUT + datos antiguos
app.post("/editar", (req, res) => {
  const { nombre, apellido, rut, correo, ultimoPago, datosAntiguos } = req.body;
  if (!rut) return res.status(400).send("Falta RUT");
  if (!datosAntiguos)
    return res.status(400).send("Faltan datos antiguos para reemplazo");

  const lineaAntigua = `${datosAntiguos.nombre}|${datosAntiguos.apellido}|${datosAntiguos.rut}|${datosAntiguos.correo}|${datosAntiguos.ultimoPago}`;

  fs.readFile("clientes.txt", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer");

    const lineas = data.split("\n").filter((linea) => linea.trim() !== "");
    const nuevasLineas =
      lineas
        .filter((linea) => linea !== lineaAntigua) // elimina línea exacta
        .concat(`${nombre}|${apellido}|${rut}|${correo}|${ultimoPago}`)
        .join("\n") + "\n";

    fs.writeFile("clientes.txt", nuevasLineas, (err) => {
      if (err) return res.status(500).send("Error al escribir");
      res.send("Cliente editado correctamente");
    });
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
