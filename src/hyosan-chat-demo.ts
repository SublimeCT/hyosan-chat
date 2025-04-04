import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { withResetSheets } from './sheets'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import HyosanChatIcon from '@/assets/hyosan-chat-icon.png'
import type { BaseService, BaseServiceMessages } from './service/BaseService'
import type { DefaultChatCompletionCreateParamsStreamingOptions } from './service/DefaultService'
import type { HyosanChatUploadFile } from './types/HyosanChatUploadFile'
import type { Conversation } from './types/conversations'

export const tagName = 'hyosan-chat-demo'

@customElement(tagName)
export class HyosanChatDemo extends LitElement {
  static styles = withResetSheets(css`
		:host {
			/* width: calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)); */
			/* height: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)); */
			width: 100%;
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: var(--background-color);
			transition: background-color 0.3s;
			overflow: hidden;

			@media (prefers-color-scheme: dark) {
				--background-color: #121212;
			}

			@media (prefers-color-scheme: light) {
				--background-color: #ffffff;
			}

		}
    .demo-container {
      width: 100%;
      height: 100%;
      max-height: 100%;
      transition: background-color 0.3s;
      overflow: auto;
    }
    .demo-container header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      h1 {
        font-size: 2em;
        color: var(--text-color);
        transition: color 0.3s;
      }
    }
    .demo-container main {
      flex: 1;
      height: 80vh;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: auto;
    }
		.main-welcome {
			display: flex;
			min-height: 0;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 100%;
			height: 100%;
			overflow-y: auto;
		}
		.main-welcome > h2 {
			font-size: 48px;
			/* margin-bottom: 16px; */
			text-align: center;
			width: 100%;
		}
		.main-welcome > img {
			width: 80%;
			max-width: 512px;
		}
    .settigns-tips-line {
      width: 80%;
      margin-bottom: 5px;
    }
    .settigns-tips-line .settings-button-icon {
      vertical-align: middle;
      color: var(--sl-color-primary-600);
    }
	`)

