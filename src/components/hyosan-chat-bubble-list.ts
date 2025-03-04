import ShoelaceElement from '@/internal/shoelace-element'
import type { Conversation } from '@/types/conversations'
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

	/** 会话数据源 */
	@property({ attribute: false, type: Array })
	items: Conversation[] = []

	render() {
		return html`
      <div>
        ${this.items.map(
					(item) => html`
            <hyosan-chat-bubble-item .item=${item}></hyosan-chat-bubble-item>
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
