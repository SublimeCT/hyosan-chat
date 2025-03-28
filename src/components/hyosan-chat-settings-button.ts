import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import '@shoelace-style/shoelace/dist/components/dialog/dialog.js'
import '@shoelace-style/shoelace/dist/components/input/input.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import '@shoelace-style/shoelace/dist/components/select/select.js'
import '@shoelace-style/shoelace/dist/components/option/option.js'
import { HasSlotController } from '@/internal/slot'
import { ChatSettings } from '@/types/ChatSettings'
import type { SlSwitch } from '@shoelace-style/shoelace'
import type SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js'
import type SlInput from '@shoelace-style/shoelace/dist/components/input/input.js'

/** 发送 组件 */
@customElement('hyosan-chat-settings-button')
export class HyosanChatSettingsButton extends ShoelaceElement {
  static styles? = css`
    .settings-dialog {
      sl-input {
        margin-bottom: 16px;
      }
    }
  `

  /** 本地化控制器 */
  private _localize = new LocalizeController(this)

  private readonly hasSlotController = new HasSlotController(this, 'base')

  private settings = ChatSettings.fromLocalStorage()

  /**
   * 禁用的字段
   * @since 0.4.1
   */
  @property({ type: Array })
  disabledFields: Array<string> = []

  private _handleClickSettings() {
    const dialog = this.shadowRoot?.querySelector(
      '.settings-dialog',
    ) as SlDialog
    const openButton = dialog.nextElementSibling
    const closeButton = dialog.querySelector('sl-button[slot="footer"]')

    openButton?.addEventListener('click', () => dialog?.show())
    closeButton?.addEventListener('click', () => dialog?.hide())
    dialog.show()
  }

  private _onFieldChange(
    event: CustomEvent<object>,
    field: keyof ChatSettings,
  ) {
    const target = event.target as SlInput
    if (!target) return
    Object.assign(this.settings, { [field]: target.value })
  }

  private _save() {
    ChatSettings.saveLocalStorage(this.settings)
    this._close()
    this.requestUpdate()
    this.emit('hyosan-chat-settings-save', {
      detail: { settings: this.settings },
    })
  }

  private _reset() {
    this.settings = new ChatSettings()
    ChatSettings.saveLocalStorage(this.settings)
    this.requestUpdate()
    this.emit('hyosan-chat-settings-reset', {
      detail: { settings: this.settings },
    })
  }

  private _close() {
    const dialog = this.shadowRoot?.querySelector(
      '.settings-dialog',
    ) as SlDialog
    dialog.hide()
  }
  private _handleChangeLocalize(event: CustomEvent<object>) {
    // this._onFieldChange(event, 'localize')
    const target = event.composedPath()[0] as SlSwitch
    this.settings.localize = target?.checked ? 'true' : 'false'
  }