  @state()
  private currentConversationId = ''
  @state()
  private conversations: Array<Conversation> = [
    { key: '001', label: '会话1 (有内容)' },
    { key: '002', label: '会话2' },
    { key: '003', label: '会话3' },
  ]
  /** 创建新聊天 */
  private async _handleConversationsCreate(content?: string) {
    const key = Math.random().toString(36).substring(2, 9)
    // this.conversations.push({ key, label: `新会话 ${key}` })
    this.conversations.splice(0, 0, {
      key,
      label: content || `新会话 ${key}`,
    })
    this.conversations = [...this.conversations]
    this.currentConversationId = key
    this.messages = []
    this.requestUpdate()
    return key
  }
  private _handleClickConversation(
    event: CustomEvent<{
      item: Conversation
      localMessages: BaseServiceMessages | null
    }>,
  ) {
    const conversation = event.detail.item
    const localMessages = event.detail.localMessages
    // console.log('change', localMessages)
    if (conversation.key === this.currentConversationId) {
      this.messages = []
    } else {
      if (conversation.key === '001') {
        this.messages = this.conversationsOneMessages
      } else if (this._messagesMap[conversation.key]) {
        this.messages = this._messagesMap[conversation.key]
      } else {
        this.messages = localMessages || []
      }
    }
    this.currentConversationId = conversation.key
    this.requestUpdate()
  }
  @state()
  messages?: BaseServiceMessages
  conversationsOneMessages: BaseServiceMessages = [
    {
      role: 'system',
      content: 'You are a helpful assistant',
    },
    {
      role: 'user',
      content: '你好',
    },
    {
      role: 'assistant',
      content:
        '你好！很高兴见到你。有什么我可以帮忙的吗？无论是关于学习、工作还是生活中的问题，我都很乐意提供帮助。😊; [Deepseek Platform](https://platform.deepseek.com)',
    },
    {
      role: 'user',
      content: '如何获取和更新 `textarea` 的内容, 使用 `ts` 代码实现',
    },
    {
      role: 'assistant',
      content:
        "在 TypeScript 中，你可以通过以下步骤来获取和更新 `<textarea>` 元素的内容：\n\n1. **获取 `<textarea>` 元素**：使用 `document.querySelector` 或 `document.getElementById` 等方法获取 `<textarea>` 元素的引用。\n2. **获取内容**：通过 `value` 属性获取 `<textarea>` 的当前内容。\n3. **更新内容**：通过设置 `value` 属性来更新 `<textarea>` 的内容。\n\n以下是一个简单的示例代码：\n\n```typescript\n// 假设你的 HTML 中有一个 id 为 \"myTextarea\" 的 textarea 元素\nconst textarea = document.getElementById('myTextarea') as HTMLTextAreaElement;\n\n// 获取 textarea 的内容\nconst currentValue: string = textarea.value;\nconsole.log('当前内容:', currentValue);\n\n// 更新 textarea 的内容\ntextarea.value = '这是新的内容';\n\n// 再次获取更新后的内容\nconst updatedValue: string = textarea.value;\nconsole.log('更新后的内容:', updatedValue);\n```\n\n### 解释：\n- `document.getElementById('myTextarea')`：获取 id 为 `myTextarea` 的 `<textarea>` 元素。\n- `as HTMLTextAreaElement`：将获取的元素断言为 `HTMLTextAreaElement` 类型，以便 TypeScript 知道这是一个 `<textarea>` 元素。\n- `textarea.value`：获取或设置 `<textarea>` 的内容。\n\n### 动态更新内容\n如果你希望在用户输入时动态更新 `<textarea>` 的内容，可以使用 `input` 事件监听器：\n\n```typescript\ntextarea.addEventListener('input', (event: Event) => {\n    const target = event.target as HTMLTextAreaElement;\n    console.log('用户输入的内容:', target.value);\n});\n```\n\n### 总结\n- 使用 `value` 属性获取和设置 `<textarea>` 的内容。\n- 如果需要实时监听用户输入，可以使用 `input` 事件。\n\n希望这对你有帮助！如果有其他问题，欢迎继续提问。😊",
    },
    {
      role: 'user',
      content: '贝叶斯公式',
    },
    {
      role: 'assistant',
      content:
        '贝叶斯公式是概率论中的一个重要定理，用于计算条件概率。它的数学表达式如下：\n\n\\[\nP(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\n\\]\n\n其中：\n- \\( P(A|B) \\) 是在事件 \\( B \\) 发生的情况下，事件 \\( A \\) 发生的概率；即 \\( A \\) 的后验概率。\n- \\( P(B|A) \\) 是在事件 \\( A \\) 发生的情况下，事件 \\( B \\) 发生的概率；即 \\( B \\) 的似然度。\n- \\( P(A) \\) 是事件 \\( A \\) 发生的先验概率。\n- \\( P(B) \\) 是事件 \\( B \\) 发生的总概率，可以通过全概率公式计算。\n\n贝叶斯公式在统计推断、机器学习、医学诊断等领域都有广泛的应用。它允许我们在获得新证据（如观察到事件 \\( B \\)）的基础上更新对某一事件（如事件 \\( A \\)）的信念。',
    },
    {
      role: 'user',
      content: '对比一下 web components 库 Lit 和 Omi',
    },
    {
      role: 'assistant',
      content:
        '以下是 **Lit** 和 **Omi** 的对比分析，从核心特性、语法风格、适用场景等多个角度展开：\n\n---\n\n### **1. 核心特性对比**\n| **特性**                | **Lit**                              | **Omi**                              |\n|-------------------------|--------------------------------------|--------------------------------------|\n| **开发背景**            | Google 团队维护，专注 Web Components | 腾讯团队开发，整合 Web Components 与框架特性 |\n| **核心定位**            | 轻量级 Web Components 开发库         | 支持 Web Components 的响应式框架      |\n| **响应式数据**          | 基于 `ReactiveElement` 的装饰器语法  | 类似 Vue 的响应式系统（依赖 `@omi/reactive`） |\n| **模板语法**            | 基于 Tagged Template Literals        | 支持 JSX 和类 Vue 模板语法             |\n| **体积**                | ~5 KB (gzipped)                      | ~10 KB (gzipped)                     |\n| **生态扩展**            | 通过 Lit Labs 提供实验性功能          | 内置路由、状态管理等扩展               |\n| **浏览器兼容性**        | 现代浏览器 + Polyfill                | 现代浏览器 + Polyfill                |\n\n---\n\n### **2. 语法风格对比**\n#### **Lit**\n- **模板语法**：基于 JavaScript 模板字符串，逻辑与 UI 分离：\n  ```javascript\n  render() {\n    return html`<div>${this.count}</div>`;\n  }\n  ```\n- **响应式更新**：通过 `@property` 装饰器声明响应式属性：\n  ```typescript\n  @property({ type: Number }) count = 0;\n  ```\n- **生命周期**：直接继承 `LitElement` 的生命周期钩子（如 `firstUpdated`, `updated`）。\n\n#### **Omi**\n- **模板语法**：支持 JSX 或类 Vue 的模板语法（更贴近前端框架习惯）：\n  ```jsx\n  render() {\n    return <div>{this.count}</div>;\n  }\n  ```\n- **响应式更新**：类似 Vue 的 `reactive` 系统，自动追踪依赖：\n  ```javascript\n  data = reactive({ count: 0 });\n  ```\n- **内置功能**：提供路由 (`omi-router`)、状态管理 (`omi-store`) 等扩展。\n\n---\n\n### **3. 性能对比**\n- **Lit**：  \n  - 极简的 Virtual DOM 实现（差异更新仅针对动态部分）。  \n  - 更接近原生 Web Components，性能优化更直接。  \n- **Omi**：  \n  - 基于 Proxy 的响应式系统，依赖追踪可能引入微开销。  \n  - 适合复杂交互场景，但体积略大。\n\n---\n\n### **4. 适用场景**\n| **场景**                | **Lit**                              | **Omi**                              |\n|-------------------------|--------------------------------------|--------------------------------------|\n| **轻量级组件库**        | ✅ 更适合                             | ❌ 功能略重                           |\n| **复杂交互应用**        | ❌ 需自行扩展状态管理                 | ✅ 内置路由、状态管理                  |\n| **跨框架集成**          | ✅ 原生 Web Components，通用性强      | ✅ 支持生成标准 Custom Elements        |\n| **团队技术栈偏好**      | 偏好原生 Web Components 或轻量方案   | 偏好类 Vue/React 的开发体验            |\n\n---\n\n### **5. 生态与社区**\n- **Lit**：  \n  - Google 背书，社区活跃度高，文档完善。  \n  - 适合长期维护的开源项目。  \n- **Omi**：  \n  - 腾讯内部及国内生态支持，中文文档友好。  \n  - 适合快速开发国内项目，尤其是腾讯系技术栈。\n\n---\n\n### **总结建议**\n- **选择 Lit**：  \n  若追求极简、贴近 Web Components 标准，或需要高度可复用的跨框架组件。\n- **选择 Omi**：  \n  若需要类前端框架的开发体验（如 JSX + 响应式），或希望快速集成路由、状态管理等开箱即用的功能。\n\n根据项目需求权衡，两者均是优秀的 Web Components 解决方案。',
      // $loading: false,
      // $reasoningContent:
      // '嗯，用户现在想对比一下Lit和Omi这两个Web Components库。我需要先了解这两个库的基本情况，然后从不同的方面进行比较。首先，Lit是Google维护的一个轻量级库，专注于提供高效的Web Components开发体验。而Omi是腾讯团队开发的，同样基于Web Components，但可能更偏向于与前端框架的集成，比如支持响应式数据绑定和更丰富的功能。\n\n用户可能是一个前端开发者，正在选型，想要知道哪个库更适合他们的项目。我需要考虑他们的使用场景，比如是否需要轻量级、性能、生态系统、语法偏好等。另外，用户可能对中文文档的支持比较在意，因为Omi是腾讯开发的，可能有更好的中文资源。\n\n首先，我应该比较两者的核心特性。Lit的模板系统基于Tagged Template Literals，而Omi支持JSX，这对于习惯React的开发者来说可能更容易上手。然后看响应式数据，Lit使用装饰器和属性显式声明，而Omi使用类似Vue的响应式系统，这可能影响开发体验。\n\n性能方面，两者都基于Web Components，理论上性能接近，但Lit更轻量，可能在某些场景下更快。生态系统方面，Lit作为Google维护的项目，可能有更活跃的社区和更多的第三方工具，而Omi可能更适合国内开发者，特别是腾讯系的项目。\n\n还有语法偏好，如果团队熟悉React，Omi的JSX可能更合适；如果倾向于原生Web Components，Lit更接近标准。另外，中文支持方面，Omi可能有优势，而Lit的文档虽然全面，但主要是英文。\n\n用户可能没有明确提到的深层需求，比如项目规模、团队熟悉的技术栈、是否需要与其他框架集成，或者是否有特定的性能要求。比如，如果项目需要高度定制化的组件，并且希望减少框架依赖，Lit可能更合适。而如果需要快速开发，并且希望利用类似Vue的响应式系统，Omi可能更适合。\n\n另外，考虑到Web Components的浏览器兼容性，两者都需要polyfill支持旧浏览器，但Lit可能在这方面有更多的优化和最佳实践。而Omi可能在集成到现有Vue或React项目中更容易，特别是如果项目已经在使用腾讯的其他技术栈。\n\n最后，总结两者的适用场景，帮助用户根据具体需求做出选择。可能需要提醒用户考虑团队熟悉度、项目需求以及长期维护的支持等因素。',
    },
    {
      role: 'user',
      content: 'video demo',
    },
    {
      role: 'assistant',
      content: [
        {
          type: 'video_url',
          video_url: {
            url: 'https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20250225/glrqyl/29a2e615-6443-4647-bbe2-e26f345a3b26.mp4',
          },
        },
      ],
    },
  ]

