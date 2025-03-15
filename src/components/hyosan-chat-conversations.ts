import ShoelaceElement from '@/internal/shoelace-element'
// import { HasSlotController } from '@/internal/slot'
import type { Conversation } from '@/types/conversations'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** 管理会话 组件 */
@customElement('hyosan-chat-conversations')
export class HyosanChatConversations extends ShoelaceElement {
	static styles? = css`
		:host { height: 100%; display: block; }
		.aside {
			display: flex;
			flex-direction: column;
			height: 100%;
			main {
				flex: 1;
				overflow-y: auto;
			}
		}
	`

	// /** 本地化控制器 */
	// private _localize = new LocalizeController(this)
	// private readonly hasSlotController = new HasSlotController(
	// 	this,
	// 	'conversations-header',
	// 	'conversations-footer',
	// )

	/** 当前选中的会话 ID */
	@property({ reflect: true })
	currentConversationId = ''

	/** 会话列表数据源 */
	@property({ attribute: false, type: Array, reflect: true })
	conversations: Conversation[] = []

	private _handleClickConversation(
		event: GlobalEventHandlersEventMap['click-conversation'],
	) {
		this.currentConversationId = event.detail.item.key
		this.requestUpdate()
	}
	private _handleDeleteConversation(
		event: CustomEvent<{ item: Conversation }>,
	) {
		const index = this.conversations.findIndex((c) => c === event.detail.item)
		this.conversations.splice(index, 1)
		this.conversations = [...this.conversations]
		this.requestUpdate()
	}

	render() {
		return html`
			<div class="aside">
				<header>
					<slot name="conversations-header"></slot>
				</header>
				<main role="list" aria-label="ariaConversationsList">
					${this.conversations.map(
						(item) => html`
						<hyosan-chat-conversations-item
							role="listitem"
							.item=${item} ?actived=${this.currentConversationId === item.key}
							aria-selected=${this.currentConversationId === item.key ? 'true' : 'false'}
							@click-conversation=${this._handleClickConversation}
							@delete-conversation=${this._handleDeleteConversation}
						>
						</hyosan-chat-conversations-item>
						`,
					)}
				</main>
				<footer>
					<slot name="conversations-footer"></slot>
				</footer>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-conversations': HyosanChatConversations
	}
}
