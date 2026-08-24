# BBGE 邀请联机规范

BBGE 的在线对局继续采用 **GitHub Pages 静态导出 + PeerJS P2P**。没有游戏服务器、观战、主机迁移或跨设备持久房间；插件也不得感知网络。

## 分层

```
PlayShell（UI / AI 调度）
        ↓
room-controller（房主权威、握手、恢复、revision）
        ↓
peer-transport（PeerJS 生命周期与超时）
        ↓
HostSession → GamePlugin（规则、投影视图、胜负）
```

- `bbge/network/` 只传输未知类型消息，不读取规则或私有手牌。
- `bbge/ui/src/room-controller.ts` 维护座位与连接绑定、恢复令牌和单调 revision。
- `HostSession` 是唯一能够应用动作与生成每位玩家私有投影视图的权威。
- 插件只能处理合法 `Action` 与状态，禁止导入网络或浏览器 API。

## v2 协议

所有 `WireMessage` 都带 `protocolVersion: 2`。旧协议房间不兼容；访客握手超时后必须提示双方刷新页面，不能无限显示“正在连接”。

| 消息 | 方向 | 用途 |
|---|---|---|
| `joinRequest` | 客 → 主 | 昵称与可选恢复令牌；不含 `playerId` |
| `joinAccepted` | 主 → 客 | 主机分配的玩家 ID、恢复令牌和完整初始快照 |
| `joinRejected` | 主 → 客 | 满员、已开局、恢复令牌失效等明确原因 |
| `stateSync` | 主 → 客 | 原子快照：`revision`、`phase`、`lobby`、该玩家 `view`、聊天和本次事件 |
| `actionRequest` | 客 → 主 | `clientActionId` 与 `{ type, payload }`；不含 `playerId` |
| `actionAccepted` / `actionRejected` | 主 → 客 | 动作确认或错误，解除访客 pending 状态 |
| `chatRequest` / `chatSync` | 双向 | 主机注入发言者身份后广播 |
| `aiPresence` | 主 → 客 | AI 思考状态提示 |

### 快照规则

- 每次大厅改动、开始、动作成功、重赛或断线席位转换，都递增 revision 并发送 `stateSync`。
- 客户端只应用 **严格更大** 的 revision，迟到或重复包不能覆盖最新私有视图。
- 快照必须一次性包含阶段、大厅和当前玩家私有视图；禁止将 `phase`、`lobby`、`view` 拆成存在先后竞态的独立消息。

## 身份与恢复

- 玩家 ID 只由房主创建；远端动作的 `playerId` 一律由连接绑定座位覆盖。
- 房主在大厅中仅在未开局、未满员时接收新玩家。开局后只有持有效恢复令牌的原玩家能回来。
- 恢复令牌用 `sessionStorage` 按 `pluginId + roomId` 保存；只支持同一浏览器会话内刷新或短暂断线恢复。
- 连接断开后座位保留 30 秒。大厅中超时移除；进行中的对局超时转换为 AI。原玩家在宽限期内或之后凭有效令牌回来时恢复 human 座位并获得最新私有视图。

## 生命周期与体验

- PeerJS transport 必须暴露 `connecting`、`open`、`disconnected`、`failed` 状态。
- 建房及访客连接/握手各有约 15 秒超时；房间未成功创建前禁止复制邀请链接。
- 访客断线后使用退避重连，同时提供显式“重新连接”按钮和 P2P/NAT 限制说明。
- 访客发送动作后显示短暂 pending，并在确认、拒绝或较新 revision 抵达时解除，避免重复点击。
- 纯 P2P 无 TURN 凭据，企业网络或复杂 NAT 下可能无法建立 WebRTC 连接；这是可见、可重试的限制，而不是无限加载状态。

## 改动检查清单

1. 协议或控制器改动必须补充 `messages.test.ts` 或 `room-controller.test.ts`。
2. 至少覆盖：版本校验、座位绑定、防伪造动作、revision 去重、动作确认/拒绝、恢复令牌。
3. 修改 `PlayShell` 联机 UI 时，保留 host-authoritative 边界，且提供失败与重试状态。
4. 运行 `npm run test:bbge`、`npm run lint`、`npm run build`；邀请链路至少用两独立浏览器验收一次。
