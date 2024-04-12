import express from "express";
import passport from "passport";

const router = express.Router();

router.post("/signin", passport.authenticate("local"), (req, res) => {
  if (req.user) {
    return res.json(req.user);
  } else {
    return res.json("SignIn_NG");
  }
});
router.post("/signout", (req, res) => {
  if (req.user) {
    //req.session.destroy((e) => console.log(e));
    req.logout((e) => {
      if (e) return res.json(e);
      else return res.json("Logout");
    });
  } else {
    return res.json("Not_Session");
  }
});
router.get("/sessionChecker", (req, res) => {
  if (req.user) {
    console.log(req.session);
    return res.json(req.user);
  } else {
    return res.json("Not_Session");
  }
});
export default router;
