import express from "express";
import bodyParser from "body-parser";
import orderRoutes from "./routes/order";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/product";
import cartRoutes from "./routes/cart";
import shippingInfoRoutes from "./routes/shippingInfo";
import userDataRoutes from "./routes/userData";
import paymentRoutes from "./routes/payment";
import noticeRoutes from "./routes/notice";
import { verifyToken } from "./middlewares/verifyToken";
import cors from "cors";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", verifyToken, cartRoutes);
app.use("/api/shippingInfo", verifyToken, shippingInfoRoutes);
app.use("/api/userData", verifyToken, userDataRoutes);
app.use("/api/order", verifyToken, orderRoutes);
app.use("/api/payment", verifyToken, paymentRoutes);
app.use("/api/notice", noticeRoutes);

export default app;
