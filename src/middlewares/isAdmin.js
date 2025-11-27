export const isAdmin = (req, res, next) => {
  const user = res.locals.currentUser;

  if (!user || Number(user.rol) !== 1) {
    return res.redirect("/register?alert=denegado");
  }

  next();
};
