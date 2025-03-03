import ShoelaceElement from '@/internal/shoelace-element'
import type { Conversation } from '@/types/conversations'
// import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** 会话列表项 组件 */
@customElement('hyosan-chat-conversations-item')
export class HyosanChatConversationsItem extends ShoelaceElement {
	static styles? = css`
    .item-row { padding: 0.5rem; margin: 0.5rem; border-radius: 0.5rem; cursor: pointer; }
		:host([actived]) .item-row, .item-row:hover { background-color: var(--sl-color-neutral-200); }
  `

	// /** 本地化控制器 */
	// private _localize = new LocalizeController(this)

	/** 是否选中 */
	@property({ type: Boolean })
	actived = false

	/** 会话列表数据源 */
	@property({ attribute: false, type: Object })
	item!: Conversation

	render() {
		return html`
      <div class="item-row" @click=${() => this.emit('click-conversation', { detail: { item: this.item } })}>
        <span>${this.item.label}</span>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-conversations-item': HyosanChatConversationsItem
	}
	interface GlobalEventHandlersEventMap {
		'click-conversation': CustomEvent<{ item: Conversation }>
	}
}
