import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username?: string;
    roles?: string[];
  }

  interface Session {
    user: {
      id?: string;
      username?: string;
      roles?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    username?: string;
    roles?: string[];
  }
}
