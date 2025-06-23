import { Router } from "express";
import { register, login, googleLogin } from "../controllers/authController";

const router = Router();

// 註冊
router.post("/register", register);

// 登入
router.post("/login", login);

router.post("/googleLogin", googleLogin);

export default router;
