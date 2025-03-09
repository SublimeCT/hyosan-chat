import ShoelaceElement from '@/internal/shoelace-element'
import { withResetSheets } from '@/sheets'
import { toMarkdown } from '@/utils/markdown'
import { css, html, PropertyValues, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
// import highlightAtomOneDarkStyles from 'highlight.js/styles/atom-one-dark.min.css?inline'
import { watch } from '@/internal/watch'
import type { BaseServiceMessageItem } from '@/service/BaseService'
import highlightAtomOneDarkStyles from 'highlight.js/styles/atom-one-dark.min.css?inline'

/**
 * 对话气泡组件
 */
@customElement('hyosan-chat-bubble-item')
export class HyosanChatBubbleItem extends ShoelaceElement {
	static styles? = withResetSheets(css`
    :host {
      display: block;
      margin: var(--hy-bubble-spacing) 0;
      border-radius: var(--hy-container-radius);
      background-color: var(--sl-color-neutral-100);
    }
    .bubble {
      display: block;
      padding: var(--hy-bubble-padding);
      border-radius: var(--hy-container-radius);
      background-color: var(--sl-color-neutral-100);
    }
		.bubble[data-role="user"] {
      background-color: var(--sl-color-primary-100);
		}
  `, unsafeCSS(highlightAtomOneDarkStyles))

	@property({
		attribute: false,
		hasChanged(
			value: BaseServiceMessageItem,
			oldValue: ChatCompletionMessageParam,
		) {
			return value !== oldValue || value.$loading === true
		},
	})
	message!: BaseServiceMessageItem

	@state()
	htmlContent = ''

	protected willUpdate(_changedProperties: PropertyValues): void {
		if (_changedProperties.has('message')) {
			this.onMessageChange()
		}
	}

	async onMessageChange() {
		this.htmlContent = await toMarkdown(this.message.content?.toString() || '')
		this.requestUpdate()
	}

	render() {
		return html`
      <div class="bubble" part="hyosan-chat-bubble" data-role=${this.message.role} .innerHTML=${this.htmlContent}>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-bubble-item': HyosanChatBubbleItem
	}
}
