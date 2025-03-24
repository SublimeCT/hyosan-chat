import ShoelaceElement from '@/internal/shoelace-element'
// import type { ChatSettings } from '@/types/ChatSettings'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

/** 主体头部 组件 */
@customElement('hyosan-chat-main-header')
export class HyosanChatMainHeader extends ShoelaceElement {
  static styles? = css`
		:host {
			width: 100%;
			--padding: calc(var(--hy-container-padding) * 2);
		}
		header {
			/* padding: var(--padding); */
			background-color: var(--sl-panel-background-color);
			box-shadow: var(--sl-shadow-x-large);
			/* width: calc(100% - var(--padding) * 2); */
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.header-button {
			padding: var(--padding);
			cursor: pointer;
		}
		.header-button:hover {
			color: var(--sl-color-primary-500);
		}
  `

  // /** 本地化控制器 */
  // private _localize = new LocalizeController(this)

  // private _handleSettingsSave(event: CustomEvent<ChatSettings>) {
  // 	console.log(event.detail)
  // }
  render() {
    return html`
			<header>
				<div class="leadings">
					<div class="header-button" @click=${() => this.emit('hyosan-chat-click-settings-button')}>
						<hyosan-icon-wrapper>
							<svg t="1741615871890" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2650" width="1em" height="1em" fill="currentColor"><path d="M256 232V152c0-17.674 14.326-32 32-32h704c17.674 0 32 14.326 32 32v80c0 17.674-14.326 32-32 32H288c-17.674 0-32-14.326-32-32z m32 352h704c17.674 0 32-14.326 32-32v-80c0-17.674-14.326-32-32-32H288c-17.674 0-32 14.326-32 32v80c0 17.674 14.326 32 32 32z m0 320h704c17.674 0 32-14.326 32-32v-80c0-17.674-14.326-32-32-32H288c-17.674 0-32 14.326-32 32v80c0 17.674 14.326 32 32 32zM32 288h128c17.674 0 32-14.326 32-32V128c0-17.674-14.326-32-32-32H32C14.326 96 0 110.326 0 128v128c0 17.674 14.326 32 32 32z m0 320h128c17.674 0 32-14.326 32-32v-128c0-17.674-14.326-32-32-32H32c-17.674 0-32 14.326-32 32v128c0 17.674 14.326 32 32 32z m0 320h128c17.674 0 32-14.326 32-32v-128c0-17.674-14.326-32-32-32H32c-17.674 0-32 14.326-32 32v128c0 17.674 14.326 32 32 32z" p-id="2651"></path></svg>
						</hyosan-icon-wrapper>
					</div>
				</div>
				<div class="actions">
					<hyosan-chat-settings-button>
						<div slot="base" class="header-button">
							<hyosan-icon-wrapper>
								<svg t="1741527511146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18234" width="1em" height="1em" fill="currentColor"><path d="M1008.512 414.848l-99.264-25.728c-7.616-24.704-17.408-48.576-29.312-71.168l51.904-88.256c4.8-8.128 3.456-18.432-3.136-25.088l-109.184-109.248c-6.72-6.656-17.024-7.936-25.152-3.2l-88.32 51.904c-22.528-11.84-46.336-21.632-71.104-29.312l-25.664-99.328c-2.368-9.088-10.624-15.424-20.032-15.424l-154.432 0c-9.344 0-17.6 6.336-19.968 15.424l-25.792 99.328c-24.704 7.68-48.512 17.472-70.976 29.376l-88.32-52.032c-8.192-4.736-18.56-3.52-25.088 3.2l-109.312 109.248c-6.656 6.656-8 16.96-3.136 25.024l51.968 88.384c-11.904 22.464-21.632 46.272-29.376 70.976l-99.328 25.792c-9.152 2.368-15.488 10.624-15.488 20.032l0 154.432c0 9.408 6.336 17.664 15.488 19.968l99.264 25.728c7.68 24.832 17.536 48.64 29.312 71.04l-52.032 88.32c-4.736 8.128-3.456 18.432 3.2 25.088l109.184 109.248c6.72 6.656 17.024 7.936 25.152 3.136l88.32-51.968c22.528 11.84 46.336 21.76 71.04 29.312l25.664 99.328c2.496 9.216 10.752 15.616 20.16 15.616l154.432 0c9.408 0 17.6-6.336 19.968-15.488l25.792-99.328c24.768-7.68 48.576-17.472 71.104-29.312l88.192 51.968c8.192 4.672 18.432 3.456 25.088-3.2l109.248-109.12c6.72-6.656 8-16.96 3.2-25.088l-51.968-88.32c11.968-22.528 21.76-46.336 29.376-71.04l99.264-25.728c9.216-2.432 15.552-10.688 15.552-20.096l0-154.432c0-9.344-6.336-17.664-15.488-19.968l0 0zM512.064 738.624c-124.992 0-226.624-101.632-226.624-226.624s101.632-226.624 226.624-226.624c124.928 0 226.496 101.632 226.496 226.624s-101.632 226.624-226.496 226.624l0 0z" fill="currentColor" p-id="18235"></path></svg>
							</hyosan-icon-wrapper>
						</div>
					</hyosan-chat-settings-button>
				</div>
			</header>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-main-header': HyosanChatMainHeader
  }
  interface GlobalEventHandlersEventMap {
    /** 点击 main 区域顶部会话列表按钮 */
    'hyosan-chat-click-conversations-button': CustomEvent<void>
    /** 点击 main 区域顶部设置按钮 */
    'hyosan-chat-click-settings-button': CustomEvent<void>
  }
}
