import ShoelaceElement from '@/internal/shoelace-element'
// import type { ChatSettings } from '@/types/ChatSettings'
// import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

/** 主体头部 组件 */
@customElement('hyosan-chat-main-header')
export class HyosanChatMainHeader extends ShoelaceElement {
	static styles? = css`
  `

	// /** 本地化控制器 */
	// private _localize = new LocalizeController(this)

	// private _handleSettingsSave(event: CustomEvent<ChatSettings>) {
	// 	console.log(event.detail)
	// }
	render() {
		return html`
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat-main-header': HyosanChatMainHeader
	}
}
