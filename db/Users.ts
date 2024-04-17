import { model, Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
//import { nanoid } from "nanoid";
import cryptojs from "crypto-js";
import { check } from "express-validator";

//var key = cryptojs.enc.Utf8.parse(process.env.CRYPTO_KEY as string);
var key = cryptojs.enc.Utf8.parse("0123456789abcede");
//var iv = cryptojs.enc.Utf8.parse(process.env.CRYPTO_IV as string);
var iv = cryptojs.enc.Utf8.parse("1234567812345678");

export function Encrypt(word: string) {
  var srcs = cryptojs.enc.Utf8.parse(word);
  var encrypted = cryptojs.AES.encrypt(srcs, key, {
    iv: iv,
    mode: cryptojs.mode.CBC,
    padding: cryptojs.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
}

export function Decrypt(word: string) {
  var encryptedHexStr = cryptojs.enc.Hex.parse(word);
  var srcs = cryptojs.enc.Base64.stringify(encryptedHexStr);
  var decrypt = cryptojs.AES.decrypt(srcs, key, {
    iv: iv,
    mode: cryptojs.mode.CBC,
    padding: cryptojs.pad.Pkcs7,
  });
  var decryptedStr = decrypt.toString(cryptojs.enc.Utf8);
  return decryptedStr.toString();
}
export interface IUsers extends Document {
  _id: string;
  name?: string;
  introduction?: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IUsersSelect {
  _id: string;
  name?: string;
  introduction?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
const UsersSchema = new Schema<IUsers>({
  _id: { type: String, default: uuidv4() },
  name: { type: String, required: false },
  introduction: { type: String, required: false },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v: string) => {
        //return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        return check("email").isEmail().normalizeEmail();
      },
      message: (props) => `${props.value}Not_Email_Format`,
    },
  },
  hashedPassword: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});
export const UsersModel = model<IUsers>("Users", UsersSchema);
