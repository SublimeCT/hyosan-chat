import ShoelaceElement from '@/internal/shoelace-element'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { marked } from 'marked'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

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

  @property({ type: Object })
  message!: ChatCompletionMessageParam

	async render() {
		const markdownContent = this.message.content || ''
		const htmlContent = await marked.parse(markdownContent.toString())
		return html`
      <div class="bubble" .innerHTML=${htmlContent}>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-bubble-item': HyosanChatBubbleItem
	}
}
