import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { IUsersSelect, UsersModel } from "../db/Users";
import passport from "passport";

const router = express.Router();
// interface RequestWithUser extends Request {
//   user?: IUsersSelect;
// }
// Express.jsの型定義を拡張して、Requestオブジェクトがuserプロパティを持つことをExpress.jsに伝える
// TypeScriptの宣言マージ。
declare module "express-serve-static-core" {
  interface Request {
    user?: IUsersSelect;
  }
}
const sessionChecker = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.isAuthenticated()) {
    next();
  } else {
    return res.json(new Error("Not_Session_AuthChecker").message);
  }
};
router.post("/create", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) throw new Error("Not_Input").message;
    const existUser = await UsersModel.findOne({ email });
    if (existUser) throw new Error("Exist_User").message;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UsersModel.create({
      email,
      hashedPassword,
    });
    if (!newUser) throw new Error("Failed_create").message;
    const { email: v, ...rest } = newUser;
    return res.json(email);
  } catch (e) {
    return res.status(400).json(e);
  }
});
interface UpdateInputType {
  name?: string;
  introduction?: string;
}
router.patch("/update", sessionChecker, async (req, res) => {
  if (!req.user) return;
  const { name, introduction }: UpdateInputType = req.body;
  try {
    const acknow = await UsersModel.updateOne(
      { email: req.user.email },
      { name, introduction }
    ).then((r) => r.acknowledged);
    return res.status(200).json(acknow);
  } catch (e) {
    return res.status(400).json(e);
  }
});
interface DeleteInputType {
  email: string;
  password: string;
}
router.delete("/delete", sessionChecker, async (req, res) => {
  const { email, password }: DeleteInputType = req.body;
  try {
    const user = await UsersModel.findOne({ email });
    if (!user) throw new Error("Email_MisMatched").message;
    let { hashedPassword } = user.toObject();
    const isMatch = await bcrypt.compare(password, hashedPassword);
    hashedPassword = "";
    if (!isMatch) {
      throw new Error("Password_MisMatched").message;
    } else {
      const msg = await UsersModel.deleteOne({ email });
      return res.status(200).json(msg);
    }
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.post("/profile", sessionChecker, async (req, res) => {
  if (!req.user) return;
  const { email } = req.user;
  try {
    const user = await UsersModel.findOne({ email });
    if (!user) throw new Error("Not_User");
    let userObj = user.toObject();
    let { hashedPassword, __v, ...rest } = userObj;
    hashedPassword = "";
    return res.status(200).json(rest);
  } catch (e) {
    return res.status(400).json(e);
  }
});
export default router;
