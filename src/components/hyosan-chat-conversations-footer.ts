import ShoelaceElement from '@/internal/shoelace-element'
// import type { ChatSettings } from '@/types/ChatSettings'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

/** 主体头部 组件 */
@customElement('hyosan-chat-conversations-footer')
export class HyosanChatConversationsFooter extends ShoelaceElement {
  static styles? = css`
    :host {
      width: calc(100% - --hy-container-padding);
      height: 48px;
      display: flex;
      align-items: center;
      padding: 0 var(--hy-container-padding);
    }
  `

  // /** 本地化控制器 */
  // private _localize = new LocalizeController(this)

  // private _handleSettingsSave(event: CustomEvent<ChatSettings>) {
  // 	console.log(event.detail)
  // }
  render() {
    return html`
      <div>
        <hyosan-chat-settings-button></hyosan-chat-settings-button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-conversations-footer': HyosanChatConversationsFooter
  }
}
