import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import '@shoelace-style/shoelace/dist/components/textarea/textarea.js'

/** 发送 组件 */
@customElement('hyosan-chat-sender')
export class HyosanChatSender extends ShoelaceElement {
	static styles? = css`
    :host {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      width: var(--hy-main-container-width);
      min-width: var(--hy-main-container-min-width);
      max-width: var(--hy-main-container-max-width);
      background-color: var(--sl-color-neutral-100);
      padding: 0.5rem;
      border-radius: 0.5rem;
    }
    .container > main {
      width: 100%;
      sl-textarea::part(base) {
        border: none;
        box-shadow: none;
        background-color: transparent;
      }
      sl-textarea::part(textarea) {
        border: none;
        padding-left: 0.5em;
        padding-right: 0.5em;
      }
    }
    .container > footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    section > main {
      width: 100%;
    }
    section > footer {
      width: 100%;
    }
  `

	/** 本地化控制器 */
	private _localize = new LocalizeController(this)

	/** 是否正在加载中 */
	@property({ reflect: true, type: Boolean })
	loading = false

	@state()
	content = ''

	private _handleInput(event: KeyboardEvent) {
		const textarea = event.target as HTMLTextAreaElement
		this.content = textarea.value || ''
	}
	private _handleTextareaKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			this._handleEmitSendMessage()
			this.content = '' // 清空内容
			this.requestUpdate()
		}
	}
	private _handleEmitSendMessage() {
		this.emit('send-message', { detail: { content: this.content } })
	}

	render() {
		return html`
      <div class="container">
        <main>
          <sl-textarea placeholder=${this._localize.term('sendTips')} value=${this.content} rows="2" resize="none" @sl-input=${this._handleInput} @keydown=${this._handleTextareaKeyDown}></sl-textarea>
        </main>
        <footer>
          <div class="option-buttons"></div>
          <div class="action-buttons">
            <sl-button variant="primary" ?loading=${this.loading} ?disabled=${this.loading} circle @click=${this._handleEmitSendMessage}>
              <hyosan-icon-wrapper>
                <svg t="1741252222107" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5069" width="1em" height="1em" fill="currentColor"><path d="M133.8 579l-44.4-44.4c-18.8-18.8-18.8-49.2 0-67.8L478 78c18.8-18.8 49.2-18.8 67.8 0l388.6 388.6c18.8 18.8 18.8 49.2 0 67.8L890 578.8c-19 19-50 18.6-68.6-0.8L592 337.2V912c0 26.6-21.4 48-48 48h-64c-26.6 0-48-21.4-48-48V337.2L202.4 578.2c-18.6 19.6-49.6 20-68.6 0.8z" p-id="5070"></path></svg>
              </hyosan-icon-wrapper>
            </sl-button>
          </div>
        </footer>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-sender': HyosanChatSender
	}
	interface GlobalEventHandlersEventMap {
		'send-message': CustomEvent<{ content: string }>
	}
}
