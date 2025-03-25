import ShoelaceElement from '@/internal/shoelace-element'
// import { LocalizeController } from '@/utils/localize'
import { type PropertyValues, type TemplateResult, css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

// shoelace 组件
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/split-panel/split-panel.js'
import '@shoelace-style/shoelace/dist/components/resize-observer/resize-observer.js'
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js'
import { HasSlotController } from '@/internal/slot'
import type {
  BaseService,
  BaseServiceMessageItem,
  BaseServiceMessageNode,
  BaseServiceMessages,
} from '@/service/BaseService'
import { DefaultService } from '@/service/DefaultService'
import { ChatSettings } from '@/types/ChatSettings'
import type { Conversation } from '@/types/conversations'
import { HyosanChatSpeech } from '@/utils/HyosanChatSpeech'
import {
  HyosanChatShoelaceTheme,
  HyosanChatTheme,
} from '@/utils/HyosanChatTheme'
import type SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.js'

/**
 * HyosanChat 根组件
 * @tag hyosan-chat
 * @tagname hyosan-chat
 * @summary 作为根组件使用
 * @documentation https://github.com/SublimeCT/hyosan-chat/blob/main/README.md
 *
 * @slot conversations - 左侧会话列表
 * @slot conversations-header - 左侧会话列表的 `header` 部分
 * @slot conversations-footer - 左侧会话列表的 `footer` 部分
 * @slot main-welcome - 右侧消息列表的 `welcome` 界面
 * @slot main-header - 右侧消息列表的 `header` 界面
 *
 * @event {undefined} conversations-create - 点击创建新会话按钮
 * @event {{ item: Conversation }} click-conversation - 点击左侧会话列表中的会话
 * @event {{ item: Conversation, service: BaseService }} change-conversation - 点击 **切换** 左侧会话列表中的会话
 * @event {{ content: string }} send-message - 点击发送按钮
 * @event {{ settings: ChatSettings }} hyosan-chat-settings-save - 在设置弹窗中点击保存按钮
 * @event {{ item: Converastion }} edit-conversation - 在会话列表中点击编辑按钮, 并保存
 * @event {{ item: Converastion }} delete-conversation - 在会话列表中点击删除按钮
 * @event {{ message: BaseServiceMessageItem, item: BaseServiceMessageNode }} hyosan-chat-click-like-button - 点击 Like 按钮(点赞)
 * @event {{ message: BaseServiceMessageItem, item: BaseServiceMessageNode }} hyosan-chat-click-dislike-button - 点击 Dislike 按钮(点赞)
 * @event {{ messages: BaseServiceMessages }} messages-completions - 消息接收完毕(可能是成功或报错)
 * @event {{ service: BaseService }} first-updated - (since `0.4.0`) lit 原生的 first-updated hooks 触发时执行
 * @event {{ service: BaseService }} first-updated-complete - (since `0.4.0`) lit 原生的 first-updated hooks 触发后等待 updateComplete 后执行
 *
 * @csspart base - 根组件(`hyosan-chat`) 最外层元素
 * @csspart avatar - (since `0.3.1`) 消息列表组件(`hyosan-chat-bubble-list`) 中的头像部分
 *
 * @cssproperty [--hy-container-padding=8px] - chat 容器中的基础边距
 * @cssproperty [--hy-container-radius=8px] - chat 容器中的 radius
 * @cssproperty [--hy-bubble-spacing=16px] - 消息气泡之间的间距
 * @cssproperty [--hy-bubble-padding=16px] - 消息气泡内部的 padding
 */
@customElement('hyosan-chat')
export class HyosanChat extends ShoelaceElement {
  static styles? = css`
		:host {
			width: 100%;
			height: 100%;
			display: block;
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
			/* overflow-y: auto; */
			overflow-x: hidden;
			max-height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
      background-color: var(--sl-panel-background-color);
		}
		.main-container > header, .main-container > main, .main-container > footer {
			display: flex;
			width: 100%;
		}
		.main-container > main {
			padding-bottom: var(--hy-container-padding);
			overflow-y: auto;
			display: flow-root;
			/* height: calc(100% - 140px); */
			flex: 1;
		}
		.main-container > footer {
			/* height: 132px; */
		}
		.main-welcome-wrapper {
			display: block;
			width: 100%;
			height: 100%;
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
        !value ||
        value.length !== oldValue.length ||
        value.some((v) => v.$loading)
      )
    },
  })
  messages?: BaseServiceMessages

  /** 是否显示头像 */
  @property({ type: Boolean, attribute: 'show-avatar', reflect: true })
  showAvatar = false

  /**
   * 消息列表中的头像获取函数
   * @description 传入则显示此函数的返回值, 返回值必须是 html`<div>...</div>` 格式的 html
   * @since 0.3.1
   */
  @property({ attribute: false })
  avatarGetter?: (message: BaseServiceMessageItem) => TemplateResult

  /** 是否显示重新生成按钮 */
  @property({ type: Boolean })
  showRetryButton = true

  /**
   * 是否显示朗读按钮
   * @since 0.4.0
   */
  @property({ type: Boolean })
  showReadAloudButton = true

  /** 是否显示点赞和踩按钮 */
  @property({ type: Boolean })
  showLikeAndDislikeButton = true

  /**
   * shoelace 主题, 可用于切换夜间模式
   * @description (`0.4.0`)用户可在设置弹窗内修改主题
   */
  @property({ reflect: true })
  shoelaceTheme: HyosanChatShoelaceTheme = HyosanChatShoelaceTheme.auto

  /**
   * 创建消息的回调函数
   * @description 当没有选中会话时, 如果直接开始发送消息, 会调用此函数, 组件会等待函数返回一个 conversationId, 然后再发送消息
   */
  @property({ attribute: false })
  onCreateMessage?: (content?: string) => string | Promise<string>

  private async _handleStartNewChat() {
    if (this.onCreateMessage) {
      const conversationId = await this.onCreateMessage()
      if (conversationId) this.currentConversationId = conversationId
      this.requestUpdate()
      await this.updateComplete
    }
    if (this.compact) this._handleDrawerClickClose()
  }
  /** 当前 `messages` 中是否有消息处于 pending 状态 */
  get isLoading() {
    // console.log('isLoading', this.messages)
    return this.messages ? this.messages.some((v) => v.$loading) : false
  }
  private _handleStopOutput(
    event: CustomEvent<{
      messages: BaseServiceMessages
      message: BaseServiceMessageItem
      item: BaseServiceMessageNode
    }>,
  ) {
    const message = event.detail.message
    message.$loading = false
    if (this.service.abortController) {
      this.service.abortController.abort()
      this.requestUpdate()
    } else {
      console.warn('abortController is undefined')
    }
  }
  private async _handleRetryMessage(message: BaseServiceMessageItem) {
    const index = this.messages?.findIndex((v) => v === message)
    // console.log('_handleRetryMessage', message)
    if (index === -1) {
      throw new Error('message not found')
    } else {
      this._handleSendMessage({ detail: { content: '' } } as any, message)
    }
  }
  private async _handleRetry(
    event: CustomEvent<{
      messages: BaseServiceMessages
      message: BaseServiceMessageItem
      item: BaseServiceMessageNode
    }>,
  ) {
    if (this.service.abortController) {
      this.service.abortController.abort()
    }
    this._handleRetryMessage(event.detail.message)
    this.requestUpdate()
  }
  private _handleRead(
    event: CustomEvent<{
      messages: BaseServiceMessages
      message: BaseServiceMessageItem
      item: BaseServiceMessageNode
      target: HTMLElement
    }>,
  ) {
    const messageElement = event.detail.target.closest('.bubble')
    if (!messageElement)
      throw new Error('Internal Error: Missing message element')
    const messageContentElement =
      messageElement.querySelector('div.read-element')
    if (!messageContentElement)
      throw new Error('Internal Error: Missing message content element')
    HyosanChatSpeech.speak(messageContentElement as HTMLElement)
    // this.service.speak()
  }

  private _handleListDisconnected() {
    this.service.destroy()
  }

  private _changeTheme() {
    HyosanChatTheme.setStyleElement(this.shoelaceTheme)
  }
  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('currentConversationId')) {
      // 切换会话时, 销毁当前 service 上的连接和事件监听器
      this.service.destroy()
    }
    if (_changedProperties.has('shoelaceTheme')) {
      // 切换 shoelace 主题样式(style)
      this._changeTheme()
    }
  }

  /** 右侧消息列表 */
  private get _mainPanel() {
    if (this.messages) {
      const _messages = this.messages
      return html`
				<!-- 对话气泡 -->
				<hyosan-chat-bubble-list
          exportparts="avatar"
					currentConversationId=${this.currentConversationId}
					?showRetryButton=${this.showRetryButton}
					?showLikeAndDislikeButton=${this.showLikeAndDislikeButton}
					?show-avatar=${this.showAvatar}
					@hyosan-chat-stop=${this._handleStopOutput}
					@hyosan-chat-retry=${this._handleRetry}
					@hyosan-chat-read=${this._handleRead}
					@hyosan-chat-bubble-list-disconnected=${this._handleListDisconnected}
          ?showReadAloudButton=${this.showReadAloudButton}
          .avatarGetter=${this.avatarGetter}
					.messages=${_messages}>
				</hyosan-chat-bubble-list>
			`
    } else {
      return html`
				<div class="main-welcome-wrapper">
					<slot name="main-welcome"></slot>
				</div>
			`
    }
  }
  private _handleClickConversation(
    event: GlobalEventHandlersEventMap['click-conversation'],
  ) {
    const isDifferentConversation =
      this.currentConversationId !== event.detail.item.key
    this.currentConversationId = event.detail.item.key
    if (isDifferentConversation)
      this.emit('change-conversation', {
        detail: { item: event.detail.item, service: this.service },
      })
    if (this.compact) this._handleDrawerClickClose()
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
    if (chatSettings.systemPrompts)
      this.service.systemPrompt = chatSettings.systemPrompts
  }
  /**
   * 在每次发送消息之前执行
   * @since 0.3.2
   */
  @property({ attribute: false })
  onBeforeSendMessage?: (
    service: BaseService,
    messages: BaseServiceMessages,
  ) => void | Promise<void>
  private async _handleSendMessage(
    event: GlobalEventHandlersEventMap['send-message'],
    retryMessage?: BaseServiceMessageItem,
  ) {
    const { content } = event.detail
    // 配置请求参数
    this.updateServiceSettingsFromLocalStorage()
    // 监听流式请求响应
    this.service.emitter.on('before-send', this._onData.bind(this))
    if (!this.currentConversationId && this.onCreateMessage) {
      const conversationId = await this.onCreateMessage(content)
      this.requestUpdate()
      await this.updateComplete // 等待当前 update 更新队列执行完毕, 否则会导致请求过程中被中断
      if (conversationId) this.currentConversationId = conversationId
    }
    this.service.emitter.on('send-open', this._onData.bind(this))
    this.service.emitter.on('data', this._onData.bind(this))
    if (!this.messages) {
      this.messages = []
      this._onData()
    }
    // 在发送消息之前调用 onBeforeSendMessage property
    if (typeof this.onBeforeSendMessage === 'function')
      await this.onBeforeSendMessage(this.service, this.messages)
    try {
      console.log('start')
      if (retryMessage) {
        // 发起流式请求
        await this.service.retry(
          this.currentConversationId,
          this.messages,
          retryMessage,
        )
      } else {
        // 发起流式请求
        await this.service.send(
          content,
          this.currentConversationId,
          this.messages,
        )
      }
    } catch (error) {
      console.error(`<hyosan-chat> error: ${error}`, error)
    } finally {
      console.log('end')
      this.service.emitter.clearListeners()
      for (const message of this.messages) {
        if (Reflect.has(message, '$loading')) message.$loading = false
      }
      this.requestUpdate()
      await this.updateComplete
      this.emit('messages-completions', { detail: { messages: this.messages } })
    }
  }

  private _handleSettingsSave(event: CustomEvent<ChatSettings>) {
    console.log(event.detail)
  }

  /** 如果传入则显示联网搜索按钮, 用户点击搜索按钮时 调用此方法 */
  @property({ attribute: false })
  onEnableSearch?: (open: boolean, service: BaseService) => void | Promise<void>

  /** 应用标题 */
  @property()
  applicationTitle = 'Hyosan Chat'

  /** 在小于此宽度时隐藏左侧折叠面板, 变为 button + drawer 的形式 */
  @property({ type: Number, reflect: true })
  wrapWidth = 920
  @state() /** 是否应用紧凑样式 */
  get compact() {
    return this._width < this.wrapWidth
  }

  @state()
  private _width = 0

  private _handleResize(
    event: CustomEvent<{ entries: ResizeObserverEntry[] }>,
  ) {
    const borderBoxSize = event.detail.entries[0].borderBoxSize[0]
    const width = borderBoxSize.inlineSize
    this._width = width
  }

  private _handleClickConversationsButton() {}
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

  private _handleOpenSearch(event: CustomEvent<{ open: boolean }>) {
    if (typeof this.onEnableSearch === 'function') {
      return this.onEnableSearch(event.detail.open, this.service)
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties)
    this.emit('first-updated', { detail: { service: this.service } })
    this.updateComplete.then(() => {
      this.emit('first-updated-complete', { detail: { service: this.service } })
    })
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
      : html`<hyosan-chat-conversations-header slot="conversations-header" title=${this.applicationTitle} @start-new-chat=${this._handleStartNewChat}></hyosan-chat-conversations-header>`
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
      : this.compact
        ? html`
						<hyosan-chat-main-header
							?compact=${this.compact}
							@hyosan-chat-click-conversations-button=${this._handleClickConversationsButton}
							@hyosan-chat-click-settings-button=${this._handleClickSettingsButton}>
							</hyosan-chat-main-header>
						`
        : undefined
    return html`
			<div part="base" class="chat-wrapper" ?data-compact=${this.compact}>
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
							<header style=${mainHeader ? '' : 'height: 0; display: none;'}>
								${mainHeader}
							</header>
							<main>
								${this._mainPanel}
							</main>
							<footer>
								<hyosan-chat-sender
									?loading=${this.isLoading}
									?enableSearch=${!!this.onEnableSearch}
									@open-search=${this._handleOpenSearch}
									@send-message=${this._handleSendMessage}>
								</hyosan-chat-sender>
							</footer>
						</div>
					</sl-split-panel>
				</sl-resize-observer>
				<sl-drawer label="Conversations" contained class="drawer-contained" placement="start" style="--size: 100%;">
					${conversations}
					<!-- <sl-button slot="footer" variant="primary" @click=${this._handleDrawerClickClose}>Close</sl-button> -->
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
    /** 消息接收完毕(可能是成功或报错) */
    'messages-completions': CustomEvent<{ messages: BaseServiceMessages }>
    /** 用户点击切换了会话 */
    'change-conversation': CustomEvent<{
      item: Conversation
      service: BaseService
    }>
    /**
     * lit 原生的 first-updated hooks 触发时执行
     * @since 0.4.0
     */
    'first-updated': CustomEvent<{ service: BaseService }>
    /**
     * lit 原生的 first-updated hooks 触发时执行
     * @since 0.4.0
     */
    'first-updated-complete': CustomEvent<{ service: BaseService }>
  }
}

HyosanChat.define('hyosan-chat')
