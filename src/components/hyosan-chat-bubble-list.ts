import ShoelaceElement from '@/internal/shoelace-element'
import type { BaseServiceMessages } from '@/service/BaseService'
import { withResetSheets } from '@/sheets'
import { renderMarkdown } from '@/utils/markdown/markdown'
import { css, html, unsafeCSS, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import hljsGithubTheme from 'highlight.js/styles/github-dark.min.css?inline'

/**
 * 对话气泡列表组件
 */
@customElement('hyosan-chat-bubble-list')
export class HyosanChatBubbleList extends ShoelaceElement {
	static styles? = withResetSheets(css`
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
      display: block;
      margin: var(--hy-bubble-spacing) 0;
      border-radius: var(--hy-container-radius);
      background-color: var(--sl-color-neutral-100);
    }
    .bubble-item .bubble {
      display: block;
      padding: var(--hy-bubble-padding);
      border-radius: var(--hy-container-radius);
      background-color: var(--sl-color-neutral-100);
    }
		.bubble-item .bubble[data-role="user"] {
      background-color: var(--sl-color-primary-100);
		}
  `, unsafeCSS(hljsGithubTheme))

	/** 会话服务消息列表 */
	@property({
    attribute: false,
		hasChanged(value: BaseServiceMessages, oldValue: BaseServiceMessages) {
			return !oldValue || value.length !== oldValue.length || value.some(v => v.$loading)
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
    Promise.all(this.messages.map(message => renderMarkdown((message.content || '')?.toString())))
      .then(markdownHtmlContents => {
        this.messagesHtml = markdownHtmlContents
        this.requestUpdate('messagesHtml')
      })
  }

	protected willUpdate(_changedProperties: PropertyValues): void {
		if (_changedProperties.has('messages')) {
			this._onMessagesChange()
		}
	}

  private _renderMessages() {
    return this.messagesHtml.map(
      (item: string, index: number) => {
        const message = this.messages[index]
        return html`
          <div class="bubble-item" >
            <div class="bubble" part="hyosan-chat-bubble" data-role=${message?.role} .innerHTML=${item}>
            </div>
          </div>
        `
      },
    )
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
