import { LitElement, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { withResetSheets } from './sheets'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import type { BaseServiceMessages } from './service/BaseService'
import type { Conversation } from './types/conversations'
import HyosanChatIcon from '@/assets/hyosan-chat-icon.png'

export const tagName = 'hyosan-chat-demo'

@customElement(tagName)
export class HyosanChatDemo extends LitElement {
	static styles = withResetSheets(css`
		:host {
			width: 100vw;
			height: 100vh;
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

			.demo-container {
				width: 90%;
				max-width: 1500px;
				min-width: 530px;
				height: calc(100% - 6rem);
				background-color: var(--container-background-color);
				transition: background-color 0.3s;
				overflow: auto;

				header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					h1 {
						font-size: 2em;
						color: var(--text-color);
						transition: color 0.3s;
					}
				}

				main {
					flex: 1;
					height: 75vh;
					display: flex;
					justify-content: center;
					align-items: center;
					overflow: auto;
				}
			}
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
	private _handleConversationsCreate() {
		const key = Math.random().toString(36).substring(2, 9)
		// this.conversations.push({ key, label: `新会话 ${key}` })
		this.conversations = [
			{
				key,
				label: `新会话 ${key}`,
			},
			...this.conversations,
		]
		this.currentConversationId = key
		this.messages = []
		this.requestUpdate()
	}
	private _handleClickConversation(event: CustomEvent<{ item: Conversation }>) {
		const conversation = event.detail.item
		if (conversation.key === this.currentConversationId) {
			this.messages = []
		} else {
			if (conversation.key === '001') {
				this.messages = this.conversationsOneMessages
			} else {
				this.messages = []
			}
		}
		console.log(this.messages)
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
			content: '如何获取和更新 textarea 的内容, 使用 ts 代码实现',
		},
		{
			role: 'assistant',
			content:
				"在 TypeScript 中，你可以通过以下步骤来获取和更新 `<textarea>` 元素的内容：\n\n1. **获取 `<textarea>` 元素**：使用 `document.querySelector` 或 `document.getElementById` 等方法获取 `<textarea>` 元素的引用。\n2. **获取内容**：通过 `value` 属性获取 `<textarea>` 的当前内容。\n3. **更新内容**：通过设置 `value` 属性来更新 `<textarea>` 的内容。\n\n以下是一个简单的示例代码：\n\n```typescript\n// 假设你的 HTML 中有一个 id 为 \"myTextarea\" 的 textarea 元素\nconst textarea = document.getElementById('myTextarea') as HTMLTextAreaElement;\n\n// 获取 textarea 的内容\nconst currentValue: string = textarea.value;\nconsole.log('当前内容:', currentValue);\n\n// 更新 textarea 的内容\ntextarea.value = '这是新的内容';\n\n// 再次获取更新后的内容\nconst updatedValue: string = textarea.value;\nconsole.log('更新后的内容:', updatedValue);\n```\n\n### 解释：\n- `document.getElementById('myTextarea')`：获取 id 为 `myTextarea` 的 `<textarea>` 元素。\n- `as HTMLTextAreaElement`：将获取的元素断言为 `HTMLTextAreaElement` 类型，以便 TypeScript 知道这是一个 `<textarea>` 元素。\n- `textarea.value`：获取或设置 `<textarea>` 的内容。\n\n### 动态更新内容\n如果你希望在用户输入时动态更新 `<textarea>` 的内容，可以使用 `input` 事件监听器：\n\n```typescript\ntextarea.addEventListener('input', (event: Event) => {\n    const target = event.target as HTMLTextAreaElement;\n    console.log('用户输入的内容:', target.value);\n});\n```\n\n### 总结\n- 使用 `value` 属性获取和设置 `<textarea>` 的内容。\n- 如果需要实时监听用户输入，可以使用 `input` 事件。\n\n希望这对你有帮助！如果有其他问题，欢迎继续提问。😊",
		},
		{
			"role": "user",
			"content": "贝叶斯公式"
		},
		{
			role: "assistant",
			content: "贝叶斯公式是概率论中的一个重要定理，用于计算条件概率。它的数学表达式如下：\n\n\\[\nP(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}\n\\]\n\n其中：\n- \\( P(A|B) \\) 是在事件 \\( B \\) 发生的情况下，事件 \\( A \\) 发生的概率；即 \\( A \\) 的后验概率。\n- \\( P(B|A) \\) 是在事件 \\( A \\) 发生的情况下，事件 \\( B \\) 发生的概率；即 \\( B \\) 的似然度。\n- \\( P(A) \\) 是事件 \\( A \\) 发生的先验概率。\n- \\( P(B) \\) 是事件 \\( B \\) 发生的总概率，可以通过全概率公式计算。\n\n贝叶斯公式在统计推断、机器学习、医学诊断等领域都有广泛的应用。它允许我们在获得新证据（如观察到事件 \\( B \\)）的基础上更新对某一事件（如事件 \\( A \\)）的信念。",
			$loading: false
		}
	]

	render() {
		return html`
			<sl-card class="demo-container">
				<header slot="header">
					<h1>HyosanChatDemo</h1>
					<hyosan-chat-settings-button></hyosan-chat-settings-button>
				</header>
				<main>
					<hyosan-chat
						show-avatar
						.conversations=${this.conversations}
						.messages=${this.messages}
						currentConversationId=${this.currentConversationId}
						@conversations-create="${this._handleConversationsCreate}"
						@click-conversation=${this._handleClickConversation}
					>
						<div slot="main-welcome" style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%;">
							<h2 style="font-size: 3rem; margin-bottom: 1rem; text-align: center;width: 100%;">Welcome To Hyosan Chat</h2>
							<img .src=${HyosanChatIcon} />
						</div>
					</hyosan-chat>
				</main>
			</sl-card>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[tagName]: HyosanChatDemo
	}
}
