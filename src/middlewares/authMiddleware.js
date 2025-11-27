import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (
    !token ||
    token === "undefined" ||
    token === "null" ||
    token.trim() === ""
  ) {
    return res.redirect("/login?alert=unauthorized");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) throw new Error("Token inválido");

    req.user = decoded; // disponible en controladores
    res.locals.currentUser = {
      id: decoded.id,
      name: decoded.name || decoded.nombre || "Usuario",
      nombre: decoded.nombre || decoded.name || "Usuario",
      rol: Number(decoded.rol) || 2,
    }; // disponible en EJS

    next();
  } catch (err) {
    console.error("❌ Error de autenticación:", err.message);
    res.clearCookie("jwt", { path: "/" });
    return res.redirect("/login?alert=expired");
  }
};
