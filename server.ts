import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import post from "./router/post";
import auth from "./router/auth";
import passport, { authenticate, initialize } from "passport";
import { passportInitialize } from "./middleware";
import session from "express-session";
import { Decrypt, Encrypt, UsersModel } from "./db/Users";

const app = express();
// const PORT = process.env.PUBLIC_PORT;
const PORT = 5000;

// .env
config();

//#region  express expansions
const ORIGIN_URL = process.env.PUBLIC_ORIGIN_URL as string;
const AccesscontrolAllowHeaders = [
  "X-CSRF-Token",
  "X-Requested-With",
  "Accept",
  "Accept-Version",
  "Content-Length",
  "Content-MD5",
  "Content-Type",
  "Date",
  "X-Api-Version",
  "Authorization",
];

app.use(
  cors({
    origin: ORIGIN_URL,
    allowedHeaders: AccesscontrolAllowHeaders,
    exposedHeaders: AccesscontrolAllowHeaders,
    credentials: true,
  })
);

// HTTP res HeaderからX-Powered-Byを削除
// Expressが使用されていることを示す情報を非表示にするためのセキュリティ対策
app.disable("x-powered-by");

// reqのcookies_propertyを通じてcookieを読み取る
//app.use(cookieParser());

// URL encode されたDataを解析するためのmiddlewareを適用
// extendedオプションがfalseに設定されている場合、
// URL Encode Dataはクエリストリングライブラリを使用して解析
// passportにパラメータを渡すため、
app.use(express.urlencoded({ extended: false }));

// JSON形式のreq.bodyを解析してJavaScript_objに変換
app.use(express.json());
//#endregion

//#region Mongodb Connect

const password = process.env.MONGODB_PASSWORD as string;
const databaseName = process.env.MONGODN_DATABASE_NAME as string;

mongoose
  .connect(
    `mongodb+srv://mongodb:${password}@clustertest.kcqb7op.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=ClusterTest`
  )
  .then(() => console.log("Connect_Success"))
  .catch((e) => console.log(e));

//#endregion

// expres.session initialize
app.use(
  session({
    secret: "expressSessionKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      domain: "localhost",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    },
  })
);
// passport Initialize
app.use(passport.initialize());
app.use(passport.session());

// router
app.use("/post", post);
app.use("/auth", auth);

app.get("/", async (req, res) => {
  const usersList = await UsersModel.find();
  if (!usersList) return res.json("Not_UserList");
  else return res.json(usersList);
});
app.post("/test", (req, res) => {
  const { password } = req.body;
  if (!password) return;
  const ciphertext = Encrypt(password);
  if (!ciphertext) return;
  const deciphertext = Decrypt(ciphertext);
  return res.json({ ciphertext, deciphertext });
});
app.post("/test1", (req, res) => {
  const { password } = req.body;
  if (!password) return;
  const deciphertext = Decrypt(password);
  return res.json({ deciphertext });
});
passportInitialize(passport);

app.listen(PORT, () => {
  console.log("Server is running on 5000");
});
