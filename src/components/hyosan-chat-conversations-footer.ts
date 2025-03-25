import ShoelaceElement from '@/internal/shoelace-element'
import { HasSlotController } from '@/internal/slot'
// import type { ChatSettings } from '@/types/ChatSettings'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

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

  /**
   * 禁用的字段
   * @since 0.4.1
   */
  @property({ type: Array, attribute: false })
  disabledFields: Array<string> = []

  // /** 本地化控制器 */
  // private _localize = new LocalizeController(this)

  // private _handleSettingsSave(event: CustomEvent<ChatSettings>) {
  // 	console.log(event.detail)
  // }

  private readonly hasSlotController = new HasSlotController(
    this,
    'settings-main',
  )
  render() {
    const hasSettingsMainSlot = this.hasSlotController.test('settings-main')
    /** settings-main slot */
    const settingsMainSlot = hasSettingsMainSlot
      ? html`<div slot="settings-main"><slot name="settings-main"></slot></div>`
      : ''
    return html`
      <div>
        <hyosan-chat-settings-button .disabledFields=${this.disabledFields}>
          ${settingsMainSlot}
        </hyosan-chat-settings-button>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-conversations-footer': HyosanChatConversationsFooter
  }
}
