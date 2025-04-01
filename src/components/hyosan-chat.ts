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
import {
  BaseService,
  type BaseServiceMessageItem,
  type BaseServiceMessages,
  type HyosanChatMessageContentPart,
  MessageDataKey,
} from '@/service/BaseService'
import { DefaultService } from '@/service/DefaultService'
import { ChatSettings } from '@/types/ChatSettings'
import type { HyosanChatUploadFile } from '@/types/HyosanChatUploadFile'
import type { Conversation } from '@/types/conversations'
import { HyosanChatSpeech } from '@/utils/HyosanChatSpeech'
import {
  HyosanChatShoelaceTheme,
  HyosanChatTheme,
} from '@/utils/HyosanChatTheme'
import { LocalConversations } from '@/utils/LocalConversations'
import type SlDrawer from '@shoelace-style/shoelace/dist/components/drawer/drawer.js'
import { ifDefined } from 'lit/directives/if-defined.js'

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
 * @slot settings-main-header - 设置弹窗中的表单项部分
 * @slot settings-main-aside - 设置弹窗中的表单项部分
 *
 * @event {undefined} conversations-create - 点击创建新会话按钮
 * @event {{ item: Conversation }} click-conversation - 点击左侧会话列表中的会话
 * @event {{ item: Conversation, service: BaseService }} change-conversation - 点击 **切换** 左侧会话列表中的会话
 * @event {{ content: string }} send-message - 点击发送按钮
 * @event {{ settings: ChatSettings }} hyosan-chat-settings-save - 在设置弹窗中点击保存按钮
 * @event {{ item: Converastion }} edit-conversation - 在会话列表中点击编辑按钮, 并保存
 * @event {{ item: Converastion }} delete-conversation - 在会话列表中点击删除按钮
 * @event {{ message: BaseServiceMessageItem }} hyosan-chat-click-like-button - 点击 Like 按钮(点赞)
 * @event {{ message: BaseServiceMessageItem }} hyosan-chat-click-dislike-button - 点击 Dislike 按钮(点赞)
 * @event {{ messages: BaseServiceMessages }} messages-completions - 消息接收完毕(可能是成功或报错)
 * @event {{ service: BaseService }} first-updated - (since `0.4.0`) lit 原生的 first-updated hooks 触发时执行
 * @event {{ service: BaseService }} first-updated-complete - (since `0.4.0`) lit 原生的 first-updated hooks 触发后等待 updateComplete 后执行
 * @event {{ conversations: Array<Conversation> }} localize-update-conversations - (since `0.4.1`) 当启用本地存储时, 组件首次加载时获取 conversations 数据时触发
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
    'settings-main-header',
    'settings-main-aside',
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
  @property({ attribute: false, type: Array, reflect: true })
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
        value.some((v) => v[MessageDataKey]?.loading)
      )
    },
  })
  messages?: BaseServiceMessages

  connectedCallback() {
    super.connectedCallback()
    this._initLocalizeData()
  }

  private async _initLocalizeData() {
    const chatSettings = ChatSettings.fromLocalStorage()
    if (chatSettings.localize !== 'true') return
    console.log(
      '%c<hyosan-chat>%c use localize data',
      'color: teal; background: black; padding: 0 3px;',
      'color: inhert',
    )
    const conversations = await LocalConversations.getConversations()
    // 获取到本地的会话数据时, 追加到现有数据尾部, 并对外触发事件
    if (conversations) {
      this.conversations = [...this.conversations, ...conversations]
      this.emit('localize-update-conversations', { detail: { conversations } })
    }
    this.requestUpdate()
  }

  /** 是否显示头像 */
  @property({ type: Boolean, attribute: 'show-avatar', reflect: true })
  showAvatar = true

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
  showReadAloudButton = false

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

  /**
   * 在当前会话中首次发送 `user` 消息时调用, 一般用于更新当前会话的 `label`
   * @since 0.4.1
   * @returns 返回一个 `number | string` 值, 将作为消息内容(`content`)的最大截取长度并赋值给 `label` 或 直接作为 `label`
   */
  @property({ attribute: false })
  onSendFirstMessage?: (
    content: string,
  ) => Promise<number | string | undefined> | number | string | undefined

  /**
   * 禁用的字段
   * @since 0.4.1
   */
  @property({ type: Array, attribute: false })
  disabledFields: Array<string> = []

  /**
   * 消息更新时间, 用于在组件内部重新渲染 message 列表
   * @description 由于 `0.5.0` 起将数据直接保存到了 {@link messages} 上, 在更新渲染所需数据后, 如果直接 `requestUpdate()` 会导致死循环, 所以改为由外部调用者更新 {@link messagesUpdateKey} 时更新
   * @since 0.5.0
   */
  @property({ type: Number })
  messagesUpdateKey = 0

  /**
   * 是否允许上传文件
   * @since 0.6.0
   */
  @property({ type: Boolean })
  enableUpload = false
  /**
   * 允许上传的文件类型
   * @since 0.6.0
   * @see https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#%E9%99%90%E5%88%B6%E5%85%81%E8%AE%B8%E7%9A%84%E6%96%87%E4%BB%B6%E7%B1%BB%E5%9E%8B
   */
  @property()
  uploadAccept = 'image/*'
  /**
   * capture 属性是一个字符串，如果 accept 属性指出了 input 是图片或者视频类型，则它指定了使用哪个摄像头去获取这些数据。
   * - `user` 表示应该使用前置摄像头和（或）麦克风。
   * - `environment` 表示应该使用后置摄像头和（或）麦克风。
   *
   * 如果缺少此属性，则用户代理可以自由决定做什么。如果请求的前置模式不可用，则用户代理可能退回到其首选的默认模式。
   * @since 0.6.0
   * @see https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/capture
   */
  @property()
  uploadCapture?: 'user' | 'environment'

  /**
   * 是否开启图片多选，部分安卓机型不支持
   * @since 0.6.0
   */
  @property({ type: Boolean })
  uploadMultiple = false

  /**
   * 上传文件时触发
   * @since 0.6.0
   */
  @property({ attribute: false })
  uploadOnChange?: (
    file: File,
    files: Array<File>,
    currentFile: HyosanChatUploadFile,
    currentFiles: Array<HyosanChatUploadFile>,
    onProgress: (progress: number) => void,
    onSuccess: (url: string) => void,
    onFailed: (message: string) => void,
  ) => Promise<void> | void

  private async _handleSaveLocalConversation(conversationId: string) {
    const settings = ChatSettings.fromLocalStorage()
    if (conversationId && settings.localize) {
      const conversation = this.conversations.find(
        (c) => c.key === conversationId,
      )
      if (conversation) {
        // 将新会话存入本地
        await LocalConversations.saveConversation(conversation)
        // 将新消息存入本地
        await LocalConversations.saveMessages(conversationId, [])
      }
    }
  }

  private async _handleStartNewChat() {
    if (this.onCreateMessage) {
      const conversationId = await this.onCreateMessage()
      if (conversationId) this.currentConversationId = conversationId

      await this._handleSaveLocalConversation(conversationId)

      this.requestUpdate()
      await this.updateComplete
    }
    if (this.compact) this._handleDrawerClickClose()
  }
  /** 当前 `messages` 中是否有消息处于 pending 状态 */
  get isLoading() {
    // console.log('isLoading', this.messages)
    return this.messages
      ? this.messages.some((v) => v[MessageDataKey]?.loading)
      : false
  }
  private _handleStopOutput(
    event: CustomEvent<{
      messages: BaseServiceMessages
      message: BaseServiceMessageItem<true>
    }>,
  ) {
    const message = event.detail.message
    message[MessageDataKey].loading = false
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
          messagesUpdateKey=${this.messagesUpdateKey}
          .service=${this.service}
          .avatarGetter=${this.avatarGetter}
          .onMessagePartsRender=${this.onMessagePartsRender}
          .onAfterMessagePartsRender=${this.onAfterMessagePartsRender}
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
  private async _handleClickConversation(
    event: GlobalEventHandlersEventMap['click-conversation'],
  ) {
    const isDifferentConversation =
      this.currentConversationId !== event.detail.item.key
    this.currentConversationId = event.detail.item.key
    if (isDifferentConversation) {
      const localMessages = await LocalConversations.getMessages(
        event.detail.item.key,
      )
      this.emit('change-conversation', {
        detail: {
          item: event.detail.item,
          service: this.service,
          localMessages,
        },
      })
      this.messagesUpdateKey++
    }
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
    this.messagesUpdateKey++
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
    const { content, attachments } = event.detail
    if (
      this.onSendFirstMessage &&
      (!this.messages ||
        this.messages.length === 0 ||
        this.messages.every((v) => v.role !== 'user'))
    ) {
      // 1. 在未创建会话或会话首次发送消息时, 执行 onSendFirstMessage, 并更新会话 label
      const lengthOrContent = await this.onSendFirstMessage(content)
      if (lengthOrContent) {
        const index = this.conversations.findIndex(
          (c) => c.key === this.currentConversationId,
        )
        if (index !== -1) {
          const _content =
            typeof lengthOrContent === 'number'
              ? content.substring(0, lengthOrContent)
              : lengthOrContent
          this.conversations.splice(index, 1, {
            ...this.conversations[index],
            label: _content,
          })
          this.conversations = [...this.conversations]
          const settings = ChatSettings.fromLocalStorage()
          if (settings.localize)
            LocalConversations.updateConversation(this.conversations[index])
          this.requestUpdate()
        }
      }
    }
    // 配置请求参数
    this.updateServiceSettingsFromLocalStorage()
    // 监听流式请求响应
    this.service.emitter.on('before-send', this._onData.bind(this))
    // 如果当前没有选中会话, 则调用 onCreateMessage 创建新会话并更新消息
    if (!this.currentConversationId && this.onCreateMessage) {
      const conversationId = await this.onCreateMessage(content)

      await this._handleSaveLocalConversation(conversationId)

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
          BaseService.generateUserMessage(content, attachments),
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
        if (message[MessageDataKey]?.loading)
          message[MessageDataKey].loading = false
      }
      // 将更新后的 messages 提交到本地存储
      const settings = ChatSettings.fromLocalStorage()
      if (settings.localize) {
        await LocalConversations.saveMessages(
          this.currentConversationId,
          this.messages,
        )
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

  /**
   * 消息部分渲染函数
   * @since 0.5.0
   */
  @property({ attribute: false })
  onMessagePartsRender?: (
    part: HyosanChatMessageContentPart,
    message: BaseServiceMessageItem,
  ) => Promise<boolean>

  /**
   * 消息部分渲染函数(`after`)
   * @since 0.5.0
   */
  @property({ attribute: false })
  onAfterMessagePartsRender?: (
    part: HyosanChatMessageContentPart,
    message: BaseServiceMessageItem,
  ) => Promise<void>

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

  private _handleEditConversation(event: CustomEvent<{ item: Conversation }>) {
    const settings = ChatSettings.fromLocalStorage()
    if (!settings.localize) return
    LocalConversations.updateConversation(event.detail.item)
  }

  private _handleDeleteConversation(
    event: CustomEvent<{ item: Conversation }>,
  ) {
    const settings = ChatSettings.fromLocalStorage()
    if (!settings.localize) return
    LocalConversations.deleteConversation(event.detail.item.key)
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
    const hasSettingsMainHeaderSlot = this.hasSlotController.test(
      'settings-main-header',
    )
    /** settings-main-header slot */
    const settingsMainHeaderSlot = hasSettingsMainHeaderSlot
      ? html`<div slot="settings-main"><slot name="settings-main-header"></slot></div>`
      : ''
    const hasSettingsMainAsideSlot = this.hasSlotController.test(
      'settings-main-aside',
    )
    /** settings-main-aside slot */
    const settingsMainAsideSlot = hasSettingsMainAsideSlot
      ? html`<div slot="settings-main"><slot name="settings-main-aside"></slot></div>`
      : ''
    /** 会话列表 header */
    const conversationsHeader = hasConversationsHeaderSlot
      ? html`<slot name="conversations-header"></slot>`
      : html`<hyosan-chat-conversations-header slot="conversations-header" title=${this.applicationTitle} @start-new-chat=${this._handleStartNewChat}></hyosan-chat-conversations-header>`
    /** 会话列表 footer */
    const conversationsFooter = hasConversationsFooterSlot
      ? html`<slot name="conversations-footer"></slot>`
      : html`
        <hyosan-chat-conversations-footer slot="conversations-footer" @hyosan-chat-settings-save=${this._handleSettingsSave} .disabledFields=${this.disabledFields}>
          ${settingsMainAsideSlot}
        </hyosan-chat-conversations-footer>
      `
    /** 会话列表 */
    const conversations = hasConversationsSlot
      ? html`<slot name="conversations">${conversationsHeader}<slot name="conversations-footer"></slot></slot>`
      : html`
				<hyosan-chat-conversations
					currentConversationId=${this.currentConversationId}
					@click-conversation=${this._handleClickConversation}
          @edit-conversation=${this._handleEditConversation}
          @delete-conversation=${this._handleDeleteConversation}
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
              .disabledFields=${this.disabledFields}
							@hyosan-chat-click-conversations-button=${this._handleClickConversationsButton}
							@hyosan-chat-click-settings-button=${this._handleClickSettingsButton}>
                ${settingsMainHeaderSlot}
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
                  ?compact=${this.compact}
									?loading=${this.isLoading}
									?enableSearch=${!!this.onEnableSearch}
                  ?enableUpload=${this.enableUpload}
                  uploadAccept=${this.uploadAccept}
                  uploadCapture=${ifDefined(this.uploadCapture)}
                  .uploadOnChange=${this.uploadOnChange}
                  ?uploadMultiple=${this.uploadMultiple}
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
      /** 本地存储的 messages @since 0.4.1 */
      localMessages: BaseServiceMessages | null
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
    /**
     * 当启用本地存储时, 组件首次加载时获取 conversations 数据时触发
     * @since 0.4.1
     */
    'localize-update-conversations': CustomEvent<{
      conversations: Array<Conversation>
    }>
  }
}

HyosanChat.define('hyosan-chat')
