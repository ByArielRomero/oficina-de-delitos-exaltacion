import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import personaRoutes from './routes/personaRoutes.js';
import zonaRoutes from "./routes/zonaRoutes.js";
import casoRoutes from "./routes/casoRoutes.js";
import session from "express-session";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "process";

dotenv.config();

const app = express();

// NECESARIO PARA RESOLVER RUTAS ABSOLUTAS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// ====== MIDDLEWARES ======
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "mi_secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

// ====== ARCHIVOS ESTÁTICOS ======
app.use(express.static(path.join(__dirname, "public")));

// ====== RUTAS ======
app.get('/', (req, res) => {
  res.redirect('login');
});

app.use("/", authRoutes);
app.use("/", personaRoutes);
app.use("/", dashboardRoutes);
app.use("/zonas", zonaRoutes);
app.use("/", casoRoutes);
app.use("/", usuarioRoutes);

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
