import ShoelaceElement from '@/internal/shoelace-element'
import type { BaseServiceMessages } from '@/service/BaseService'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * 对话气泡列表组件
 */
@customElement('hyosan-chat-bubble-list')
export class HyosanChatBubbleList extends ShoelaceElement {
	static styles? = css`
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
  `

	/** 会话服务消息列表 */
	@property({
    attribute: false,
		hasChanged(value: BaseServiceMessages, oldValue: BaseServiceMessages) {
			return !oldValue || value.length !== oldValue.length || value.some(v => v.$loading)
		},
  })
	messages!: BaseServiceMessages

	render() {
		return html`
      <div class="container">
        ${this.messages.map(
					(item) => html`
            <hyosan-chat-bubble-item .message=${item}></hyosan-chat-bubble-item>
          `,
				)}
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-bubble-list': HyosanChatBubbleList
	}
}