  /** 已保存的消息 Map 数据 */
  private _messagesMap: Record<string, BaseServiceMessages> = {}

  private _handleMessagesCompletions(
    event: CustomEvent<{ messages: BaseServiceMessages }>,
  ) {
    this._messagesMap[this.currentConversationId] = event.detail.messages
    // console.log('✅', event.detail.messages, this, this._messagesMap)
  }

  private _handleEnableSearch(
    open: boolean,
    service: BaseService<DefaultChatCompletionCreateParamsStreamingOptions>,
  ) {
    if (open) {
      service.chat.enable_deep_search = true
      service.chat.enable_search = true
    } else {
      Reflect.deleteProperty(service.chat, 'enable_deep_search')
      Reflect.deleteProperty(service.chat, 'enable_search')
    }
  }
  private _handleLocalizeUpdateConversations(
    event: CustomEvent<{ conversations: Array<Conversation> }>,
  ) {
    this.conversations = event.detail.conversations
  }

  private async _handleSendFirstMessage(content: string) {
    return content.substring(0, 20)
  }
  private _handleDeleteConversation(
    event: CustomEvent<{ item: Conversation }>,
  ) {
    if (this.currentConversationId === event.detail.item.key)
      this.messages = undefined
  }
  private _uploadOnChange(
    file: File,
    files: Array<File>,
    currentFile: HyosanChatUploadFile,
    currentFiles: Array<HyosanChatUploadFile>,
    onProgress: (progress: number) => void,
    onSuccess: (url: string) => void,
    onFailed: (message: string) => void,
  ) {
    console.log(
      'change',
      file,
      files,
      currentFile,
      currentFiles,
      onProgress,
      onSuccess,
      onFailed,
    )
    setTimeout(() => {
      onProgress(0.3)
    }, 800)
    setTimeout(() => {
      onProgress(0.6)
    }, 1300)
    setTimeout(() => {
      onProgress(1)
      onSuccess(
        currentFiles.length === 1
          ? 'https://img.alicdn.com/imgextra/i1/O1CN01gDEY8M1W114Hi3XcN_!!6000000002727-0-tps-1024-406.jpg'
          : 'https://img.alicdn.com/imgextra/i1/O1CN01ukECva1cisjyK6ZDK_!!6000000003635-0-tps-1500-1734.jpg',
      )
    }, 1700)
  }

