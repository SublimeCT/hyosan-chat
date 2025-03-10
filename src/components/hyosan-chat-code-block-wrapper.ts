import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

/** 发送 组件 */
@customElement('hyosan-chat-code-block-wrapper')
export class HyosanChatCodeBlockWrapper extends ShoelaceElement {
	static styles? = css`
		:host {
			display: block;
			margin: 16px 0;
		}
		.code-block-container {
			display: block;
			border-radius: var(--hy-container-radius);
			border: 1px solid rgba(60, 60, 60, 0.1);
			background-color: var(--sl-color-neutral-500);
			header {
				margin: 4px var(--hy-container-padding);
				color: #EEE;
				display: flex;
				justify-content: space-between;
				button {
					display: block;
					cursor: pointer;
				}
			}
		}
		::slotted(pre) {
			padding: var(--hy-container-padding);
			margin: 0;
			border-bottom-left-radius: var(--hy-container-radius);
			border-bottom-right-radius: var(--hy-container-radius);
			overflow-x: auto;
		}
  `

	@property({ type: String })
	language = 'javascript'

	@state()
	private _copyButtonContent = ''

	/** 本地化控制器 */
	private _localize = new LocalizeController(this)

	private _handleCopy() {
		const pre = this.querySelector('pre')
		if (pre) {
			const text = pre.textContent
			if (text) {
				navigator.clipboard.writeText(text)
				this._copyButtonContent = this._localize.term('copySuccessfully')
				setTimeout(() => {
					this._copyButtonContent = this._localize.term('copy')
					this.requestUpdate()
				}, 2000)
			}
		}
	}

	render() {
		const copyButtonContent =
			this._copyButtonContent || this._localize.term('copy')
		return html`
      <div class="code-block-container">
				<header>
					<div class="lang">${this.language}</div>
					<div class="button-group">
						<button @click=${this._handleCopy}>${copyButtonContent}</button>
					</div>
				</header>
				<main>
					<slot></slot>
				</main>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-code-block-wrapper': HyosanChatCodeBlockWrapper
	}
}
