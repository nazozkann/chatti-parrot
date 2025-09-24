import NextAuth, {
  type AuthOptions,
  type User as NextAuthUser,
} from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter } from "next-auth/adapters";
import clientPromise from "./clientPromise";
import mongoose, { type HydratedDocument } from "mongoose";

import { dbConnect } from "@/app/lib/db/mongoose";
import { User, type IUser } from "@/app/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "Email or Username",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        await dbConnect();
        const identifier = credentials?.identifier
          ?.toString()
          .trim()
          .toLowerCase();
        const password = credentials?.password?.toString() ?? "";
        if (!identifier || !password) return null;

        const userDoc = (await User.findOne<IUser>({
          $or: [{ email: identifier }, { username: identifier }],
        }).exec()) as HydratedDocument<IUser> | null;

        if (!userDoc || !userDoc.hashedPassword) return null;

        const ok = await bcrypt.compare(password, userDoc.hashedPassword);
        if (!ok) return null;
        const userId =
          userDoc._id instanceof mongoose.Types.ObjectId
            ? userDoc._id.toHexString()
            : String(userDoc._id);

        const authUser: NextAuthUser = {
          id: userId,
          email: userDoc.email,
          name:
            userDoc.name ??
            `${userDoc.firstName ?? ""} ${userDoc.lastName ?? ""}`.trim(),
          username: userDoc.username,
          roles: userDoc.roles ?? ["student"],
        };

        return authUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.username = user.username;
        token.roles = user.roles ?? ["student"];
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid;
      session.user.username = token.username;
      session.user.roles = token.roles;
      return session;
    },
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;

      await dbConnect();
      const email = user.email!;
      const existing = await User.findOne({ email }).exec();
      if (!existing) {
        await User.create({
          email,
          name: user.name,
          image: user.image,
          roles: ["student"],
          avatar: "fox",
          learningLanguages: [],
          knownLanguages: [],
        });
      }
      return true;
    },
  },
  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
