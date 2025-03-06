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
			width: 100%;
			height: 100%;
			display: flex;
		}	
		sl-split-panel {
			width: 100%;
			height: 100%;
			--min: 228px;
			--max: 40%;
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
	private get _mainPanel() {
		if (this.messages) {
			return html`
				<!-- 对话气泡 -->
				<hyosan-chat-bubble-list></hyosan-chat-bubble-list>
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
			<sl-split-panel snap="${this.panelSnap}" position="${this.panelPosition}">
				<div
					slot="start"
					style="height: 100%; overflow-y: auto; background: var(--sl-color-neutral-50);"
				>
					<!-- 管理会话 -->
					${conversations}
				</div>
				<div
					slot="end"
					style="height: 100%;"
				>
					<header>
						<slot name="main-header"></slot>
					</header>
					<main>
						${this._mainPanel}
					</main>
					<footer>
						<pre>TODO: input</pre>
					</footer>
				</div>
			</sl-split-panel>
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
