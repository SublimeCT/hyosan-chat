import ShoelaceElement from '@/internal/shoelace-element'
import type { Conversation } from '@/types/conversations'
import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js'
import '@shoelace-style/shoelace/dist/components/menu/menu.js'
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import type SlInput from '@shoelace-style/shoelace/dist/components/input/input.js'
import type SlMenuItem from '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js'

/** 会话列表项 组件 */
@customElement('hyosan-chat-conversations-item')
export class HyosanChatConversationsItem extends ShoelaceElement {
	static styles? = css`
    .item-row {
			margin: var(--hy-container-padding);
			border-radius: var(--hy-container-padding);
			cursor: pointer;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.title {
			display: flex;
			flex: 1;
			width: calc(100% - 40px - var(--hy-container-padding) * 2);
			padding: var(--hy-container-padding);
		}
		.title > span {
			word-break: break-all;
			white-space: pre-wrap;
		}
		.actions-group {
			padding: var(--hy-container-padding);
			display: flex;
			align-items: center;
		}
		.actions-group:hover {
			color: var(--sl-color-primary-600);
		}
		:host([actived]) .item-row, .item-row:hover {
			background-color: var(--sl-color-neutral-200);
		}
		.edit-input::part(input) {
			width: auto;
		}
  `

	/** 本地化控制器 */
	private _localize = new LocalizeController(this)

	/** 是否选中 */
	@property({ type: Boolean })
	actived = false

	/** 会话列表数据源 */
	@property({
		attribute: false,
		type: Object,
		reflect: true,
		hasChanged(value: Conversation, oldValue: Conversation) {
			return value !== oldValue || value.label !== oldValue?.label
		},
	})
	item!: Conversation

	@state()
	private _editMode = false

	private _handleSelect(event: CustomEvent<{ item: SlMenuItem }>) {
		const action = event.detail.item.getAttribute('data-action')
		if (action === 'rename') {
			this._editMode = true
		} else if (action === 'delete') {
			this.emit('delete-conversation', { detail: { item: this.item } })
		}
	}

	/** 编辑输入框元素 */
	@query('.edit-input')
	_editInput?: SlInput
	private _handleChange() {
		if (!this._editMode) throw new Error('Missing edit input')
		if (this._editInput) this.item.label = this._editInput.value
		this.emit('edit-conversation', { detail: { item: this.item } })
		this._editMode = false
	}

	render() {
		return html`
      <div class="item-row" @click=${() => this.emit('click-conversation', { detail: { item: this.item } })}>
        <div class="title">
					${
						this._editMode
							? html`<sl-input
								class="edit-input"
								value=${this.item.label}
								size="small"
								@sl-change=${this._handleChange}
								@click=${(event: Event) => event.stopPropagation()}
								></sl-input>`
							: html`<span>${this.item.label}</span>`
					}
				</div>
				<div class="actions-group" @click=${(event: Event) => event.stopPropagation()}>
					<sl-dropdown @sl-select=${this._handleSelect}>
						<div slot="trigger">
							<hyosan-icon-wrapper>
								<svg t="1741670829587" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2627" width="1em" height="1em" fill="currentColor"><path d="M227.14123 413.647995c-52.14973 0-94.587262 42.439578-94.587262 94.587262 0 52.14973 42.437531 94.587262 94.587262 94.587262 52.147684 0 94.587262-42.437531 94.587262-94.587262C321.728492 456.087573 279.288914 413.647995 227.14123 413.647995z" fill="currentColor" p-id="2628"></path><path d="M510.903016 413.647995c-52.14973 0-94.587262 42.439578-94.587262 94.587262 0 52.14973 42.437531 94.587262 94.587262 94.587262 52.147684 0 94.587262-42.437531 94.587262-94.587262C605.490278 456.087573 563.051723 413.647995 510.903016 413.647995z" fill="currentColor" p-id="2629"></path><path d="M794.665825 413.647995c-52.14973 0-94.587262 42.439578-94.587262 94.587262 0 52.14973 42.437531 94.587262 94.587262 94.587262 52.147684 0 94.587262-42.437531 94.587262-94.587262C889.253086 456.087573 846.813508 413.647995 794.665825 413.647995z" fill="currentColor" p-id="2630"></path></svg>
							</hyosan-icon-wrapper>
						</div>
						<sl-menu>
							<sl-menu-item data-action="rename">${this._localize.term('rename')}</sl-menu-item>
							<sl-menu-item data-action="delete">${this._localize.term('delete')}</sl-menu-item>
						</sl-menu>
					</sl-dropdown>
				</div>
      </div>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-conversations-item': HyosanChatConversationsItem
	}
	interface GlobalEventHandlersEventMap {
		/** 点击会话 */
		'click-conversation': CustomEvent<{ item: Conversation }>
		/** 删除会话 */
		'delete-conversation': CustomEvent<{ item: Conversation }>
		/** 编辑会话 */
		'edit-conversation': CustomEvent<{ item: Conversation }>
	}
}
