import ShoelaceElement from '@/internal/shoelace-element'
import type { BaseServiceMessages } from '@/service/BaseService'
import { withResetSheets } from '@/sheets'
import { renderMarkdown } from '@/utils/markdown/markdown'
import hljsGithubTheme from 'highlight.js/styles/github-dark.min.css?inline'
import { type PropertyValues, css, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'

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
      padding: 0.5rem;
      border-radius: 0.5rem;
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
  `,
		unsafeCSS(hljsGithubTheme),
	)

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
	messagesHtml: Array<string> = []

	private _onMessagesChange() {
		Promise.all(
			this.messages.map((message) =>
				renderMarkdown((message.content || '')?.toString()),
			),
		).then((markdownHtmlContents) => {
			this.messagesHtml = markdownHtmlContents
			// console.log('messagesHtml updated [end]')
			this.requestUpdate('messagesHtml')
		})
	}

	protected willUpdate(_changedProperties: PropertyValues): void {
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

	/** 气泡消息行 */
	private _renderMessages() {
		return this.messagesHtml.map((item: string, index: number) => {
			const message = this.messages[index]
			if (!message) return html``
			if (message.role === 'system') return html`` // 系统消息

			return html`
          <div class="bubble-item" ?show-avatar=${this.showAvatar} data-role=${message?.role}>
            ${message.role === 'user' ? '' : this._assistantAvatar}
            <div class="bubble" part="hyosan-chat-bubble" .innerHTML=${item}></div>
            ${message.role === 'user' ? this._userAvatar : ''}
          </div>
        `
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
}
