---
name: find-skills
description: |
  帮助用户发现和安装agent技能。当用户问"如何做X"、"找一个X技能"、"有没有能...的技能"、想安装新技能时触发。
---

# Find Skills - 技能发现助手

帮助用户在ClawHub上搜索、发现和安装agent技能。

## 何时使用

当用户：
- 问"如何做X"（X可能是某个技能的能力）
- 要求"找一个X技能"
- 问"有没有能...的技能"
- 要求"安装X技能"
- 想探索可用的技能

## 使用方法

### 搜索技能

```bash
npx clawhub search <关键词>
```

示例：
```bash
npx clawhub search calendar  # 查找日历相关技能
npx clawhub search email     # 查找邮件相关技能
npx clawhub search github    # 查找GitHub相关技能
```

### 探索热门技能

```bash
# 最新更新的技能
npx clawhub explore --sort newest --limit 20

# 下载量最多的
npx clawhub explore --sort downloads --limit 20

# 热门趋势
npx clawhub explore --sort trending --limit 20
```

### 安装技能

找到用户想要的技能后：

```bash
npx clawhub install <slug>
```

示例：
```bash
npx clawhub install github
npx clawhub install himalaya
```

### 查看已安装技能

```bash
# 使用ClawHub
npx clawhub list

# 或使用OpenClaw CLI
openclaw skills list
```

### 查看技能详情

```bash
npx clawhub inspect <slug>
```

## 常见场景

1. **用户问"如何发送邮件？"**
   - 搜索：`npx clawhub search email`
   - 推荐相关技能如 `himalaya`、`gog` (Google Workspace)

2. **用户问"你能操作GitHub吗？"**
   - 搜索：`npx clawhub search github`
   - 推荐技能如 `github`、`gh-issues`

3. **用户想管理任务**
   - 搜索：`npx clawhub search task todo`
   - 推荐技能如 `things-mac`、`apple-reminders`、`trello`

4. **用户问有哪些可用技能**
   - 运行：`npx clawhub explore --limit 50`
   - 展示分类和热门选项

## 注意事项

- 某些技能需要macOS或特定依赖
- 安装前检查技能要求
- 如果ClawHub API被限流，建议用户直接访问 https://clawhub.com
- 安装前总是先解释技能的功能

## 错误处理

如果遇到"Rate limit exceeded"：
- 等待几分钟后重试
- 建议用户访问 https://clawhub.com 手动浏览技能
- 检查是否有其他能实现相同目的的技能
