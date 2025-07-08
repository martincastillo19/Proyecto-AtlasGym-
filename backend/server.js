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

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