  render() {
    return html`
			<div class="demo-container">
				<hyosan-chat
					.conversations=${this.conversations}
					.messages=${this.messages}
          showReadAloudButton
          enableUpload
          .uploadOnChange=${this._uploadOnChange.bind(this)}
					.onCreateMessage=${this._handleConversationsCreate.bind(this)}
          .onSendFirstMessage=${this._handleSendFirstMessage.bind(this)}
					.onEnableSearch=${this._handleEnableSearch.bind(this)}
					currentConversationId=${this.currentConversationId}
					@messages-completions=${this._handleMessagesCompletions}
					@change-conversation=${this._handleClickConversation}
          @localize-update-conversations=${this._handleLocalizeUpdateConversations}
          @delete-conversation=${this._handleDeleteConversation}
				>
					<div slot="main-welcome" class="main-welcome">
						<h2>Welcome To Hyosan Chat</h2>
            <p class="settigns-tips-line">
              You can set your own large model configuration parameters by clicking the Settings button
              <span class="settings-button-icon">
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18234" width="1em" height="1em" fill="currentColor"><path d="M1008.512 414.848l-99.264-25.728c-7.616-24.704-17.408-48.576-29.312-71.168l51.904-88.256c4.8-8.128 3.456-18.432-3.136-25.088l-109.184-109.248c-6.72-6.656-17.024-7.936-25.152-3.2l-88.32 51.904c-22.528-11.84-46.336-21.632-71.104-29.312l-25.664-99.328c-2.368-9.088-10.624-15.424-20.032-15.424l-154.432 0c-9.344 0-17.6 6.336-19.968 15.424l-25.792 99.328c-24.704 7.68-48.512 17.472-70.976 29.376l-88.32-52.032c-8.192-4.736-18.56-3.52-25.088 3.2l-109.312 109.248c-6.656 6.656-8 16.96-3.136 25.024l51.968 88.384c-11.904 22.464-21.632 46.272-29.376 70.976l-99.328 25.792c-9.152 2.368-15.488 10.624-15.488 20.032l0 154.432c0 9.408 6.336 17.664 15.488 19.968l99.264 25.728c7.68 24.832 17.536 48.64 29.312 71.04l-52.032 88.32c-4.736 8.128-3.456 18.432 3.2 25.088l109.184 109.248c6.72 6.656 17.024 7.936 25.152 3.136l88.32-51.968c22.528 11.84 46.336 21.76 71.04 29.312l25.664 99.328c2.496 9.216 10.752 15.616 20.16 15.616l154.432 0c9.408 0 17.6-6.336 19.968-15.488l25.792-99.328c24.768-7.68 48.576-17.472 71.104-29.312l88.192 51.968c8.192 4.672 18.432 3.456 25.088-3.2l109.248-109.12c6.72-6.656 8-16.96 3.2-25.088l-51.968-88.32c11.968-22.528 21.76-46.336 29.376-71.04l99.264-25.728c9.216-2.432 15.552-10.688 15.552-20.096l0-154.432c0-9.344-6.336-17.664-15.488-19.968l0 0zM512.064 738.624c-124.992 0-226.624-101.632-226.624-226.624s101.632-226.624 226.624-226.624c124.928 0 226.496 101.632 226.496 226.624s-101.632 226.624-226.496 226.624l0 0z" fill="currentColor" p-id="18235"></path></svg>
              </span>
              in the sidebar or in the upper right corner
            </p>
            <img .src=${HyosanChatIcon} />
					</div>
				</hyosan-chat>
			</div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [tagName]: HyosanChatDemo
  }
}
