import ShoelaceElement from '@/internal/shoelace-element'
import type { BaseServiceMessageItem } from '@/service/BaseService'
// import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** 消息气泡中的错误信息展示 组件 */
@customElement('hyosan-chat-bubble-error-block')
export class HyosanChatBubbleErrorBlock extends ShoelaceElement {
	static styles? = css`
    :host {
      width: 100%;
    }
    .error-block {
      color: var(--sl-color-danger-500);
      line-height: 1.5;
      margin: var(--hy-container-padding);
    }
    .error-icon {
      margin-bottom: var(--hy-container-padding);
    }
  `

	// /** 本地化控制器 */
	// private _localize = new LocalizeController(this)

	@property({ attribute: false })
	error: BaseServiceMessageItem['$error'] = ''
	get errorMessage() {
		if (this.error instanceof Error) {
			console.dir(this.error)
			return this.error.message
		} else {
			return this.error
		}
	}
	render() {
		console.warn(this.error)
		return html`
      <div class="error-block">
        <hyosan-icon-wrapper class="error-icon">
          <svg t="1741764044001" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2617" width="2em" height="2em"><path d="M512 0C229.205333 0 0 229.205333 0 512s229.205333 512 512 512 512-229.205333 512-512S794.794667 0 512 0z m0 796.458667A56.917333 56.917333 0 1 1 511.957333 682.666667 56.917333 56.917333 0 0 1 512 796.458667z m54.186667-227.797334h0.128a60.501333 60.501333 0 0 1-53.802667 55.893334c2.048 0.256 3.882667 1.152 5.973333 1.152h-11.818666c2.048 0 3.84-0.981333 5.845333-1.109334a59.093333 59.093333 0 0 1-53.162667-55.893333l-13.056-284.16a54.314667 54.314667 0 0 1 54.613334-57.045333h26.282666a52.992 52.992 0 0 1 54.186667 57.002666l-15.146667 284.16z" fill="#B94343" p-id="2618"></path></svg>
        </hyosan-icon-wrapper>
        <span>
          ${this.errorMessage}
        </span>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-bubble-error-block': HyosanChatBubbleErrorBlock
	}
}
