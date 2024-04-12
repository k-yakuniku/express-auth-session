import { PassportStatic } from "passport";
import passportLocal from "passport-local";
import { IUsersSelect, UsersModel } from "./db/Users";
import bcrypt from "bcrypt";

const LocalStrategy = passportLocal.Strategy;

export const passportInitialize = (passport: PassportStatic) => {
  passport.use(
    "local",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        const user = await UsersModel.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Not_User" });
        }
        let { hashedPassword, ...rest } = user.toObject();
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
          hashedPassword = "";
          return done(null, false, { message: "Failed_Password" });
        } else {
          hashedPassword = "";
          return done(null, rest);
        }
      }
    )
  );
  passport.serializeUser(
    (user: any, done: (e: Error | null, email: string) => void) => {
      done(null, user.email);
    }
  );
  passport.deserializeUser(async function (
    email: string,
    done: (e: Error | null, user: IUsersSelect | null) => void
  ) {
    const user = await UsersModel.findOne({ email });
    if (!user) done(null, null);
    else {
      let { hashedPassword, ...userSelect } = user.toObject();
      hashedPassword = "";
      done(null, userSelect);
    }
  });
};
