# 飞书多机器人配置指南（正确版本）

## ✅ 你说得对！

OpenClaw **确实支持多飞书机器人**，但需要使用 `accounts` 结构配置。

## 📋 操作步骤

### 第一步：创建新的飞书应用

1. 访问 https://open.feishu.cn/app
2. 点击"创建企业自建应用"
3. 填写应用名称（如"OpenClaw Bot 2"）
4. 复制 **App ID** 和 **App Secret**
5. 配置权限（至少需要）：
   - `contact:user.base:readonly`
   - `im:message`
   - `im:message.group_at_msg:readonly`
   - `im:message.p2p_msg:readonly`
   - `im:message:readonly`
   - `im:message:send_as_bot`

### 第二步：编辑配置文件

编辑 `~/.openclaw/openclaw.json`

**当前配置**（单账户）：
```json
"channels": {
  "feishu": {
    "appId": "cli_a92504a18a395bdb",
    "appSecret": "QobrnBLLjTJknT8Urr3VlfhuUJlNSEmt",
    "connectionMode": "websocket",
    "domain": "feishu",
    "groupPolicy": "open",
    "dmPolicy": "open",
    "allowFrom": ["*"]
  }
}
```

**改成多账户配置**：
```json
"channels": {
  "feishu": {
    "enabled": true,
    "connectionMode": "websocket",
    "domain": "feishu",
    "groupPolicy": "open",
    "dmPolicy": "open",
    "allowFrom": ["*"],
    
    "accounts": {
      "default": {
        "appId": "cli_a92504a18a395bdb",
        "appSecret": "QobrnBLLjTJknT8Urr3VlfhuUJlNSEmt",
        "connectionMode": "websocket",
        "botName": "OpenClaw 主机器人"
      },
      "bot2": {
        "appId": "cli_你的新应用ID",
        "appSecret": "你的新应用密钥",
        "connectionMode": "websocket",
        "botName": "OpenClaw Bot 2"
      }
    }
  }
}
```

**重要**：
- 将原来的 `appId`、`appSecret` 等字段移到 `accounts.default` 中
- 添加 `accounts.bot2` 配置第二个机器人
- 保留顶层的通用配置（`enabled`、`connectionMode` 等）

### 第三步：重启 Gateway

```bash
openclaw gateway restart
```

### 第四步：验证

```bash
# 查看状态
openclaw channels status

# 应该看到两个飞书账户：default 和 bot2
```

## 🎯 使用方式

### 推送消息到不同机器人

```bash
# 使用默认机器人（第一个）
openclaw message send --channel feishu --target 群ID --message "消息"

# 使用第二个机器人
openclaw message send --channel feishu --account bot2 --target 群ID --message "消息"
```

### 添加到不同群

1. 将第一个机器人（default）添加到群 A
2. 将第二个机器人（bot2）添加到群 B

## 📊 配置说明

| 参数 | 说明 |
|------|------|
| `accounts` | 多账户配置块（必须） |
| `default` | 默认账户 ID（可自定义名称） |
| `bot2` | 第二个账户 ID（可自定义名称） |
| `appId` | 飞书应用 ID |
| `appSecret` | 飞书应用密钥 |
| `botName` | 机器人显示名称（可选） |
| `connectionMode` | 连接模式（websocket） |

## ⚠️ 注意事项

1. **必须使用 `accounts` 结构**：不能在顶层直接放 `appId`/`appSecret`
2. **账户 ID 必须唯一**：`default`、`bot2` 等不能重复
3. **重启后才生效**：修改配置后必须重启 Gateway
4. **权限必须正确**：每个应用都需要配置相同的权限
5. **测试新机器人**：先测试新机器人是否能正常收发消息

## 🔍 故障排查

```bash
# 查看 Gateway 日志
openclaw gateway logs

# 查看通道状态
openclaw channels status --deep

# 测试机器人连接
openclaw message send --channel feishu --account bot2 --target 群ID --message "测试"
```

## 📝 完整示例

查看正确的多账户配置：`/tmp/feishu-correct-multi-account.json`

## 💡 快速迁移脚本

```bash
# 备份原配置
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup

# 手动编辑配置文件
nano ~/.openclaw/openclaw.json

# 重启 Gateway
openclaw gateway restart

# 验证
openclaw channels status
```

---

**文档来源**：OpenClaw 官方文档  
**参考文件**：`~/.npm-global/lib/node_modules/openclaw/docs/channels/feishu.md`
