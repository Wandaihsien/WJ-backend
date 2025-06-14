import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  //  console.log('verifyToken middleware - authHeader:', req.headers.authorization)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "未提供 token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // console.log('JWT decoded:', decoded);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("JWT 驗證錯誤:", error);
    res.status(403).json({ message: "無效 token" });
  }
};
