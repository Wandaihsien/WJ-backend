import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// 註冊功能
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "請提供email和密碼" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "密碼長度至少為6個字元" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "請提供有效的email格式" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "此Email已被註冊" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "註冊成功",
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("註冊失敗:", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 登入功能
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "請輸入email和密碼" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "帳號或密碼錯誤" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "密碼錯誤" });
    }

    const generateToken = (userId: string) =>
      jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.status(200).json({
      token: generateToken(user.id),
      user: {
        id: user.id,
      },
    });
  } catch (err) {
    console.error("登入失敗:", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
};

// Google登入功能
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) {
      return res.status(400).json({ error: "無效的 Google 資料" });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: "",
        },
      });
    }
    const generateToken = (userId: string) =>
      jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    res.status(200).json({
      token: generateToken(user.id),
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Google 驗證失敗" });
  }
};
