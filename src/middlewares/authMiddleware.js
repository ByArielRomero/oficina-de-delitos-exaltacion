import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token || token === "undefined" || token === "null" || token.trim() === "") {
    // No tiene JWT → redirige al login
    return res.redirect("/login?alert=unauthorized");
  }

 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new Error("Token inválido");
  req.user = decoded;
  next();
} catch (err) {
  res.clearCookie("jwt", { path: "/" }); // siempre borrar si no sirve
  return res.redirect("/login?alert=expired");
}

};