  render() {
    const hasBaseSlot = this.hasSlotController.test('base')
    const baseButton = hasBaseSlot
      ? html`<slot name="base" @click=${this._handleClickSettings}></slot>`
      : html`
				<sl-button variant="primary" size="small" @click=${this._handleClickSettings}>
					<hyosan-icon-wrapper>
						<svg t="1741527511146" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18234" width="1em" height="1em" fill="currentColor"><path d="M1008.512 414.848l-99.264-25.728c-7.616-24.704-17.408-48.576-29.312-71.168l51.904-88.256c4.8-8.128 3.456-18.432-3.136-25.088l-109.184-109.248c-6.72-6.656-17.024-7.936-25.152-3.2l-88.32 51.904c-22.528-11.84-46.336-21.632-71.104-29.312l-25.664-99.328c-2.368-9.088-10.624-15.424-20.032-15.424l-154.432 0c-9.344 0-17.6 6.336-19.968 15.424l-25.792 99.328c-24.704 7.68-48.512 17.472-70.976 29.376l-88.32-52.032c-8.192-4.736-18.56-3.52-25.088 3.2l-109.312 109.248c-6.656 6.656-8 16.96-3.136 25.024l51.968 88.384c-11.904 22.464-21.632 46.272-29.376 70.976l-99.328 25.792c-9.152 2.368-15.488 10.624-15.488 20.032l0 154.432c0 9.408 6.336 17.664 15.488 19.968l99.264 25.728c7.68 24.832 17.536 48.64 29.312 71.04l-52.032 88.32c-4.736 8.128-3.456 18.432 3.2 25.088l109.184 109.248c6.72 6.656 17.024 7.936 25.152 3.136l88.32-51.968c22.528 11.84 46.336 21.76 71.04 29.312l25.664 99.328c2.496 9.216 10.752 15.616 20.16 15.616l154.432 0c9.408 0 17.6-6.336 19.968-15.488l25.792-99.328c24.768-7.68 48.576-17.472 71.104-29.312l88.192 51.968c8.192 4.672 18.432 3.456 25.088-3.2l109.248-109.12c6.72-6.656 8-16.96 3.2-25.088l-51.968-88.32c11.968-22.528 21.76-46.336 29.376-71.04l99.264-25.728c9.216-2.432 15.552-10.688 15.552-20.096l0-154.432c0-9.344-6.336-17.664-15.488-19.968l0 0zM512.064 738.624c-124.992 0-226.624-101.632-226.624-226.624s101.632-226.624 226.624-226.624c124.928 0 226.496 101.632 226.496 226.624s-101.632 226.624-226.496 226.624l0 0z" fill="currentColor" p-id="18235"></path></svg>
					</hyosan-icon-wrapper>
				</sl-button>
			`
    return html`
			${baseButton}
      <sl-dialog label=${this._localize.term('settings')} class="settings-dialog">
        ${
          this.disabledFields.includes('baseUrl')
            ? undefined
            : html`<sl-input label=${this._localize.term('baseUrl')} value=${this.settings.baseUrl} clearable @sl-change=${(event: CustomEvent<object>) => this._onFieldChange(event, 'baseUrl')}></sl-input>`
        }
        ${
          this.disabledFields.includes('modelName')
            ? undefined
            : html`<sl-input label=${this._localize.term('modelName')} value=${this.settings.modelName} clearable @sl-change=${(event: CustomEvent<object>) => this._onFieldChange(event, 'modelName')}></sl-input>`
        }
        ${
          this.disabledFields.includes('apiKey')
            ? undefined
            : html`<sl-input label=${this._localize.term('apiKey')} value=${this.settings.apiKey} clearable @sl-change=${(event: CustomEvent<object>) => this._onFieldChange(event, 'apiKey')}></sl-input>`
        }
        ${
          this.disabledFields.includes('systemPrompts')
            ? undefined
            : html`<sl-textarea label=${this._localize.term('systemPrompts')} value=${this.settings.systemPrompts} clearable @sl-change=${(event: CustomEvent<object>) => this._onFieldChange(event, 'systemPrompts')}></sl-textarea>`
        }
        ${
          this.disabledFields.includes('localize')
            ? undefined
            : html`<sl-switch style="margin-top: 16px;" label=${this._localize.term('localize')} help-text=${this._localize.term('localizeTips')} ?checked=${this.settings.localize === 'true'} clearable @sl-change=${(event: CustomEvent<object>) => this._handleChangeLocalize(event)}>${this._localize.term('localize')}</sl-switch>`
        }
        <slot name="settings-main"></slot>
        <div slot="footer">
          <sl-button variant="primary" @click=${this._save}>${this._localize.term('save')}</sl-button>
          <sl-button variant="warning" @click=${this._reset}>${this._localize.term('reset')}</sl-button>
          <sl-button @click=${this._close}>${this._localize.term('close')}</sl-button>
        </div>
      </sl-dialog>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-settings-button': HyosanChatSettingsButton
  }
  interface GlobalEventHandlersEventMap {
    /** 用户在设置弹窗中点击了保存 */
    'hyosan-chat-settings-save': CustomEvent<{ settings: ChatSettings }>
    /**
     * 用户在设置弹窗中点击了重置
     * @since 0.4.1
     */
    'hyosan-chat-settings-reset': CustomEvent<{ settings: ChatSettings }>
  }
}
