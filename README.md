# Fitness Pilot

碳循环训练助手（Next.js + TypeScript）。

## Quickstart

```bash
npm install
npm run dev
# open http://localhost:3000
```

## 自动云存储（Firebase Spark 免费计划）

配置后，数据会**自动保存到云端**。电脑改完，手机登录同一账号打开就是最新数据，无需复制粘贴。

### 1) 创建 Firebase 项目

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 创建项目（选择 **Spark / Free** 计划）
3. 开启 **Authentication**：
   - Email/Password（可选，邮箱登录用）
   - **Google**（社交登录）
4. 开启 **Firestore Database**

#### 开启 Google 登录

1. Firebase Console → **Authentication** → **Sign-in method**
2. 点击 **Google** → **Enable** → 填写 support email → Save
3. 本地开发时 `localhost` 一般已在 **Authorized domains** 里
4. 部署到 Vercel 后，把生产域名（如 `xxx.vercel.app`）加到 **Authorized domains**

### 2) 添加 Web App，填写环境变量

复制 `.env.example` 为 `.env.local` 并填入 Firebase 配置：

```bash
cp .env.example .env.local
```

### 3) Firestore 安全规则（必做）

Firebase Console → **Firestore Database** → **Rules** 标签，**整段替换**为以下内容，点 **Publish**：

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/data/{doc} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

（项目根目录也有 `firestore.rules` 文件可复制。）

> 若创建数据库时选了 **test mode**，默认规则 30 天后会过期，也会出现 `Missing or insufficient permissions`，同样需要改成上面的规则。

### 4) 使用方式

1. 电脑端：用 **Google 登录** 或邮箱注册
2. 手机端：用**同一 Google 账号**（或同一邮箱密码）登录
3. 之后所有修改自动同步，无需手动操作

> 未配置 Firebase 时，应用会退化为仅本地 `localStorage` 存储。

## Build

```bash
npm run build
npm run start
```
