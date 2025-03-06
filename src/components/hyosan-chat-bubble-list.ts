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
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }
  `

	/** 会话服务消息列表 */
	@property({ attribute: false, reflect: true })
	messages!: BaseServiceMessages

	render() {
		return html`
      <div>
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
