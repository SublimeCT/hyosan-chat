import ShoelaceElement from '@/internal/shoelace-element'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

// shoelace 组件
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import { HasSlotController } from '@/internal/slot'
import type { BaseService, BaseServiceMessages } from '@/service/BaseService'
import { DefaultService } from '@/service/DefaultService'
import type { Conversation } from '@/types/conversations'

@customElement('hyosan-chat')
export class HyosanChat extends ShoelaceElement {
	static styles? = css`
		:host {
			border: 1px solid var(--sl-color-neutral-200);
			border-radius: var(--hy-container-radius);
			width: 100%;
			height: calc(100% - 2px);
		}
		:host > div {
			height: 100%;
		}
		sl-split-panel {
			width: 100%;
			height: 100%;
			--min: 228px;
			--max: 40%;
		}
		.aside-container {
			border-top-left-radius: var(--hy-container-radius);
			border-bottom-left-radius: var(--hy-container-radius);
			background: var(--sl-color-neutral-50);
			height: 100%;
			overflow-y: auto;
		}
		.main-container {
			margin: var(--hy-container-padding);
			width: calc(100% - var(--hy-container-padding) * 2);
			height: calc(100% - var(--hy-container-padding) * 2);
			max-height: calc(100% - var(--hy-container-padding) * 2);
			overflow-y: auto;
			overflow-x: hidden;
			max-height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
		}
		.main-container > header, .main-container > main, .main-container > footer {
			display: flex;
			width: 100%;
		}
		.main-container > main {
			margin: var(--hy-container-padding);
			overflow-y: auto;
			flex: 1;
		}
	`

	// private _locailze = new LocalizeController(this)
	private readonly hasSlotController = new HasSlotController(
		this,
		'conversations',
		'conversations-header',
		'main-welcome',
		'main-header',
	)

	/**
	 * 分割面板的可捕捉位置
	 * @example '25% 50%'
	 * @see https://shoelace.style/components/split-panel#snapping
	 */
	@property({ reflect: true })
	panelSnap = '25%'

	/**
	 * 分隔线与主面板边缘的当前位置(百分比, 0-100), 默认为容器初始大小的 `50%`, 保持响应式
	 * @example 25
	 * @see https://shoelace.style/components/split-panel#initial-position
	 */
	@property({ reflect: true, type: Number })
	panelPosition = 25

	/** 会话列表数据源 */
	@property({ attribute: false, type: Array })
	conversations: Conversation[] = []

	/** 会话服务配置参数 */
	@property({ attribute: false, reflect: true })
	service: BaseService = new DefaultService()

	/** 当前会话 ID */
	@property({ reflect: true })
	currentConversationId = ''

	/** 会话服务消息列表 */
	@property({ attribute: false, reflect: true })
	messages?: BaseServiceMessages

	private async _handleStartNewChat() {
		this.emit('conversations-create')
	}
	/** 右侧消息列表 */
	private get _mainPanel() {
		// biome-ignore lint/complexity/useOptionalChain: <explanation>
		if (this.messages && this.messages.length) {
			return html`
				<!-- 对话气泡 -->
				<hyosan-chat-bubble-list .messages=${this.messages}></hyosan-chat-bubble-list>
			`
		} else {
			return html`<slot name="welcome"></slot>`
		}
	}
	private _handleClickConversation(
		event: GlobalEventHandlersEventMap['click-conversation'],
	) {
		this.currentConversationId = event.detail.item.key
	}

	_onData() {
		console.log('on data', this.messages)
		if (this.messages && this.messages.length > 0) {
			this.messages = [
				...this.messages.slice(0, -1),
				this.messages[this.messages.length - 1],
			]
			// this.messages = [...this.messages]
			// console.log(JSON.stringify(this.messages[this.messages.length - 1]))
			console.log(JSON.stringify(this.messages))
		} else {
			this.messages = []
		}
		this.requestUpdate('messages')
	}
	private async _handleSendMessage(
		event: GlobalEventHandlersEventMap['send-message'],
	) {
		const { content } = event.detail
		// 配置请求参数
		this.service.url = import.meta.env.VITE_CONNECT_URL
		this.service.model = import.meta.env.VITE_CONNECT_MODEL
		this.service.apiKey = import.meta.env.VITE_API_KEY
		// 监听流式请求响应
		this.service.emitter.on('data', this._onData.bind(this))
		try {
			if (!this.messages) {
				this.messages = []
				this._onData()
			}
			console.log('start')
			// 发起流式请求
			await this.service.send(
				content,
				this.currentConversationId,
				this.messages,
			)
			console.log('end')
		} finally {
			this.service.emitter.all.clear()
		}
	}

	render() {
		const hasConversationsSlot = this.hasSlotController.test('conversations')
		const hasConversationsHeaderSlot = this.hasSlotController.test(
			'conversations-header',
		)
		/** 会话列表 header */
		const conversationsHeader = hasConversationsHeaderSlot
			? html`<slot name="conversations-header"></slot>`
			: html`<hyosan-chat-conversations-header slot="conversations-header" @start-new-chat=${this._handleStartNewChat}></hyosan-chat-conversations-header>`
		/** 会话列表 */
		const conversations = hasConversationsSlot
			? html`<slot name="conversations">${conversationsHeader}<slot name="conversations-footer"></slot></slot>`
			: html`
				<hyosan-chat-conversations
					currentConversationId=${this.currentConversationId}
					@click-conversation=${this._handleClickConversation}
					.conversations=${this.conversations}>
					${conversationsHeader}
					<slot name="conversations-footer"></slot>
				</hyosan-chat-conversations>
			`
		return html`
			<div>
				<sl-split-panel snap="${this.panelSnap}" position="${this.panelPosition}">
					<div
						slot="start"
						class="aside-container"
					>
						<!-- 管理会话 -->
						${conversations}
					</div>
					<div
						slot="end"
						class="main-container"
					>
						<header>
							<slot name="main-header"></slot>
						</header>
						<main>
							${this._mainPanel}
						</main>
						<footer>
							<hyosan-chat-sender @send-message=${this._handleSendMessage}></hyosan-chat-sender>
						</footer>
					</div>
				</sl-split-panel>
			</div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat': HyosanChat
	}
	interface GlobalEventHandlersEventMap {
		'conversations-create': CustomEvent<object>
	}
}
