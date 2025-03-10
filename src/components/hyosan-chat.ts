import ShoelaceElement from '@/internal/shoelace-element'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

// shoelace 组件
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import '@shoelace-style/shoelace/dist/components/resize-observer/resize-observer.js'
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js'
import { HasSlotController } from '@/internal/slot'
import type { BaseService, BaseServiceMessages } from '@/service/BaseService'
import { DefaultService } from '@/service/DefaultService'
import { ChatSettings } from '@/types/ChatSettings'
import type { Conversation } from '@/types/conversations'
import type SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.js'

@customElement('hyosan-chat')
export class HyosanChat extends ShoelaceElement {
	static styles? = css`
		:host {
			width: 100%;
			height: 100%;
		}
		:host > div {
			height: 100%;
		}
		sl-split-panel {
			width: 100%;
			height: 100%;
			/* --min: 228px; */
			/* --max: 40%; */
		}
		.aside-container {
			border-top-left-radius: var(--hy-container-radius);
			border-bottom-left-radius: var(--hy-container-radius);
			background: var(--sl-color-neutral-50);
			height: 100%;
			overflow-y: auto;
		}
		.main-container {
			/* padding: var(--hy-container-padding); */
			width: 100%;
			/* height: calc(100% - var(--hy-container-padding) * 2); */
			height: 100%;
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
			padding-bottom: var(--hy-container-padding);
			overflow-y: auto;
			flex: 1;
		}
		.chat-wrapper[data-compact] {
			--hy-main-container-width: 100%;
			--hy-main-container-margin-bottom: 0;
		}
		.chat-wrapper[data-compact] .aside-container {
			width: 0;
		}
		.chat-wrapper[data-compact] sl-split-panel {
			grid-template-columns: clamp(
        0%,
        clamp(
          var(--min),
          0% - 0px / 2,
          var(--max)
        ),
        calc(100% - 0px)
      )
			0px auto !important;
		}
		.chat-wrapper[data-compact] sl-split-panel::part(divider) {
			width: 0;
		}
	`

	// private _locailze = new LocalizeController(this)
	private readonly hasSlotController = new HasSlotController(
		this,
		'conversations',
		'conversations-header',
		'conversations-footer',
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
	 * 分隔线与主面板边缘的当前位置(百分比, 0-100), 默认为容器初始大小的 `50%`
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
	@property({
		attribute: false,
		reflect: true,
		hasChanged(value: BaseServiceMessages, oldValue: BaseServiceMessages) {
			return (
				!oldValue ||
				value.length !== oldValue.length ||
				value.some((v) => v.$loading)
			)
		},
	})
	messages?: BaseServiceMessages

	/** 是否显示头像 */
	@property({ type: Boolean, attribute: 'show-avatar', reflect: true })
	showAvatar = false

	private async _handleStartNewChat() {
		this.emit('conversations-create')
	}
	get isLoading() {
		// console.log('isLoading', this.messages)
		return this.messages ? this.messages.some((v) => v.$loading) : false
	}
	/** 右侧消息列表 */
	private get _mainPanel() {
		if (this.messages) {
			const _messages = this.messages
			return html`
				<!-- 对话气泡 -->
				<hyosan-chat-bubble-list ?show-avatar=${this.showAvatar} .messages=${_messages}></hyosan-chat-bubble-list>
			`
		} else {
			return html`<slot name="main-welcome"></slot>`
		}
	}
	private _handleClickConversation(
		event: GlobalEventHandlersEventMap['click-conversation'],
	) {
		this.currentConversationId = event.detail.item.key
	}

	_onData() {
		if (this.messages && this.messages.length > 0) {
			// this.messages = [
			// 	...this.messages.slice(0, -1),
			// 	this.messages[this.messages.length - 1],
			// ]
			this.messages = [...this.messages]
			this.service.messages = this.messages
			// console.log(JSON.stringify(this.messages[this.messages.length - 1]))
			// console.log('<hyosan-chat> _onData', JSON.stringify(this.messages), this.messages)
		} else {
			this.messages = []
		}
		this.requestUpdate('messages')
	}
	/** 从本地存储中更新服务配置 */
	private updateServiceSettingsFromLocalStorage() {
		const chatSettings = ChatSettings.fromLocalStorage()
		this.service.url = chatSettings.baseUrl
		this.service.model = chatSettings.modelName
		this.service.apiKey = chatSettings.apiKey
	}
	private async _handleSendMessage(
		event: GlobalEventHandlersEventMap['send-message'],
	) {
		const { content } = event.detail
		// 配置请求参数
		this.updateServiceSettingsFromLocalStorage()
		// 监听流式请求响应
		this.service.emitter.on('before-send', this._onData.bind(this))
		this.service.emitter.on('send-open', this._onData.bind(this))
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
			this.requestUpdate()
		} finally {
			this.service.emitter.all.clear()
		}
	}

