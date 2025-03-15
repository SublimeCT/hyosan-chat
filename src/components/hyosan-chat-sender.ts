import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@shoelace-style/localize'
import { css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

import '@shoelace-style/shoelace/dist/components/textarea/textarea.js'
import '@shoelace-style/shoelace/dist/components/switch/switch.js'

/** 发送 组件 */
@customElement('hyosan-chat-sender')
export class HyosanChatSender extends ShoelaceElement {
  static styles? = css`
    :host {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      width: var(--hy-main-container-width);
      min-width: var(--hy-main-container-min-width);
      max-width: var(--hy-main-container-max-width);
      margin-bottom: var(--hy-main-container-margin-bottom);
      background-color: var(--sl-color-neutral-100);
      padding: var(--hy-container-padding);
      border-radius: var(--hy-container-padding);
    }
    .container > main {
      width: 100%;
      sl-textarea::part(base) {
        border: none;
        box-shadow: none;
        background-color: transparent;
      }
      sl-textarea::part(textarea) {
        border: none;
        padding-left: 0.5em;
        padding-right: 0.5em;
      }
    }
    .container > footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    section > main {
      width: 100%;
    }
    section > footer {
      width: 100%;
    }
    .option-buttons {
      display: flex;
      align-items: center;
    }
  `

  /** 本地化控制器 */
  private _localize = new LocalizeController(this)

  /** 是否正在加载中 */
  @property({ reflect: true, type: Boolean })
  loading = false

  /** 是否启用搜索开关 */
  @property({ type: Boolean })
  enableSearch = false

  /** 是否启用搜索功能 */
  @property({ type: Boolean, reflect: true })
  openSearch = false

  @state()
  content = ''

  private _handleInput(event: KeyboardEvent) {
    const textarea = event.target as HTMLTextAreaElement
    this.content = textarea.value || ''
  }
  private _handleTextareaKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      this._handleEmitSendMessage()
      this.content = '' // 清空内容
      this.requestUpdate()
    }
  }
  private _handleEmitSendMessage() {
    this.emit('send-message', { detail: { content: this.content } })
    this.content = '' // 清空内容
    this.requestUpdate()
  }

  private _handleClickSearch() {
    this.openSearch = !this.openSearch
    this.emit('open-search', { detail: { open: this.openSearch } })
  }

  render() {
    return html`
      <div class="container">
        <main>
          <sl-textarea aria-label=${this._localize.term('ariaSendInput')} placeholder=${this._localize.term('sendTips')} value=${this.content} rows="2" resize="none" @sl-input=${this._handleInput} @keydown=${this._handleTextareaKeyDown}></sl-textarea>
        </main>
        <footer>
          <div class="option-buttons">
            <!-- <sl-switch checked>Checked</sl-switch> -->
            ${
              this.enableSearch
                ? html`
                  <sl-button
                    size="small"
                    variant=${this.openSearch ? 'primary' : 'default'}
                    @click=${this._handleClickSearch}>
                      <hyosan-icon-wrapper slot="prefix">
                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8492" width="1em" height="1em"><path d="M512 56.888889C261.688889 56.888889 56.888889 261.688889 56.888889 512s204.8 455.111111 455.111111 455.111111 455.111111-204.8 455.111111-455.111111-204.8-455.111111-455.111111-455.111111z m398.222222 426.666667h-164.977778c0-73.955556-11.377778-136.533333-28.444444-199.111112 28.444444-17.066667 56.888889-34.133333 79.644444-56.888888 68.266667 73.955556 108.088889 159.288889 113.777778 256z m-216.177778 0H540.444444V335.644444c45.511111 0 91.022222-11.377778 130.844445-28.444444 11.377778 56.888889 22.755556 113.777778 22.755555 176.355556z m-364.088888 56.888888h153.6v91.022223c-51.2 5.688889-96.711111 11.377778-142.222223 34.133333-5.688889-39.822222-11.377778-85.333333-11.377777-125.155556z m22.755555-227.555555c45.511111 11.377778 85.333333 22.755556 130.844445 22.755555v147.911112H329.955556c0-62.577778 11.377778-119.466667 22.755555-170.666667z m187.733333 227.555555h153.6c0 45.511111-5.688889 85.333333-11.377777 125.155556-45.511111-17.066667-91.022222-28.444444-142.222223-34.133333V540.444444z m221.866667-341.333333c-17.066667 17.066667-39.822222 28.444444-56.888889 39.822222-17.066667-39.822222-34.133333-79.644444-56.888889-108.088889 39.822222 17.066667 79.644444 39.822222 113.777778 68.266667z m-108.088889 62.577778c-39.822222 11.377778-73.955556 22.755556-113.777778 22.755555V113.777778c45.511111 17.066667 85.333333 73.955556 113.777778 147.911111zM483.555556 113.777778v170.666666c-39.822222 0-79.644444-11.377778-113.777778-22.755555 28.444444-73.955556 68.266667-130.844444 113.777778-147.911111zM318.577778 238.933333c-17.066667-11.377778-39.822222-22.755556-56.888889-39.822222 34.133333-28.444444 73.955556-51.2 119.466667-68.266667-22.755556 28.444444-45.511111 68.266667-62.577778 108.088889z m-96.711111-5.688889c22.755556 22.755556 51.2 39.822222 79.644444 56.888889-17.066667 56.888889-28.444444 125.155556-28.444444 199.111111H113.777778c5.688889-102.4 45.511111-187.733333 108.088889-256z m51.2 307.2c0 51.2 5.688889 102.4 17.066666 147.911112-34.133333 17.066667-68.266667 45.511111-96.711111 73.955555-45.511111-62.577778-73.955556-142.222222-79.644444-221.866667h159.288889zM227.555556 796.444444c22.755556-22.755556 45.511111-39.822222 73.955555-56.888888 17.066667 62.577778 45.511111 113.777778 73.955556 153.6-51.2-22.755556-102.4-56.888889-147.911111-96.711112z m125.155555-85.333333c45.511111-17.066667 85.333333-28.444444 130.844445-28.444444v227.555555c-51.2-17.066667-102.4-96.711111-130.844445-199.111111zM540.444444 910.222222v-227.555555c45.511111 5.688889 91.022222 11.377778 130.844445 28.444444-28.444444 102.4-79.644444 182.044444-130.844445 199.111111z m102.4-17.066666c28.444444-39.822222 56.888889-91.022222 73.955556-153.6 28.444444 17.066667 51.2 34.133333 73.955556 56.888888-39.822222 39.822222-91.022222 73.955556-147.911112 96.711112z m187.733334-136.533334c-28.444444-28.444444-62.577778-51.2-96.711111-73.955555 11.377778-45.511111 17.066667-96.711111 17.066666-147.911111H910.222222c-5.688889 85.333333-34.133333 164.977778-79.644444 221.866666z" fill="currentColor" p-id="8493"></path></svg>
                      </hyosan-icon-wrapper>
                      ${this._localize.term('enableSearch')}
                  </sl-button>
                `
                : undefined
            }
          </div>
          <div class="action-buttons">
            <sl-button variant="primary" ?loading=${this.loading} ?disabled=${!this.content || this.loading} circle @click=${this._handleEmitSendMessage}>
              <hyosan-icon-wrapper>
                <svg t="1741252222107" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5069" width="1em" height="1em" fill="currentColor"><path d="M133.8 579l-44.4-44.4c-18.8-18.8-18.8-49.2 0-67.8L478 78c18.8-18.8 49.2-18.8 67.8 0l388.6 388.6c18.8 18.8 18.8 49.2 0 67.8L890 578.8c-19 19-50 18.6-68.6-0.8L592 337.2V912c0 26.6-21.4 48-48 48h-64c-26.6 0-48-21.4-48-48V337.2L202.4 578.2c-18.6 19.6-49.6 20-68.6 0.8z" p-id="5070"></path></svg>
              </hyosan-icon-wrapper>
            </sl-button>
          </div>
        </footer>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-sender': HyosanChatSender
  }
  interface GlobalEventHandlersEventMap {
    'send-message': CustomEvent<{ content: string }>
    /** 用户点击 搜索开关 按钮时触发 */
    'open-search': CustomEvent<{ open: boolean }>
  }
}
