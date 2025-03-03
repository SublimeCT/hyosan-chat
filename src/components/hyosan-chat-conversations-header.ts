import ShoelaceElement from '@/internal/shoelace-element'
// import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** 会话列表头部 组件 */
@customElement('hyosan-chat-conversations-header')
export class HyosanChatConversationsHeader extends ShoelaceElement {
	static styles? = css`
		h2 {
			padding: 0 1rem;
			display: flex;
			align-items: center;
			justify-content: center;
			svg {
				margin-right: 0.5rem;
			}
		}
	`

	// /** 本地化控制器 */
	// private _localize = new LocalizeController(this)

	@property()
	title = 'Hyosan Chat'
	render() {
		return html`
      <header>
        <h2>
					<svg t="1740983223876" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3643" width="2rem" height="2rem"><path d="M853.333333 85.333333H170.666667C123.52 85.333333 85.76 123.52 85.76 170.666667L85.333333 938.666667l170.666667-170.666667h597.333333c47.146667 0 85.333333-38.186667 85.333334-85.333333V170.666667c0-47.146667-38.186667-85.333333-85.333334-85.333334zM256 384h512v85.333333H256v-85.333333z m341.333333 213.333333H256v-85.333333h341.333333v85.333333z m170.666667-256H256v-85.333333h512v85.333333z" p-id="3644"></path></svg>
					<span>
						${this.title}
					</span>
				</h2>
      </header>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-conversations-header': HyosanChatConversationsHeader
	}
}