	private _handleSettingsSave(event: CustomEvent<ChatSettings>) {
		console.log(event.detail)
	}

	/** 在小于此宽度时隐藏左侧折叠面板, 变为 button + drawer 的形式 */
	@property({ type: Number, reflect: true })
	wrapWidth = 920
	@state()
	/** 是否应用紧凑样式 */
	get compact() {
		return this._width < this.wrapWidth
	}

	@state()
	private _width = 0

	private _handleResize(event: CustomEvent<{ entries: ResizeObserverEntry[] }>) {
		const borderBoxSize = event.detail.entries[0].borderBoxSize[0]
		const width = borderBoxSize.inlineSize
		this._width = width
	}

	private _handleClickConversationsButton() {

	}
	@query('.drawer-contained')
	private _drawer?: SlDrawer

	private _handleClickSettingsButton() {
		if (!this._drawer) throw new Error('Internal error: drawer not found')
		this._drawer.open = true
	}
	private _handleDrawerClickClose() {
		if (!this._drawer) throw new Error('Internal error: drawer not found')
		this._drawer.hide()
	}

	render() {
		const hasConversationsSlot = this.hasSlotController.test('conversations')
		const hasConversationsHeaderSlot = this.hasSlotController.test(
			'conversations-header',
		)
		const hasMainHeaderSlot = this.hasSlotController.test('main-header')
		const hasConversationsFooterSlot = this.hasSlotController.test(
			'conversations-footer',
		)
		/** 会话列表 header */
		const conversationsHeader = hasConversationsHeaderSlot
			? html`<slot name="conversations-header"></slot>`
			: html`<hyosan-chat-conversations-header slot="conversations-header" @start-new-chat=${this._handleStartNewChat}></hyosan-chat-conversations-header>`
		/** 会话列表 footer */
		const conversationsFooter = hasConversationsFooterSlot
			? html`<slot name="conversations-footer"></slot>`
			: html`<hyosan-chat-conversations-footer slot="conversations-footer" @hyosan-chat-settings-save=${this._handleSettingsSave}></hyosan-chat-conversations-footer>`
		/** 会话列表 */
		const conversations = hasConversationsSlot
			? html`<slot name="conversations">${conversationsHeader}<slot name="conversations-footer"></slot></slot>`
			: html`
				<hyosan-chat-conversations
					currentConversationId=${this.currentConversationId}
					@click-conversation=${this._handleClickConversation}
					.conversations=${this.conversations}>
					${conversationsHeader}
					${conversationsFooter}
				</hyosan-chat-conversations>
			`
		const mainHeader = hasMainHeaderSlot
			? html`<slot name="main-header"></slot>`
			: (
				this.compact
					? html`
						<hyosan-chat-main-header
							?compact=${this.compact}
							@hyosan-chat-click-conversations-button=${this._handleClickConversationsButton}
							@hyosan-chat-click-settings-button=${this._handleClickSettingsButton}>
							</hyosan-chat-main-header>
						`
					: undefined
			)
		return html`
			<div class="chat-wrapper" ?data-compact=${this.compact}>
				<sl-resize-observer @sl-resize=${this._handleResize}>
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
								${mainHeader}
							</header>
							<main>
								${this._mainPanel}
							</main>
							<footer>
								<hyosan-chat-sender ?loading=${this.isLoading} @send-message=${this._handleSendMessage}></hyosan-chat-sender>
							</footer>
						</div>
					</sl-split-panel>
				</sl-resize-observer>
				<sl-drawer label="Drawer" contained class="drawer-contained" placement="start" style="--size: 80%;">
					${conversations}
					<sl-button slot="footer" variant="primary" @click=${this._handleDrawerClickClose}>Close</sl-button>
				</sl-drawer>
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
