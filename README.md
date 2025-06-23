# WJ 電商網站（後端）

使用 Node.js + Express + Prisma + MySQL 打造的電商網站後端服務，支援使用者註冊 / 登入（含 Google 第三方登入）、訂單管理、購物車邏輯、圖片上傳、藍新金流串接等功能，與前端專案進行完整串接，模擬真實購物流程。

## 目前已完成功能

- [x] JWT 驗證登入 / 註冊
- [x] Google 第三方登入（Passport + OAuth2）
- [x] 使用者資訊查詢 / 編輯（地址、收件人等）
- [x] 購物車邏輯（增加、移除、修改商品數量）
- [x] 訂單建立與查詢（含訂單號生成、關聯用戶）
- [x] 藍新金流（NewebPay）整合：

## 安裝

以下將會引導你如何安裝此專案到你的電腦上。

### 取得專案

```
git clone https://github.com/Wandaihsien/WJ-backend
```

### 移動到專案內

```
cd WJ-backend
```

### 安裝套件

```
npm install
```

### 運行專案

```
npm run dev
```

### 開啟專案

運行後會自動開啟瀏覽器，或在瀏覽器輸入以下網址

```
http://localhost:3000/
```

## 資料夾

## 資料夾說明

- prisma 資料庫格式放置處
- routes API 路徑放置處
- middlewares 中間件放置處

## 環境變數

### 資料庫

- DATABASE_URL=""

### JWT

- JWT_SECRET = ""

### 後端

- Port ="""
- API_URL=""

### 前端

- BASE_URL=""

### 藍新金流

- HASH_KEY=""
- HASH_IV=""

### Google 登入

- GOOGLE_CLIENT_ID=""

## 聯絡作者

可以透過以下方式與我聯絡

- github :https://github.com/Wandaihsien
- email :graywolf7235@gmail.com
