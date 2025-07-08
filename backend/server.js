const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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

app.get("/clientes", (req, res) => {
  fs.readFile("clientes.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer:", err);
      return res.status(500).send("Error al leer");
    }
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
