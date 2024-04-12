import { model, Schema, Document } from "mongoose";
// import { v4 as uuidv4, validate } from "uuid";
import { check } from "express-validator";

import crypto from "crypto";

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
  _id: { type: String, default: crypto.randomUUID() },
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
