const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const USUARIOS_PATH = "./usuarios.txt";
const EJERCICIOS_PATH = "./Ejercicios.txt";
const INVENTARIO_PATH = "./Inventario.txt";
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --------------------- LOGIN ---------------------
app.post("/login", (req, res) => {
  const { rut, password } = req.body;

  if (!rut || !password) {
    return res.status(400).send("Faltan rut o password");
  }

  fs.readFile(USUARIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error leyendo usuarios");

    const lineas = data.split("\n").filter((line) => line.trim() !== "");

    for (let i = 0; i < lineas.length; i++) {
      const campos = lineas[i].split("|");

      if (campos.length < 6 || campos.length > 8) {
        return res
          .status(400)
          .send(`Línea ${i + 1} inválida: campos incorrectos`);
      }

      const [
        rol,
        nombre,
        apellido,
        rutArchivo,
        correo,
        contrasena,
        fechaultimopago = "",
        fechavencimiento = "",
      ] = campos;

      if (rutArchivo === rut && contrasena === password) {
        return res.json({
          rol,
          nombre,
          apellido,
          rut: rutArchivo,
          correo,
          fechaultimopago,
          fechavencimiento,
        });
      }
    }

    return res.status(401).send("Usuario o contraseña incorrectos");
  });
});

// --- RUTAS CLIENTES ---

// Obtener clientes
app.get("/clientes", (req, res) => {
  fs.readFile(USUARIOS_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Error leyendo archivo usuarios:", err);
      return res.status(500).send("Error interno del servidor");
    }

    // Filtrar solo clientes y devolver línea con los campos necesarios separados por "|"
    const clientes = data
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const campos = line.split("|");
        // Asegurarse de que haya al menos 8 campos
        while (campos.length < 8) campos.push("");
        return campos;
      })
      .filter((campos) => campos[0] === "cliente") // Solo clientes
      .map(
        ([
          rol,
          nombre,
          apellido,
          rut,
          correo,
          contrasena,
          fechaultimopago,
          fechavencimiento,
        ]) => [nombre, apellido, rut, correo, fechaultimopago].join("|")
      )
      .join("\n");

    res.send(clientes);
  });
});

// Agregar cliente
app.post("/clientes", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).send("Sin datos");

  // Validar que tenga al menos 6 campos (rol, nombre, apellido, rut, correo, contraseña)
  const campos = data.split("|");
  if (campos.length < 6) {
    return res.status(400).send("Datos incompletos para nuevo cliente");
  }

  // Si faltan fechaultimopago o fechavencimiento, agregarlos vacíos para evitar errores
  while (campos.length < 8) campos.push("");

  // Forzar que rol sea "cliente" para evitar problemas
  campos[0] = "cliente";

  const lineaCompleta = campos.join("|") + "\n";

  fs.appendFile(USUARIOS_PATH, lineaCompleta, (err) => {
    if (err) return res.status(500).send("Error al guardar cliente.");
    res.send("Cliente guardado correctamente.");
  });
});

// Eliminar cliente por RUT y correo
app.post("/clientes/eliminar", (req, res) => {
  const { rut, correo } = req.body;
  if (!rut || !correo) return res.status(400).send("Falta rut o correo");

  fs.readFile(USUARIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer clientes.");

    const lineas = data.split("\n").filter((linea) => {
      if (linea.trim() === "") return false;
      const campos = linea.split("|");
      while (campos.length < 8) campos.push("");
      const [rol, nombre, apellido, r, c] = campos;
      // Eliminar solo si coinciden rut y correo y rol es cliente
      return !(rol === "cliente" && r === rut && c === correo);
    });

    fs.writeFile(USUARIOS_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir clientes.");
      res.send("Cliente eliminado.");
    });
  });
});

// Eliminar cliente por RUT y correo (buscar línea exacta)
app.post("/clientes/eliminar", (req, res) => {
  const { rut, correo } = req.body;
  if (!rut || !correo) return res.status(400).send("Falta rut o correo");

  fs.readFile(USUARIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer clientes.");
    const lineas = data.split("\n").filter((linea) => {
      if (linea.trim() === "") return false;
      const [_, __, r, c] = linea.split("|");
      return !(r === rut && c === correo);
    });

    fs.writeFile(USUARIOS_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir clientes.");
      res.send("Cliente eliminado.");
    });
  });
});

