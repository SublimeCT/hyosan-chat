# hyosan-chat
> [!WARNING]
> 🚧 Work in Progress | 此项目处于早期开发阶段

![](./hyosan-chat-welcome-screenshot.png)
![](./hyosan-chat-messages-screenshot.png)
![](./hyosan-chat-settings-screenshot.png)

## 介绍
`hyosan-chat` 是一个基于 [Lit](https://lit.dev) 和 [Shoelace](https://shoelace.style/) 实现的 AI 对话组件库; 该项目旨在提供一个现代化、高性能且易于扩展的 Web 组件库, 用于构建智能对话界面; 最终实现效果将类似于 [ant-design-x](https://x.ant.design/index-cn)

## 功能特性
- **`Web Components`**: 使用 [Lit](https://lit.dev) 构建的自定义元素, 确保跨框架兼容性
- **`UI` 组件库**: 基于成熟的基础组件库 [Shoelace](https://shoelace.style/)
- **`AI` 集成**: 支持与多种 `AI` 模型和服务集成, 提供智能对话功能
- **模块化设计**: 组件高度解耦, 便于按需引入和扩展
- **性能优化**: 通过 [vite@^6.1.0](https://github.com/vitejs/vite) 构建工具链, 确保快速开发和高效的生产环境性能

## 技术栈
- [Lit@^3.2.1](https://lit.dev): `Web Component` 库
- [shoelace@^2.20.0](https://shoelace.style/): 使用 `Web Components` 实现的 `UI` 组件库
- [vite@^6.1.0](https://github.com/vitejs/vite): 现代化的前端构建工具
- [TypeScript](https://www.typescriptlang.org/): 强类型语言, 确保代码质量和可维护性
- [biome](https://biomejs.dev/zh-cn/guides/getting-started/)：代码格式化和 `lint` 工具, 保证代码风格一致性和质量

## 安装
```bash
pnpm i git+https://github.com/SublimeCT/hyosan-chat.git#main
```

## 使用
[🔗 `demo` 页面](https://snazzy-khapse-06e16b.netlify.app/) 的源码可直接参考 [`src/hyosan-chat-demo.ts`](./src/hyosan-chat-demo.ts)

### vue
> [!TIP]
> 请先阅读官方文档 [在 Vue 中使用自定义元素](https://cn.vuejs.org/guide/extras/web-components#using-custom-elements-in-vue)

TODO

### react
TODO

## API
### Properties
> [!TIP]
>
> 关于 双向数据绑定:
>
> [Lit@^3.2.1](https://lit.dev) 组件不具备像 `vue` 的 `v-model` 一样的双向数据绑定, 必须结合组件提供的 **自定义事件** 来实现; 所以即使组件提供了 `Reflect`, 也无法 直接使用 `v-model`

> [!TIP]
>
> 关于 属性类型:
>
> [Lit@^3.2.1](https://lit.dev) 组件可以接收 `Property` / `Attribute` 参数:
> - `Attribute`: 通过 **`HTML` 元素的属性(`attribute`)** 传递数据, 并且 `attribute` 属性值会转换为 `string` 类型
> - `Property`: 通过 `JS` 获取组件, 并 **在组件对象上** 添加属性, 并且 `Property` 属性值会转换为 `JS` 原生数据类型

| 属性名 | 类型 | 属性类型 | 默认值 | 描述 | [Reflect](https://lit.dev/docs/components/properties/#reflected-attributes) |
| --- | --- | --- | --- | --- | --- |
| `applicationTitle` | `string` | `Attribute` | `'Hyosan Chat'` | 应用标题 |  |
| `panelSnap` | `string` | `Attribute` | `'25% 50%'` | 分割面板的可捕捉位置 | ✅ |
| `panelPosition` | `number` | `Attribute` | `25` | 分隔线与主面板边缘的当前位置(百分比, `0-100`), 默认为容器初始大小的 `50%` | ✅ |
| 💡 `conversations` | `Array<Conversation>` | `Property` | `[]` | 会话列表数据源 | ✅ |
| `currentConversationId` | `BaseService` | `Attribute` | `''` | 当前会话 ID | ✅ |
| 💡 `service` | `BaseService` | `Property` | `new DefaultService()` | 会话服务配置参数 | |
| 💡 `messages` | `BaseServiceMessages` | `Property` | `undefined` | 会话服务消息列表 | ✅ |
| `showAvatar` | `boolean` | `Attribute` | `undefined` | 是否显示头像 | ✅ |
| `showRetryButton` | `boolean` | `Attribute` | `true` | 是否显示 重新生成 按钮 | |
| `showLikeAndDislikeButton` | `boolean` | `Attribute` | `true` | 是否显示 👍 和 👎 按钮 | |
| `onCreateMessage` | `(content?: string) => string | Promise<string>` | `Property` | | 创建消息的回调函数, 当 **没有选中会话** 或 **点击开始新聊天按钮** 时, 如果直接开始发送消息, 会调用此函数, 组件会等待函数返回一个 conversationId, 然后再发送消息; 如果不返回 conversationId, 则不会在组件内部改变 conversationId, 这就相当于创建了一个没有回话 ID 的临时聊天 | |

### Slots
> [!TIP] 关于 插槽
> [Lit@^3.2.1](https://lit.dev) 的插槽与 `vue` 的插槽不同, 基于原生的 [`<slot>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_templates_and_slots) 实现, 不具备作用域插槽, 也不能在组件内部多次渲染插槽

| 名称 | 描述 |
| --- | --- |
| `conversations` | 左侧会话列表 |
| `conversations-header` | 左侧会话列表的 `header` 部分 |
| `conversations-footer` | 左侧会话列表的 `footer` 部分 |
| `main-welcome` | 右侧消息列表的 `welcome` 界面 |
| `main-header` | 右侧消息列表的 `header` 部分 |

### Events
| 事件名 | 参数 | 描述 |
| --- | --- | --- |
| `conversations-create` | `undefined` | 点击创建新会话按钮 |
| `click-conversation` | `CustomEvent<{ item: Conversation }>` | 点击左侧会话列表中的会话 |
| `change-conversation` | `CustomEvent<{ item: Conversation }>` | 点击 **切换** 左侧会话列表中的会话 |
| `send-message` | `CustomEvent<{ content: string }>` | 点击发送按钮 |
| `hyosan-chat-settings-save` | `CustomEvent<{ settings: ChatSettings }>` | 在设置弹窗中点击保存按钮 |
| `edit-conversation` | `CustomEvent<{ item: Converastion }>` | 在会话列表中点击编辑按钮, 并保存 |
| `delete-conversation` | `CustomEvent<{ item: Converastion }>` | 在会话列表中点击删除按钮 |
| `hyosan-chat-click-like-button` | `CustomEvent<{ message: BaseServiceMessageItem, item: BaseServiceMessageNode }>` | 点击 Like 按钮(点赞) |
| `hyosan-chat-click-dislike-button` | `CustomEvent<{ message: BaseServiceMessageItem, item: BaseServiceMessageNode }>` | 点击 Dislike 按钮(点踩) |

## 主题

## 贡献指南
参考 [CONTRIBUTING](./CONTRIBUTING.md)
