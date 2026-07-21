# 历史冷知识 · 复古典籍风静态小站

> 二十桩被误读的中国往事，按朝代时序与门类编排，每条都标注史料出处。
> 零构建、零后端，纯静态 HTML/CSS/JS，可直接托管到 GitHub Pages。

---

## 项目结构

```
历史冷知识/
├── index.html          # 首页（Hero + 6 分类 tab + 卡片网格 3/2/1 列响应式）
├── fact.html           # 详情页（?id=xxx 读取单条，含正文/出处/相关推荐）
├── timeline.html       # 时间线页（按 8 朝代分组）
├── about.html          # 关于页
├── css/
│   └── style.css       # 复古典籍风设计系统（含响应式 375/768/1024/1440）
├── js/
│   ├── facts.js        # 20 条冷知识数据（id/title/dynasty/category/summary/content/tags/source）
│   ├── home.js         # 首页渲染：tab + 卡片网格 + 筛选
│   ├── fact.js         # 详情页渲染：URL ?id= 解析 + 404 兜底 + 相关推荐打分
│   └── timeline.js     # 时间线渲染：8 朝代分组 + 空缺朝代友好提示
└── README.md           # 本文件
```

### 设计与技术

- **视觉风格**：复古典籍风——墨棕底色（#1a1410）+ 羊皮纸米黄正文（#e8dcc4）+ 朱砂印章红强调（#a8332a）
- **字体**：Noto Serif SC（思源宋体）优先，系统宋体兜底
- **装饰**：双边框、印章红章、细线分隔、微妙纸纹背景、卡片 hover 上浮 + 朱砂红描边
- **数据驱动**：所有内容存在 `js/facts.js` 一个文件里，4 个 HTML 页面分别用对应 JS 脚本读取渲染
- **响应式**：移动端优先，断点 375 / 768 / 1024 / 1440，卡片自动 1 → 2 → 3 列

### 内容规模

- 共 20 条冷知识
- 6 个分类：帝王将相 / 风俗生活 / 文人轶事 / 战争军事 / 文化典籍 / 美食风物
- 8 个朝代：先秦 / 秦汉 / 魏晋南北朝 / 隋唐 / 宋 / 元 / 明 / 清
- 每条正文 150-300 字，史料出处放在详情页底部"参考"区

---

## 一、本地预览（适合零基础读者）

静态网站不需要任何编译，**双击 HTML 文件就能打开**。但为了更好的体验（避免某些浏览器对本地 file:// 协议的限制），推荐用本地服务器方式预览。

### 方式 A：最简单——直接双击

1. 进入项目文件夹 `G:\历史冷知识\`
2. 双击 `index.html`
3. 你的默认浏览器会打开首页

> 如果发现页面打开后卡片空白、文字显示不全，多半是浏览器的本地文件安全策略导致 JS 加载失败，请改用下面的方式 B。

### 方式 B：用 Python 自带服务器（推荐）

**前提**：已安装 Python 3。检查方法：打开命令提示符（按 `Win + R`，输入 `cmd`，回车），输入 `python --version`，能看到版本号即可。如果没装，到 [python.org](https://www.python.org/downloads/) 下载安装，**安装时务必勾选 "Add Python to PATH"**。

操作步骤：

1. 按 `Win + R`，输入 `cmd`，回车打开命令提示符
2. 在命令行里输入下面这行（注意路径用你自己的）切换到项目目录：

   ```
   cd /d G:\历史冷知识
   ```

3. 启动本地服务器：

   ```
   python -m http.server 8000
   ```

4. 看到一行提示 `Serving HTTP on :: port 8000` 就表示启动成功
5. 打开浏览器，访问：**http://localhost:8000/**
6. 看到首页即成功。访问详情页、时间线页、关于页可在导航里点击切换
7. **关闭服务器**：回到命令提示符窗口，按 `Ctrl + C` 即可

### 方式 C：用 VS Code Live Server 插件

1. 用 VS Code 打开项目文件夹
2. 在左侧扩展商店搜索 `Live Server`，安装（作者 Ritwick Dey）
3. 在 `index.html` 上右键 → `Open with Live Server`
4. 浏览器会自动打开 `http://127.0.0.1:5500/index.html`，且修改任何文件会自动刷新

---

## 二、部署到 GitHub Pages（详细图文步骤）

下面假设你从未用过 git，从注册 GitHub 开始一步步来。整个过程约 10-15 分钟。

### 第 1 步：注册 GitHub 账号（已有账号请跳过）

1. 打开 https://github.com/signup
2. 输入用户名、邮箱、密码，按提示完成注册
3. 邮箱收验证邮件，点击确认链接

### 第 2 步：下载并安装 Git

1. 打开 https://git-scm.com/download/win
2. 下载 64-bit Git for Windows Setup
3. 双击安装包，**全程默认下一步**即可（不要改任何选项）
4. 安装完成后，按 `Win + R` 输入 `cmd` 回车，在命令行输入 `git --version`，能看到版本号说明安装成功

### 第 3 步：在 GitHub 上创建新仓库