// Actualizar cliente por correo original, validando RUT y correo duplicado
app.put("/clientes/actualizar", (req, res) => {
  const clienteActualizado = req.body;
  if (!clienteActualizado.correoOriginal) {
    return res
      .status(400)
      .send("Falta correoOriginal para identificar cliente.");
  }

  fs.readFile(USUARIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error leyendo clientes.");
    const lineas = data.split("\n").filter((line) => line.trim() !== "");
    let encontrado = false;

    const rutDuplicado = lineas.some((linea) => {
      const campos = linea.split("|");
      const rut = campos[3];
      const correo = campos[4];
      return (
        rut === clienteActualizado.rut &&
        rut !== "sin rut" &&
        correo !== clienteActualizado.correoOriginal
      );
    });

    if (rutDuplicado) {
      return res.status(409).send("Ya existe un cliente con ese RUT.");
    }

    const correoDuplicado = lineas.some((linea) => {
      const campos = linea.split("|");
      const correo = campos[4];
      return (
        correo === clienteActualizado.correo &&
        correo !== clienteActualizado.correoOriginal
      );
    });

    if (correoDuplicado) {
      return res.status(409).send("Ya existe un cliente con ese correo.");
    }

    const nuevasLineas = lineas.map((linea) => {
      const campos = linea.split("|");
      const rol = campos[0];
      const nombre = campos[1];
      const apellido = campos[2];
      const rut = campos[3];
      const correo = campos[4];
      const contrasena = campos[5];
      const fechaultimopago = campos[6];
      const fechavencimiento = campos[7];

      if (correo === clienteActualizado.correoOriginal) {
        encontrado = true;
        return [
          rol,
          clienteActualizado.nombre,
          clienteActualizado.apellido,
          clienteActualizado.rut,
          clienteActualizado.correo,
          contrasena,
          fechaultimopago,
          fechavencimiento,
        ].join("|");
      }
      return linea;
    });

    if (!encontrado) {
      return res.status(404).send("Cliente original no encontrado.");
    }

    fs.writeFile(USUARIOS_PATH, nuevasLineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error escribiendo clientes.");
      res.json({ ok: true, mensaje: "Cliente actualizado correctamente." });
    });
  });
});

// --- RUTA ADMINISTRADOR ---
app.post("/api/registrar", (req, res) => {
  const nuevoUsuario = req.body;

  if (!nuevoUsuario.username || !nuevoUsuario.password || !nuevoUsuario.rol) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  fs.readFile(USUARIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error leyendo archivo" });

    const usuarios = data
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea) => JSON.parse(linea));

    const existe = usuarios.find((u) => u.username === nuevoUsuario.username);
    if (existe) {
      return res.status(409).json({ message: "Usuario ya existe" });
    }

    fs.appendFile(USUARIOS_PATH, JSON.stringify(nuevoUsuario) + "\n", (err) => {
      if (err)
        return res.status(500).json({ message: "Error al guardar el usuario" });
      res.status(201).json({ message: "Usuario registrado" });
    });
  });
});

// --- RUTAS EJERCICIOS ---

