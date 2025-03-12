import ShoelaceElement from '@/internal/shoelace-element'
import type {
	BaseServiceMessageItem,
	BaseServiceMessageNode,
	BaseServiceMessages,
} from '@/service/BaseService'
import { withResetSheets } from '@/sheets'
import { LocalizeController } from '@/utils/localize'
import { renderMarkdown } from '@/utils/markdown/markdown'
import hljsGithubTheme from 'highlight.js/styles/github-dark.min.css?inline'
import { type PropertyValues, css, html, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import '@shoelace-style/shoelace/dist/components/copy-button/copy-button.js'

/**
 * 对话气泡列表组件
 */
@customElement('hyosan-chat-bubble-list')
export class HyosanChatBubbleList extends ShoelaceElement {
	static styles? = withResetSheets(
		css`
    :host {
      display: flex;
      height: 100%;
      overflow-y: auto;
      width: 100%;
      justify-content: center;
    }
    .container {
      width: var(--hy-main-container-width);
      min-width: var(--hy-main-container-min-width);
      max-width: var(--hy-main-container-max-width);
      padding: var(--hy-container-padding);
      border-radius: var(--hy-container-padding);
    }
    .bubble-item {
      display: flex;
      justify-content: flex-start;
      margin: var(--hy-bubble-spacing) 0;
      border-radius: var(--hy-container-radius);
      .bubble {
        max-width: calc(100% - var(--hy-bubble-avatar-size) - var(--hy-container-padding) * 3);
        display: block;
        padding: var(--hy-bubble-padding);
        border-radius: var(--hy-container-radius);
        background-color: var(--sl-color-neutral-100);
      }
      .avatar {
        width: var(--hy-bubble-avatar-size);
        height: var(--hy-bubble-avatar-size);
        border-radius: 50%;
        color: var(--sl-color-neutral-700);
        background-color: var(--sl-color-neutral-200);
        margin: 0;
        margin-right: var(--hy-container-padding);
      }
      .avatar.assistant {
        color: var(--sl-color-primary-700);
        background-color: var(--sl-color-primary-100);
      }
    }
		.bubble-item[data-role="user"] {
      justify-content: flex-end;
      .bubble {
        background-color: var(--sl-color-primary-100);
      }
      .avatar {
        margin: 0;
        margin-left: var(--hy-container-padding);
      }
		}
    .bubble-item:not([show-avatar]) {
      .avatar {
        display: none;
      }
      .bubble {
        max-width: 100%;
      }
    }
    .bubble {
      word-wrap: break-word;
      table {
        display: block;
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }

      th, td {
        border: 1px solid #d6d6d6;
        padding: 6px 13px;
        text-align: left;
      }

      th {
        background-color: var(--sl-color-neutral-50);
        font-weight: 600;
      }

      tr:nth-child(even) {
        background-color: var(--sl-color-neutral-50);
      } 
      code {
        background-color: var(--hy-code-tag-background-color);
        padding: 3px 5px;
        border-radius: 6px;
        color: var(--hy-code-tag-color);
      }
    }
    .bubble-item[data-role="user"] {
      code {
        background-color: var(--hy-code-tag-background-color-user);
        color: var(--hy-code-tag-color-user);
      }
    }
    .bubble {
      pre code {
        background-color: inherit;
        color: inherit;
      }
    }
    .bubble-item-footer {
      padding-top: var(--hy-container-padding);
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      word-break: keep-all;
      white-space: nowrap;
      .footer-left, footer-right {
        display: flex;
      }
      .footer-left {
        flex: 1;
      }
      .footer-right {
        display: flex;
        hyosan-chat-text-button {
          margin-right: var(--hy-container-padding);
        }
        hyosan-chat-text-button:last-of-type {
          margin-right: 0;
        }
      }
    }
    .segment-actions-content-btn-dislike {
      transform: rotate(180deg);
    }
    .none {
      display: none;
    }
    /* 定义渐变动画 */
    @keyframes gradient-breathing {
      0%, 100% {
        background-color: var(--sl-color-neutral-100); /* 起始颜色 */
      }
      50% {
        background-color: var(--sl-color-neutral-200); /* 中间颜色 */
      }
    }
    .bubble-item[data-loading] .bubble {
      animation: gradient-breathing 3s infinite alternate ease-in-out;
      transition: background-color 0.5s ease-in-out;
    }
  `,
		unsafeCSS(hljsGithubTheme),
	)

	/** 当前会话 ID */
	@property()
	currentConversationId = ''

	/** 是否显示头像 */
	@property({ type: Boolean, attribute: 'show-avatar', reflect: true })
	showAvatar = false

	/** 会话服务消息列表 */
	@property({
		attribute: false,
		hasChanged(
			// value: BaseServiceMessages,
			// oldValue: BaseServiceMessages
		) {
			// console.log(JSON.stringify(value), JSON.stringify(oldValue))
			// return !oldValue || value.length !== oldValue.length || value.some(v => v.$loading)
			return true // 父组件中调用 requestUpdate 时, value 已经与 oldValue 一致, 此时无法判断, 只能返回 true
		},
	})
	messages!: BaseServiceMessages

	/**
	 * 会话服务消息列表对应的使用 `markdown-it` 渲染后的 `HTML`
	 *
	 * 由于 `custom elements` 存在样式隔离的问题, 每个 bubble 都需要引入大量样式(代码高亮),
	 * 为了保证性能, 放弃使用子组件, 直接在 list 组件中进行渲染
	 */
	@state()
	messagesHtml: Array<BaseServiceMessageNode> = []

	private _onMessagesChange() {
		if (!this.messages || this.messages.length === 0) return
		/** 消息列表中, 最后一部分 assistant 中的最开始的消息的索引 */
		let assistantIndex = 0
		const isFirstRender = this.messagesHtml.length === 0
		if (!isFirstRender) {
			for (let messageIndex = this.messages.length; messageIndex--; ) {
				if (this.messages[messageIndex].role === 'assistant') {
					assistantIndex = messageIndex
				} else {
					assistantIndex = messageIndex
					break
				}
			}
		}
		Promise.all(
			this.messages.slice(assistantIndex).map((message, index) => {
				const messagesHtmlItem = this.messagesHtml[assistantIndex + index]
				const updateQueue: Array<Promise<void>> = []
				const messageNode: BaseServiceMessageNode = {
					content: '',
					reasoningContent: '',
				}
				Object.assign(messageNode, messagesHtmlItem)
				// 转换消息内容和思考内容
				if (message.content)
					updateQueue.push(
						renderMarkdown((message.content || '')?.toString()).then((data) => {
							messageNode.content = data
						}),
					)
				if (isFirstRender || (!message.content && message.$reasoningContent)) {
					// console.log(message.$reasoningContent)
					updateQueue.push(
						renderMarkdown((message.$reasoningContent || '')?.toString()).then(
							(data) => {
								messageNode.reasoningContent = data
							},
						),
					)
				}
				return Promise.all(updateQueue).then(() => messageNode)
			}),
		).then((markdownHtmlContents) => {
			this.messagesHtml = this.messagesHtml
				.slice(0, assistantIndex)
				.concat(markdownHtmlContents)
			// console.log('messagesHtml updated [end]', markdownHtmlContents)
			this.requestUpdate('messagesHtml')
			this.updateComplete.then(() => this.scrollToBottom())
		})
	}

	scrollToBottom() {
		this.scrollTop = this.scrollHeight - this.clientHeight
	}

	protected willUpdate(_changedProperties: PropertyValues): void {
		if (_changedProperties.has('currentConversationId')) {
			this.messagesHtml = []
			this.requestUpdate()
		}
		if (_changedProperties.has('messages')) {
			this._onMessagesChange()
		}
	}

	private get _userAvatar() {
		return html`
      <div class="avatar user">
        <hyosan-icon-wrapper>
          <svg t="1741513569281" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1614" width="1em" height="1em" fill="currentColor"><path d="M908.6432 802.848q0 68.576-41.728 108.288t-110.848 39.712l-499.424 0q-69.152 0-110.848-39.712t-41.728-108.288q0-30.272 2.016-59.136t8-62.272 15.136-62.016 24.576-55.712 35.424-46.272 48.864-30.56 63.712-11.424q5.152 0 24 12.288t42.56 27.424 61.728 27.424 76.288 12.288 76.288-12.288 61.728-27.424 42.56-27.424 24-12.288q34.848 0 63.712 11.424t48.864 30.56 35.424 46.272 24.576 55.712 15.136 62.016 8 62.272 2.016 59.136zM725.7952 292.576q0 90.848-64.288 155.136t-155.136 64.288-155.136-64.288-64.288-155.136 64.288-155.136 155.136-64.288 155.136 64.288 64.288 155.136z" p-id="1615"></path></svg>       
        </hyosan-icon-wrapper>
      </div>
    `
	}

	private get _assistantAvatar() {
		return html`
      <div class="avatar assistant">
        <hyosan-icon-wrapper>
          <svg t="1741514236963" class="icon" viewBox="0 0 1072 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15523" width="1em" height="1em" fill="currentColor"><path d="M474.65142875 55.68000031a45.71428594 45.71428594 0 1 1 80.09142844 44.11428563l-37.89714282 68.79999937L672.18285687 169.14285688c40.63999969 0.13714313 60.89142844 49.32571406 32.13714282 78.03428624l-54.67428563 54.67428563H809.14285719a137.14285688 137.14285688 0 0 1 137.14285687 137.14285688v137.14285687a45.71428594 45.71428594 0 1 1 91.42857188 0v137.14285781a45.71428594 45.71428594 0 0 1-91.42857188 0v137.14285688a137.14285688 137.14285688 0 0 1-137.14285687 137.14285687H260.57142875a137.14285688 137.14285688 0 0 1-137.14285688-137.14285687v-137.14285688a45.71428594 45.71428594 0 0 1-91.42857187 0v-137.14285781a45.71428594 45.71428594 0 1 1 91.42857188 0v-137.14285688a137.14285688 137.14285688 0 0 1 137.14285687-137.14285687h260.47999969c1.27999969-1.7371425 2.74285688-3.42857156 4.34285718-5.02857187l36.61714313-36.61714219-122.51428594-0.45714281A45.71428594 45.71428594 0 0 1 399.54285687 192.00000031zM809.14285719 393.32571406H260.57142875a45.71428594 45.71428594 0 0 0-45.71428594 45.71428594v411.42857156a45.71428594 45.71428594 0 0 0 45.71428594 45.71428594h548.57142844a45.71428594 45.71428594 0 0 0 45.71428594-45.71428594v-411.42857156a45.71428594 45.71428594 0 0 0-45.71428594-45.71428594z m-434.28571406 182.85714282a68.57142844 68.57142844 0 1 1-1e-8 137.14285781 68.57142844 68.57142844 0 0 1 0-137.14285782z m319.99999968-1e-8a68.57142844 68.57142844 0 1 1 0 137.14285782 68.57142844 68.57142844 0 0 1 0-137.14285781z" p-id="15524"></path></svg>
        </hyosan-icon-wrapper>
      </div>
    `
	}

	@state()
	private _copyButtonContent = ''

	/** 本地化控制器 */
	private _localize = new LocalizeController(this)

	private _handleCopy(content: string) {
		if (content) {
			navigator.clipboard.writeText(content)
			// this._copyButtonContent = `${this._localize.term('copy')} ✅`
			// // this._copyButtonContent = this._localize.term('copySuccessfully')
			// setTimeout(() => {
			// 	this._copyButtonContent = this._localize.term('copy')
			// 	this.requestUpdate()
			// }, 2000)
		}
	}

	/** 是否显示重新生成按钮 */
	@property({ type: Boolean })
	showRetryButton = true

	/** 是否显示点赞和踩按钮 */
	@property({ type: Boolean })
	showLikeAndDislikeButton = true

	/** 气泡框底部的底部内容 */
	private _bubbleItemFooter(
		message: BaseServiceMessageItem,
		item: BaseServiceMessageNode,
	) {
		/** 是否显示 停止输出按钮 */
		const showStopButton = message.$loading === true
		/** 是否显示重新生成按钮 */
		const showRetryButton = this.showRetryButton && message.$loading === false
		/** 是否显示点赞和踩按钮 */
		const showLikeAndDislikeButton =
			this.showLikeAndDislikeButton &&
			message.role !== 'user' &&
			!message.$loading
		return html`
      <footer class="bubble-item-footer">
        <div class="footer-left">
          <hyosan-chat-text-button @click=${() => this._handleCopy(message.content?.toString() || '')}>
            <svg slot="icon" class="icon" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M931.882 131.882l-103.764-103.764A96 96 0 0 0 760.236 0H416c-53.02 0-96 42.98-96 96v96H160c-53.02 0-96 42.98-96 96v640c0 53.02 42.98 96 96 96h448c53.02 0 96-42.98 96-96v-96h160c53.02 0 96-42.98 96-96V199.764a96 96 0 0 0-28.118-67.882zM596 928H172a12 12 0 0 1-12-12V300a12 12 0 0 1 12-12h148v448c0 53.02 42.98 96 96 96h192v84a12 12 0 0 1-12 12z m256-192H428a12 12 0 0 1-12-12V108a12 12 0 0 1 12-12h212v176c0 26.51 21.49 48 48 48h176v404a12 12 0 0 1-12 12z m12-512h-128V96h19.264c3.182 0 6.234 1.264 8.486 3.514l96.736 96.736a12 12 0 0 1 3.514 8.486V224z"></path></svg>           
            <div>${this._copyButtonContent}</div>
          </hyosan-chat-text-button>
          <hyosan-chat-text-button class=${showStopButton ? '' : 'none'} @click=${() => this.emit('hyosan-chat-stop', { detail: { messages: this.messages, message, item } })}>
            <svg slot="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"><path d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z m3.008-92.992a416 416 0 1 0 0-832 416 416 0 0 0 0 832zM320 320h384v384H320V320z" fill="#262626" p-id="6077"></path></svg>
            <div>${this._localize.term('stopOutput')}</div>
          </hyosan-chat-text-button>
          <hyosan-chat-text-button class=${showRetryButton ? '' : 'none'} @click=${() => this.emit('hyosan-chat-retry', { detail: { messages: this.messages, message, item } })}>
            <svg slot="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7060" width="1em" height="1em" fill="currentColor"><path d="M936.432 603.424q0 2.848-0.576 4-36.576 153.152-153.152 248.288t-273.152 95.136q-83.424 0-161.44-31.424t-139.136-89.728l-73.728 73.728q-10.848 10.848-25.728 10.848t-25.728-10.848-10.848-25.728l0-256q0-14.848 10.848-25.728t25.728-10.848l256 0q14.848 0 25.728 10.848t10.848 25.728-10.848 25.728l-78.272 78.272q40.576 37.728 92 58.272t106.848 20.576q76.576 0 142.848-37.152t106.272-102.272q6.272-9.728 30.272-66.848 4.576-13.152 17.152-13.152l109.728 0q7.424 0 12.864 5.44t5.44 12.864zM950.736 146.272l0 256q0 14.848-10.848 25.728t-25.728 10.848l-256 0q-14.848 0-25.728-10.848t-10.848-25.728 10.848-25.728l78.848-78.848q-84.576-78.272-199.424-78.272-76.576 0-142.848 37.152t-106.272 102.272q-6.272 9.728-30.272 66.848-4.576 13.152-17.152 13.152l-113.728 0q-7.424 0-12.864-5.44t-5.44-12.864l0-4q37.152-153.152 154.272-248.288t274.272-95.136q83.424 0 162.272 31.712t140 89.44l74.272-73.728q10.848-10.848 25.728-10.848t25.728 10.848 10.848 25.728z" p-id="7061"></path></svg>
            <div>${this._localize.term('retry')}</div>
          </hyosan-chat-text-button>
        </div>
        <div class="footer-right">
          <hyosan-chat-text-button class=${showLikeAndDislikeButton ? '' : 'none'} @click=${() => this.emit('hyosan-chat-click-like-button', { detail: { message, item } })}>
            <svg slot="icon" viewBox="0 0 1024 1024" class="segment-actions-content-btn-like" width="1em" height="1em"><path fill="currentColor" d="m732.518 838.86 122.215-384H595.046L646.4 320.718a85.35 85.35 0 0 0-29.082-99.226l-37.273-27.494L379.392 454.86H337.05v384zm76.596 40.756a64 64 0 0 1-60.928 44.544H251.648V369.562h85.76l187.75-244.122a64 64 0 0 1 88.73-12.493l54.067 39.885a170.65 170.65 0 0 1 58.163 198.349l-7.065 18.33h135.68a85.35 85.35 0 0 1 81.305 111.206L809.062 879.565v.102zM102.4 924.16V369.51h85.35v554.65z"></path></svg>
          </hyosan-chat-text-button>
          <hyosan-chat-text-button class=${showLikeAndDislikeButton ? '' : 'none'} @click=${() => this.emit('hyosan-chat-click-dislike-button', { detail: { message, item } })}>
            <svg slot="icon" viewBox="0 0 1024 1024" class="segment-actions-content-btn-dislike" width="1em" height="1em"><path fill="currentColor" d="m732.518 838.86 122.215-384H595.046L646.4 320.718a85.35 85.35 0 0 0-29.082-99.226l-37.273-27.494L379.392 454.86H337.05v384zm76.596 40.756a64 64 0 0 1-60.928 44.544H251.648V369.562h85.76l187.75-244.122a64 64 0 0 1 88.73-12.493l54.067 39.885a170.65 170.65 0 0 1 58.163 198.349l-7.065 18.33h135.68a85.35 85.35 0 0 1 81.305 111.206L809.062 879.565v.102zM102.4 924.16V369.51h85.35v554.65z"></path></svg>
          </hyosan-chat-text-button>
        </div>
      </footer>
    `
	}

	/** 气泡消息行 */
	private _renderMessages() {
		return this.messagesHtml.map(
			(item: BaseServiceMessageNode, index: number) => {
				const message = this.messages[index]
				if (!message) return html``
				if (message.role === 'system') return html`` // 系统消息

				return html`
          <div class="bubble-item" ?data-loading=${message.$loading} ?show-avatar=${this.showAvatar} data-role=${message?.role}>
            ${message.role === 'user' ? '' : this._assistantAvatar}
            <div class="bubble" part="hyosan-chat-bubble">
              <hyosan-chat-reasoner-block class="content reasoning" ?has-content=${!!item.reasoningContent}>
                <div slot="content" .innerHTML=${item.reasoningContent}></div>
              </hyosan-chat-reasoner-block>
              <div class="content" .innerHTML=${item.content}></div>
              ${message.$error ? html`<hyosan-chat-bubble-error-block .error=${message.$error}></hyosan-chat-bubble-error-block>` : ''}
              ${this._bubbleItemFooter(message, item)}
            </div>
            ${message.role === 'user' ? this._userAvatar : ''}
          </div>
        `
			},
		)
	}

	connectedCallback(): void {
		super.connectedCallback()
		this._copyButtonContent = this._localize.term('copy')
	}
	disconnectedCallback(): void {
		this.emit('hyosan-chat-bubble-list-disconnected', {
			detail: {
				currentConversationId: this.currentConversationId,
				messages: this.messages,
			},
		})
	}
	render() {
		return html`
      <div class="container">
        ${this._renderMessages()}
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-bubble-list': HyosanChatBubbleList
	}
	interface GlobalEventHandlersEventMap {
		/** 停止输出 */
		'hyosan-chat-stop': CustomEvent<{
			messages: BaseServiceMessages
			message: BaseServiceMessageItem
			item: BaseServiceMessageNode
		}>
		/** 重试消息 */
		'hyosan-chat-retry': CustomEvent<{
			messages: BaseServiceMessages
			message: BaseServiceMessageItem
			item: BaseServiceMessageNode
		}>
		/** 点击 Like 按钮(点赞) */
		'hyosan-chat-click-like-button': CustomEvent<{
			message: BaseServiceMessageItem
			item: BaseServiceMessageNode
		}>
		/** 点击 Dislike 按钮(点踩) */
		'hyosan-chat-click-dislike-button': CustomEvent<{
			message: BaseServiceMessageItem
			item: BaseServiceMessageNode
		}>
		/** bubble-list 组件被销毁, 此时应该调用 service.destroy 断开可能存在的流式请求 并 移除当前 service 的所有事件监听器 */
		'hyosan-chat-bubble-list-disconnected': CustomEvent<{
			currentConversationId: string
			messages: BaseServiceMessages
		}>
	}
}