1. 登录 GitHub，点击右上角 `+` 号 → **New repository**
2. 填写：
   - **Repository name**：`history-cool-facts`（名字可自取，建议纯英文、连字符、不含空格）
   - **Description**：`二十桩被误读的中国往事 — 复古典籍风静态小站`
   - **Public**（必须选 Public，否则 Pages 无法免费公开访问）
   - **不要**勾选 "Add a README file"、不要选 .gitignore、不要选 license（这些会让我们上传冲突）
3. 点击绿色按钮 **Create repository**
4. 创建后会跳到一个空仓库页面，上面有命令提示，**暂时不用做任何操作**，看下一步

### 第 4 步：把本地项目与 GitHub 仓库关联

1. 按 `Win + R` 输入 `cmd` 回车打开命令提示符
2. 切换到项目目录：

   ```
   cd /d G:\历史冷知识
   ```

3. 一次性配置你的 git 身份（仅首次需要，邮箱与用户名跟你 GitHub 注册信息一致即可）：

   ```
   git config --global user.name "你的GitHub用户名"
   git config --global user.email "你的邮箱@example.com"
   ```

4. 初始化本地 git 仓库：

   ```
   git init
   git branch -M main
   ```

5. 把所有文件加入暂存区并提交：

   ```
   git add .
   git commit -m "初次提交：历史冷知识静态小站"
   ```

6. 关联远程仓库（**把下面的 URL 换成你第 3 步创建的仓库地址**，在仓库页面绿色 "Code" 按钮里可复制）：

   ```
   git remote add origin https://github.com/你的用户名/history-cool-facts.git
   ```

7. 推送到 GitHub：

   ```
   git push -u origin main
   ```

8. 这时会弹出一个 GitHub 登录窗口（或浏览器跳转），按提示登录授权即可

9. 推送成功后，回到 GitHub 仓库页面刷新，应能看到所有文件已上传

### 第 5 步：开启 GitHub Pages

1. 在你的仓库页面，点击顶部标签栏的 **Settings**（设置）
2. 左侧菜单找到 **Pages**（在 "Code and automation" 分类下）
3. 在 **Build and deployment** 区域：
   - **Source** 下拉框选择 **Deploy from a branch**
   - **Branch** 区域：左侧选 `main`，右侧文件夹选 `/ (root)`，点击 **Save**
4. 页面顶部会出现一行提示：
   > Your site is live at https://你的用户名.github.io/history-cool-facts/

5. 等待约 1-2 分钟（首次部署需要构建），点击该链接即可看到你的网站上线了

### 第 6 步：以后如何更新内容

每次想新增/修改冷知识，只需：

1. 编辑 `js/facts.js`，按既有 schema 增删条目
2. 在命令提示符中切换到项目目录：

   ```
   cd /d G:\历史冷知识
   git add .
   git commit -m "新增 X 条冷知识"
   git push
   ```

3. 推送后 1-2 分钟，GitHub Pages 会自动更新

---

## 三、如何添加一条新的冷知识

打开 `js/facts.js`，在 `window.FACTS = [ ... ]` 数组里追加一个对象：

```js
{
  id: "your-unique-id",          // 英文 kebab-case，全局唯一
  title: "标题，含反常识亮点",
  dynasty: "宋",                 // 必须是 8 朝代之一
  category: "文人轶事",          // 必须是 6 分类之一
  summary: "30-60 字的一句话钩子",
  content: "正文 150-300 字，讲清常识/真相/证据/为什么会误解",
  tags: ["标签1", "标签2", "标签3"],
  source: "《某某史·某某传》"
}
```

保存后重新 push，首页与时间线页会自动出现这条。

---

## 四、史料与版权说明

- 所有冷知识条目的史料出处都在详情页底部"参考"区标明，主要来源于二十四史、宋元笔记及近人学术著述
- 本站为科普趣读性质，不构成学术依据。引用前请查阅原典与最新研究成果
- 项目代码采用 MIT 协议开源，可自由 fork 修改；文字内容欢迎转载，请保留出处链接

---

## 五、常见问题

**Q：访问 GitHub Pages 后页面样式乱了/字体回退成系统字体？**
A：网络问题导致 Google Fonts 加载失败，不影响功能。可改用国内 CDN，或将 Noto Serif SC 字体文件下载到本地 `fonts/` 目录后修改 `css/style.css` 的 `@font-face`。

**Q：本地双击 index.html 卡片空白？**
A：浏览器对 `file://` 协议下加载 JS 有安全限制。请改用本文"方式 B"（Python http.server）或"方式 C"（VS Code Live Server）预览。

**Q：推送时提示 `fatal: remote origin already exists`？**
A：之前已设过同名 remote。执行 `git remote remove origin`，再重新执行第 4 步第 6 行的 `git remote add origin ...` 命令即可。

**Q：GitHub Pages 部署后 404？**
A：检查 Settings → Pages 里 Branch 是否选了 `main` 和 `/ (root)`；等待 1-2 分钟让构建完成；URL 路径区分大小写，必须是 `你的用户名.github.io/仓库名/` 末尾带斜杠。

---

项目源码：见本目录。最后更新于 2026 年。