app.get("/ejercicios", (req, res) => {
  fs.readFile(EJERCICIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");
    res.send(data);
  });
});
app.post("/ejercicios/subir", upload.single("archivo"), (req, res) => {
  const { nombre, zona } = req.body;
  if (!nombre || !zona || !req.file) {
    return res.status(400).send("Faltan campos.");
  }
  const archivoRuta = "uploads/" + req.file.filename;
  const nuevaLinea = `${nombre}|${zona}|${archivoRuta}\n`;
  fs.appendFile("Ejercicios.txt", nuevaLinea, (err) => {
    if (err) return res.status(500).send("Error al guardar ejercicio.");
    res.send("Ejercicio guardado correctamente.");
  });
});
app.post("/ejercicios/eliminar", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).send("Falta nombre");
  fs.readFile(EJERCICIOS_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer ejercicios.");
    const lineas = data.split("\n").filter((linea) => {
      if (linea.trim() === "") return false;
      const [n, _, ruta] = linea.split("|");
      if (n === nombre) {
        if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
        return false;
      }
      return true;
    });
    fs.writeFile(EJERCICIOS_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir ejercicios.");
      res.send("Ejercicio eliminado.");
    });
  });
});
app.put("/ejercicios/actualizar", upload.single("archivo"), (req, res) => {
  const { nombre, zona, nombreOriginal } = req.body;
  if (!nombre || !zona || !nombreOriginal) {
    return res.status(400).send("Faltan campos.");
  }
  fs.readFile("Ejercicios.txt", "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al actualizar.");
    const lineas = data
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea) => linea.split("|"));
    let seActualizo = false;
    let archivoAnterior = "";
    const nuevasLineas = lineas.map(([n, z, archivo]) => {
      if (n === nombreOriginal) {
        seActualizo = true;
        archivoAnterior = archivo;
        const nuevoArchivo = req.file
          ? "uploads/" + req.file.filename
          : archivo;
        return `${nombre}|${zona}|${nuevoArchivo}`;
      }
      return `${n}|${z}|${archivo}`;
    });
    if (!seActualizo) return res.status(404).send("Ejercicio no encontrado.");
    fs.writeFile("Ejercicios.txt", nuevasLineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al guardar cambios.");
      if (req.file && archivoAnterior && fs.existsSync(archivoAnterior)) {
        fs.unlink(archivoAnterior, (err) => {
          if (err) console.warn("No se pudo borrar archivo anterior:", err);
        });
      }
      res.send("Ejercicio actualizado correctamente.");
    });
  });
});

// --- RUTAS INVENTARIO ---
// (El resto igual a tu código...)

app.get("/inventario", (req, res) => {
  fs.readFile(INVENTARIO_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer inventario.");
    res.send(data);
  });
});
app.post("/inventario", (req, res) => {
  const { nombre, cantidad, descripcion } = req.body;
  if (!nombre || !cantidad) {
    return res.status(400).send("Faltan campos.");
  }
  const linea = `${nombre}|${cantidad}|${descripcion || ""}\n`;
  fs.appendFile(INVENTARIO_PATH, linea, (err) => {
    if (err) return res.status(500).send("Error al guardar producto.");
    res.send("Producto agregado correctamente.");
  });
});
app.post("/inventario/eliminar", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).send("Falta nombre");
  fs.readFile(INVENTARIO_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer inventario.");
    const lineas = data
      .split("\n")
      .filter(
        (linea) => linea.trim() !== "" && !linea.startsWith(nombre + "|")
      );

    fs.writeFile(INVENTARIO_PATH, lineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al escribir inventario.");
      res.send("Producto eliminado.");
    });
  });
});
app.put("/inventario/actualizar", (req, res) => {
  const { nombreOriginal, nombre, cantidad, descripcion } = req.body;
  if (!nombreOriginal || !nombre || !cantidad) {
    return res.status(400).send("Faltan campos.");
  }
  fs.readFile(INVENTARIO_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error al leer inventario.");
    let encontrado = false;
    const nuevasLineas = data
      .split("\n")
      .filter((linea) => linea.trim() !== "")
      .map((linea) => {
        const [n] = linea.split("|");
        if (n === nombreOriginal) {
          encontrado = true;
          return `${nombre}|${cantidad}|${descripcion || ""}`;
        }
        return linea;
      });
    if (!encontrado) return res.status(404).send("Producto no encontrado.");
    fs.writeFile(INVENTARIO_PATH, nuevasLineas.join("\n") + "\n", (err) => {
      if (err) return res.status(500).send("Error al guardar inventario.");
      res.send("Producto actualizado.");
    });
  });
});

// Servir archivos estáticos (para poder acceder a los videos desde frontend)
app.use("/uploads", express.static(UPLOADS_DIR));

app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000")
);
