# hyosan-chat

![](./hyosan-chat-welcome-screenshot.png)
![](./hyosan-chat-messages-screenshot.png)
![](./hyosan-chat-dark-screenshot.png)
![](./hyosan-chat-settings-screenshot.png)
![](./hyosan-chat-mobile-screenshot.png)

## 介绍
`hyosan-chat` 是一个基于 [Lit](https://lit.dev) 和 [Shoelace](https://shoelace.style/) 实现的 AI 对话组件库, **基于 `Web Components` 技术栈, 适用于任何框架([vue](#vue) / [react](#react) / [angular](#angular) / [vanilla](#vanilla) `...`)**, 该项目旨在提供一个现代化、高性能且易于扩展的 Web 组件库, 用于构建智能对话界面; 最终实现效果将类似于 [ant-design-x](https://x.ant.design/index-cn)

## Demo
[🔗 `demo` 页面](https://snazzy-khapse-06e16b.netlify.app/)

## 功能特性
- **`Web Components`**: 使用 [Lit](https://lit.dev) 构建的自定义元素, 确保跨框架兼容性, 目前已在 [vue](#vue) / [react](#react) / [angular](#angular) 等框架中测试通过
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
pnpm i hyosan-chat
```

## 使用
[🔗 `demo` 页面](https://snazzy-khapse-06e16b.netlify.app/) 的源码可直接参考 [`src/hyosan-chat-demo.ts`](./src/hyosan-chat-demo.ts)

组件附带了一个用于声明自定义元素信息的文件, 可以实现在 `vscode` / `JetBrains IDE` 中的代码补全功能

### vscode
需要在 `vscode` 的 `settings.json` 中声明组件提供的 `types`:

`.vscode/settings.json`:
```diff
{
+  "html.customData": [
+    "./node_modules/hyosan-chat/dist/cem-types/vscode.html-custom-data.json"
+  ]
}
```

### JetBrains IDE
组件已经声明了一个 `dist/web-types.json` 文件, **在 `JetBrains IDE` 中应该会检测到**, 如果没有任何提示, 你可能需要在 `package.json` 中声明 `web-types`, 可参考 [JetBrains IDEs - Shoelace](https://shoelace.style/getting-started/usage#jetbrains-ides)

### TypeScript
组件完全使用 `TypeScript` 编写, 也基于 [custom-elements-manifest](https://custom-elements-manifest.open-wc.org/) 提供了一流的 `TypeScript` 支持, 只需引入组件提供的类型文件即可

`tsconfig.json`:
```diff
{
  "compilerOptions": {
    // ...
+    "types": [
+      "hyosan-chat/dist/cem-types/vue/index.d.ts"
+    ]
  },
}

```

### vue
> [!TIP]
> 具体使用方式可参考示例项目: [hyosan-chat-vue-demo](https://github.com/SublimeCT/hyosan-chat-vue-demo)  
> 请先阅读官方文档 [在 Vue 中使用自定义元素](https://cn.vuejs.org/guide/extras/web-components#using-custom-elements-in-vue)

在 `Vue` 中默认将所有元素作为 vue 组件, 但自定义元素不能被当做 vue 组件进行处理, 我们需要显示地声明哪些是自定义组件:

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.includes('hyosan-')
        }
      }
    })
  ],
})
```

> [!TIP]
> 对于 vue2 项目, 应该配置 [Vue.config.ignoredElements](https://v2.cn.vuejs.org/v2/api/#ignoredElements)

以上配置是将 `hyosan-*` 组件作为自定义组件处理

- 在代码中我们也必须严格使用 `<hyosan-chat>`, 而不能写成 `<HyosanChat>`
- 对于 `slot` 也不能使用 `v-slot` / `#` 语法, 因为 `Web Components` 的插槽是原生的 [slot](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/slot), vue 的特殊插槽语法无法在自定义组件中使用

> [!TIP]
> 关于自定义元素使用插槽的局限性可参考 [插槽 - vue](https://cn.vuejs.org/guide/extras/web-components.html#slots)

vue 对于 `Property` 参数(在 [Properties](#properties) 中标注了哪些属性是 `Property`) 必须添加 `.prop` 修饰符:

```html
<hyosan-chat :messages.prop="messages"></hyosan-chat>
```

### react
> [!TIP]
> 直接参考示例项目: [hyosan-chat-react-demo](https://github.com/SublimeCT/hyosan-chat-react-demo)

组件库使用 `Lit` 搭建, 并通过 [custom-element-react-wrappers](https://www.npmjs.com/package/custom-element-react-wrappers) 使组件库使用 `forwardRef` 进行了包装, 以便为 `react` 项目提供组件和类型支持, 你可以直接参考上方的示例项目, 也可参考 [#ad39286](https://github.com/SublimeCT/hyosan-chat-react-demo/commit/ad3928658a0f620ab46097fb8c5ab826b9788e66) 了解具体的改动

需要特别注意的是, `react` 组件本身不是 `HTML` 元素, 无法直接作为 `slot`, 应该包裹一个具有 `slot` 属性的容器元素, 然后在容器元素中放置组件, 详见 [using slot - Lit](https://lit.dev/docs/frameworks/react/#using-slots)

如果你想了解更多关于自定义组件如何在 react 项目中使用的细节, 可参考以下文档:
- [React - Lit](https://lit.dev/docs/frameworks/react/)
- [custom-elements-manifest plugins](https://custom-elements-manifest.open-wc.org/analyzer/plugins/intro/#community-plugins)
- [custom-element-react-wrappers](https://www.npmjs.com/package/custom-element-react-wrappers)

### angular
> [!TIP]
> 直接参考示例项目: [hyosan-chat-angular-demo](https://github.com/SublimeCT/hyosan-chat-angular-demo)  
> 具体改动可参考 [#71a4ddf](https://github.com/SublimeCT/hyosan-chat-angular-demo/commit/71a4ddf41669e586c858a8c9b738b794a9952e31)

### vanilla
> [!TIP]
> 直接参考示例项目: [hyosan-chat-vanilla-demo](https://github.com/SublimeCT/hyosan-chat-vanilla-demo)  
> 具体改动可参考 [#c12b2b7](https://github.com/SublimeCT/hyosan-chat-vanilla-demo/commit/c12b2b722ca3fd670847c30571678dbfcfa6dbbe)

`vanilla` 指的是原生的没有使用任何框架的 `javascript` 运行环境或项目, 可以理解为完全空白的项目

## API
### Properties
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
| `showAvatar` | `boolean` | `Attribute` | `true` | 是否显示头像 | ✅ |
| `showRetryButton` | `boolean` | `Attribute` | `true` | 是否显示 重新生成 按钮 | |
| `showLikeAndDislikeButton` | `boolean` | `Attribute` | `true` | 是否显示 👍 和 👎 按钮 | |
| 💡 `onCreateMessage` | `(content?: string) => string \| Promise<string>` | `Property` | `undefined` | 创建消息的回调函数, 当 **没有选中会话** 或 **点击开始新聊天按钮** 时, 如果直接开始发送消息, 会调用此函数, 此回调函数中应该创建新的 `conversation` 并更新 `messages`, 组件会等待函数返回一个 `conversationId`, 然后再发送消息; 如果不返回 `conversationId`, 则不会在组件内部改变 `conversationId`, 这就相当于创建了一个没有回话 ID 的临时聊天 | |
| `onEnableSearch` | `(open: boolean) => void \| Promise<void>` | `Property` | `undefined` | 如果传入则显示联网搜索按钮, 用户点击搜索按钮时 调用此方法 | |
| `shoelaceTheme` | `HyosanChatShoelaceTheme` | `Attribute` | `HyosanChatShoelaceTheme.shoelaceLight` | [shoelace 主题](https://shoelace.style/getting-started/themes#dark-theme), 可用于切换夜间模式 | |
| `avatarGetter`(`0.3.1`) | `(message: BaseServiceMessageItem) => TemplateResult` | `Property` | `undefined` | 消息列表中的头像获取函数, 传入则显示此函数的返回值, 返回值必须是 html`<div>...</div>` 格式的 html, 详见 [lit html slot](#lit-html-slot) | |
| `onBeforeSendMessage`(`0.3.2`) | `(service: BaseService, messages: BaseServiceMessages) => void \| Promise<void>` | `Property` | `undefined` | 在每次发送消息之前执行 | |
| `showReadAloudButton`(`0.4.0`) | `boolean` | `Attribute` | `false` | 是否显示 朗读 按钮 | |
| `onSendFirstMessage`(`0.4.1`) | `Promise<number \| string \| undefined> \| number \| string \| undefined` | `Property` | `undefined` | 在当前会话中首次发送 `user` 消息时调用, 一般用于更新当前会话的 `label`; 返回一个 `number \| string` 值, 将作为消息内容(`content`)或其最大截取长度(返回 `number` 时)并赋值给 `label` 或 直接作为 `label` | |
| `onMessagePartsRender`(`0.5.0`) | `(part: HyosanChatMessageContentPart, message: BaseServiceMessageItem) => Promise<boolean>` | `Property` | `undefined` | 消息部分渲染函数, 返回 `true` 则跳过组件内部的处理逻辑 | |
| `onAfterMessagePartsRender`(`0.5.0`) | `(part: HyosanChatMessageContentPart, message: BaseServiceMessageItem) => Promise<void>` | `Property` | `undefined` | 消息部分渲染函数(`after`) | |
| `uploadHandler`(`0.6.0`) | `HyosanChatUploadHandler` | `Property` | `false` | 上传附件的处理对象, 若值为空, 则不启用上传附件功能 | |

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
| `settings-main-header` | 设置弹窗(从顶部的设置按钮打开)中的表单项部分 |
| `settings-main-aside` | 设置弹窗(从侧边栏底部的设置按钮打开)中的表单项部分 |

其中 `settings-main-header` 和 `settings-main-aside` 都是在设置弹窗中显示的内容, 但因为 `slot` 不能多次渲染, 为了避免渲染失败, 所以将其分为两个 `slot`, 在使用时应该入相同的内容

### Lit html slot
由于原生的 [`<slot>` 元素](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_templates_and_slots) 存在诸多限制, 既无法在组件内部渲染多次, 也无法实现作用域插槽, 所以本组件对外 `export` 了 [html - lit](https://lit.dev/docs/api/static-html/#html) 方法, 用于创建在 `lit` 中使用的 `html` 模板:

```typescript
import { html } from 'hyosan-chat'

const avatar = html`<div>Hello Lit html</div>`
```

`html` 的语法可参考 [lit html](https://lit.dev/docs/templates/expressions/#html-templates) / [Rendering - Lit](https://lit.dev/docs/components/rendering/)

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
| `hyosan-chat-click-like-button` | `CustomEvent<{ message: BaseServiceMessageItem }>` | 点击 Like 按钮(点赞) |
| `hyosan-chat-click-dislike-button` | `CustomEvent<{ message: BaseServiceMessageItem }>` | 点击 Dislike 按钮(点踩) |
| `first-updated` | `CustomEvent<{ service: BaseService }>` | `lit` 原生的 `first-updated hooks` 触发时执行 |
| `messages-completions` | `CustomEvent<{ messages: BaseServiceMessages }>` | 消息接收完毕(可能是成功或报错) |
| `first-updated-complete` | `CustomEvent<{ service: BaseService }>` | `lit` 原生的 `first-updated hooks` 触发后等待 `updateComplete` 后执行 |
| `localize-update-conversations`(`0.4.1`) | `CustomEvent<{ conversations: Array<Conversation> }>` | 当启用本地存储时, 组件首次加载时获取 `conversations` 数据时触发 |


### CSS Parts
可以使用 [::part()](https://developer.mozilla.org/en-US/docs/Web/CSS/::part) 选择器修改组件的样式, 由于 `Web Components` 的样式隔离的特性, 组件外部想要修改组件内的样式只能通过 `::part()` 选择器或组件内部引用的 [css 变量](#css-variables) 来进行控制

| 名称 | 描述 |
| --- | --- |
| `base` | 根组件(`hyosan-chat`) 最外层元素 |

### CSS Variables
组件提供的 css 变量包含两部分:

- 基础组件库 [shoelace](https://shoelace.style/getting-started/themes) 的 css 变量: 参考 [Themes - shoelace](https://shoelace.style/getting-started/themes)
- 组件内部使用的 css 变量: 参考 [src/sheets/global-styles.css](./src/sheets/global-styles.css) 文件

## 主题
组件通过底层的基础组件库 [shoelace](https://shoelace.style) 提供了基础的 `light` / `dark` 两种主题, 如需创建新主题, 可参考 [Creating a theme](https://shoelace.style/getting-started/themes#creating-a-new-theme)

## Service
`BaseService` 是组件在请求和处理聊天消息时的抽象类, 它将处理聊天消息的逻辑进行了抽象, 在实际项目中可以根据情况实现自己的 `Service`, 组件默认使用 `DefaultService`, 它继承了 `BaseService` 抽象类, 并且实现了 `BaseService` 的抽象方法, 提供了默认的消息处理逻辑

现阶段从用户发起聊天到聊天内容渲染到 `DOM` 元素上, **消息内容的处理** 都是由 `Service` 完成的, 以聊天界面为例:

1. 用户在输入框内输入内容, 点击发送按钮或按下 `Enter` 键, `hyosan-chat` 组件会执行 `_handleSendMessage` 方法
2. 更新 `Service` 上的聊天配置参数, 并通过 `this.service.emitter` 监听 `Service` 提供的事件
3. 如果会话不存在, 则调用 `onCreateMessage` `property` 来创建会话和 `messages`
4. 触发 `onBeforeSendMessage` `property` 回调函数
5. 调用 `this.service.send()` / `this.service.retry()` 方法来发送或重新发送消息
6. (`DefaultService`) 在 `send()` 中处理 `messages`, 如果不存在 `system message` 则加入包含默认系统提示词(`this.service.systemPrompt`) 的 `system message`, 并加入用户消息内容
7. (`DefaultService`) 调用 `setChatCompletionParams()` 设置聊天流式请求接口的相关参数
8. (`DefaultService`) **`this.emitter.emit('before-send')`** 触发 `before-send` 事件
9. (`DefaultService`) **调用 `this.fetchChatCompletion()`** 触发 `before-send` 事件
10. (`DefaultService`) **创建 `this.abortController`** 用于停止流式请求
11. (`BaseService`) 调用 `this.getEmptyAssistantMessage()` 加入助手消息
12. (`BaseService`) 调用 `this.handleRequestMessages()` 将 `messages` 处理为请求参数 `messages`
13. (`DefaultService`) 发起流式请求并触发相关事件:
  1. `send-open`: 已建立连接
  2. `data`: 接收流式请求返回数据
  3. `send-done`: 所有内容返回完毕
  4. `error`: 消息请求报错
  5. `abort`: 中断连接
  6. `close`: 关闭连接
14. 进入 `finally` 代码块
15. `this.service.emitter.clearListeners()` 移除 `Service` 上的所有事件监听器
16. 将所有新消息的 `$loading` 设置为 `false`
17. 触发 `messages-completions` 事件

其中 `DefaultService` / `BaseService` 就是在 `Service` 上执行的, 以上步骤可简化为:

1. 组件监听到用户发送消息, 调用 `this.service.send()`
2. 在 `DefaultService` 内部处理请求参数并发起请求
3. 在请求开始直到请求结束时触发指定的事件
4. 请求结束后在组件中触发 `messages-completions` 事件

>[!TIP]
> `<hyosan-chat>` 组件的 `service` 是一个 `property`, 如果要自定义消息数据的处理逻辑, 可以直接创建一个新的 `Service` 并实现 `BaseService` 抽象类, 然后将新的 `Service` 传给 `<hyosan-chat>` 组件

## 消息数据处理
在 `Service` 中发起了聊天请求, 并不断地更新 `messages`, 但接口返回的消息内容为 `markdown` 格式, 最终渲染到页面上时需要将 `markdown` 转换为 `html`, 下面介绍转换的步骤:

1. 在 `Service` 中的每次流式请求返回内容时, 更新 `messages` 中的消息内容
2. 在 `<hyosan-chat-bubble-list>` 组件中, 监听到 `messages` 变化时, 调用 `markdown-it-async` 异步地将 `markdown` 转换为 `html string`
3. 在异步转换结束后, 更新 `this.messagesHtml`, 调用 `this.requestUpdate()` 触发 DOM 层渲染(`render()`)
4. 在 `render()` 中根据 `this.messagesHtml` 渲染出消息内容 `DOM`(使用 `innerHTML`)

## 贡献指南
参考 [CONTRIBUTING](./CONTRIBUTING.md)
