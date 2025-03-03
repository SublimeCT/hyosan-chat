import ShoelaceElement from '@/internal/shoelace-element'
import { HasSlotController } from '@/internal/slot'
import type { Conversation } from '@/types/conversations'
// import { LocalizeController } from '@shoelace-style/localize'
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
	private readonly hasSlotController = new HasSlotController(
		this,
		'conversations-header',
		'conversations-footer',
	)

	/** 当前选中的值 */
	@property({ reflect: true })
	activeKey = ''

	/** 会话列表数据源 */
	@property({ attribute: false, type: Array })
	items: Conversation[] = []

	private _handleClickConversation(
		event: GlobalEventHandlersEventMap['click-conversation'],
	) {
		this.activeKey = event.detail.item.key
		this.requestUpdate()
	}

	render() {
		return html`
			<div class="aside">
				<header>
					<slot name="conversations-header"></slot>
				</header>
				<main>
					${this.items.map(
						(item) => html`
						<hyosan-chat-conversations-item
							.item=${item} ?actived=${this.activeKey === item.key}
							@click-conversation=${this._handleClickConversation}
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
