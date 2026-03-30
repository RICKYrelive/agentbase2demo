# 飞书多机器人配置指南

## 📋 操作步骤

### 第一步：创建新的飞书应用

1. 访问 https://open.feishu.cn/app
2. 点击"创建企业自建应用"
3. 填写应用名称（如"OpenClaw Bot 2"）
4. 复制 **App ID** 和 **App Secret**
5. 配置权限（至少需要）：
   - `contact:user.base:readonly`
   - `im:message`
   - `im:message.group_msg`

### 第二步：编辑配置文件

编辑 `~/.openclaw/openclaw.json`

**当前配置**（单账户）：
```json
"channels": {
  "feishu": {
    "enabled": true,
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
        "description": "主机器人"
      },
      "bot2": {
        "appId": "cli_你的第二个应用ID",
        "appSecret": "你的第二个应用密钥",
        "connectionMode": "websocket",
        "description": "第二个机器人"
      }
    }
  }
}
```

### 第三步：重启 Gateway

```bash
openclaw gateway restart
```

### 第四步：验证

```bash
# 查看状态
openclaw channels status

# 应该看到两个飞书账户
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
| `accounts` | 多账户配置块 |
| `default` | 默认账户（account ID） |
| `bot2` | 第二个账户（自定义名称） |
| `appId` | 飞书应用 ID |
| `appSecret` | 飞书应用密钥 |
| `connectionMode` | 连接模式（websocket） |

## ⚠️ 注意事项

1. **账户 ID 必须唯一**：`default`、`bot2` 等不能重复
2. **重启后才生效**：修改配置后必须重启 Gateway
3. **权限必须正确**：每个应用都需要配置相同的权限
4. **测试新机器人**：先测试新机器人是否能正常收发消息

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

查看示例配置：`/tmp/feishu-multi-account-example.json`
