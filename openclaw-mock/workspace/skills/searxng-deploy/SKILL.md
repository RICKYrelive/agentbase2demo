# SearXNG Deploy

Docker 部署 SearXNG 并配置国内搜索引擎的完整流程。当用户提到"部署 SearXNG"、"安装搜索引擎"、"配置 SearXNG"、"search engine deploy"时触发。

## 前置条件

- Docker + Docker Compose 已安装
- 可用端口：8080（如需修改见下方端口说明）

## 架构

```
用户 → :8080 (Caddy) → :8080 (SearXNG) → 各搜索引擎
                            ↕
                      Valkey (缓存)
```

三个服务：
- **Caddy**：反向代理，端口 8080→80
- **Valkey**：Redis 兼容缓存，提升搜索速度
- **SearXNG**：搜索引擎元搜索引擎本体

## 部署步骤

### 1. 创建目录

```bash
mkdir -p ~/searxng/searxng
cd ~/searxng
```

### 2. 放置配置文件

将 `assets/docker-compose.yaml` 和 `assets/Caddyfile` 复制到 `~/searxng/`：

```bash
# 从 skill 目录复制（或手动创建）
cp ~/.openclaw/workspace/skills/searxng-deploy/assets/docker-compose.yaml ~/searxng/
cp ~/.openclaw/workspace/skills/searxng-deploy/assets/Caddyfile ~/searxng/
```

### 3. 首次启动

```bash
cd ~/searxng
docker compose up -d
```

首次启动会自动在 `./searxng/` 目录生成默认 `settings.yml`。

### 4. 配置国内搜索引擎

等待 SearXNG 容器生成默认配置后，修改 `~/searxng/searxng/settings.yml`：

**关键修改**（参考 `references/settings-cn.yml`）：

1. **关闭限流**（`server.limiter: false`），环境变量 `SEARXNG_LIMITER=false` 已在 docker-compose.yaml 中设置
2. **设置自动补全**：`search.autocomplete: "baidu"`
3. **确保 JSON 格式可用**：`search.formats` 包含 `json`
4. **启用国内搜索引擎**，禁用不需要的国外引擎（见下方列表）

### 5. 重启生效

```bash
cd ~/searxng
docker compose restart
```

### 6. 验证

```bash
# 浏览器访问
curl http://localhost:8080/search?q=test

# JSON API（供程序调用）
curl "http://localhost:8080/search?q=test&format=json"
```

## 国内搜索引擎配置

启用的国内引擎：

| 引擎 | 快捷键 | 分类 |
|------|--------|------|
| 360search | `360so` | 通用 |
| 360search videos | `360sov` | 视频 |
| baidu | `bd` | 通用 |
| baidu images | `bdi` | 图片 |
| baidu kaoya (IT) | `bdk` | IT |
| bilibili | `bil` | 视频 |
| sogou | `sogou` | 通用 |
| sogou images | `sogoui` | 图片 |
| sogou videos | `sogouv` | 视频 |
| sogou wechat | `sogouw` | 微信 |
| quark | `qk` | 通用 |
| quark images | `qki` | 图片 |

这些引擎在默认 settings.yml 中默认是 `disabled: true`，需要改为 `disabled: false`。

## API 使用

SearXNG 提供 JSON API，可直接在程序中调用：

```bash
# 基本搜索
curl "http://localhost:8080/search?q=关键词&format=json"

# 指定引擎
curl "http://localhost:8080/search?q=关键词&format=json&engines=baidu,sogou"

# 指定分类
curl "http://localhost:8080/search?q=关键词&format=json&categories=images"

# 分页
curl "http://localhost:8080/search?q=关键词&format=json&pageno=2"
```

## 端口修改

如需修改端口，编辑 `docker-compose.yaml` 中 caddy 服务的 `ports` 映射：

```yaml
ports:
  - "你的端口:80"  # 默认 8080:80
```

## 文件参考

- `assets/docker-compose.yaml` — 完整 Docker Compose 配置
- `assets/Caddyfile` — Caddy 反向代理配置
- `references/settings-cn.yml` — 国内搜索引擎配置片段（只需修改的部分）
