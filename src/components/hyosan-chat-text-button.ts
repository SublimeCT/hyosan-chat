import ShoelaceElement from '@/internal/shoelace-element'
import { HasSlotController } from '@/internal/slot'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** 文本按钮 组件 */
@customElement('hyosan-chat-text-button')
export class HyosanChatTextButton extends ShoelaceElement {
	static styles? = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      margin-right: var(--hy-container-padding);
    }
    :host:last-of-type {
      margin-right: 0;
    }
    .button-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.6;
      transition: all 0.2s ease-in-out;
    }
    .button-wrapper:hover {
      opacity: 1;
    }
    .button-wrapper[data-has-label] .label {
      margin-left: calc(var(--hy-container-padding) / 2);
    }
  `

	// /** 本地化控制器 */
	// private _localize = new LocalizeController(this)

	@property({ reflect: true })
	fontSize = '1em'

	private readonly hasSlotController = new HasSlotController(this)

	render() {
		const hasDefaultSlot = this.hasSlotController.test('[default]')
		return html`
      <div class="button-wrapper" ?data-has-label=${hasDefaultSlot} style=${this.fontSize ? `font-size: ${this.fontSize};` : ''}>
        <hyosan-icon-wrapper fontSize=${this.fontSize}>
          <slot name="icon"></slot>
        </hyosan-icon-wrapper>
        <div class="label">
          <slot></slot>
        </div>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-text-button': HyosanChatTextButton
	}
}
