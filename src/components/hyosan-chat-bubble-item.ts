import ShoelaceElement from '@/internal/shoelace-element'
import type { Conversation } from '@/types/conversations'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { marked } from 'marked'

/**
 * 对话气泡组件
 */
@customElement('hyosan-chat-bubble-item')
export class HyosanChatBubbleItem extends ShoelaceElement {
	static styles? = css`
    :host {
      padding: 0.5rem;
      margin: 0.5rem;
      border-radius: 0.5rem;
      background-color: var(--sl-color-neutral-100);
    }
    .bubble {
      padding: 0.5rem;
      border-radius: 0.5rem;
      background-color: var(--sl-color-neutral-200);
    }
  `

	render() {
		// const markdownContent = this.item.content || ''
		// const htmlContent = marked.parse(markdownContent)
		return html`
      <div class="bubble" ></div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-bubble-item': HyosanChatBubbleItem
	}
}
