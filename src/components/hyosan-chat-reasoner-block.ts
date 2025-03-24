import ShoelaceElement from '@/internal/shoelace-element'
// import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/** 消息气泡中的思考内容块 组件 */
@customElement('hyosan-chat-reasoner-block')
export class HyosanChatReasonerBlock extends ShoelaceElement {
  static styles? = css`
    :host {
      width: 100%;
    }
    .reasoner-block[data-has-content] {
      width: 100%;
      padding: var(--hy-container-padding);
      padding-left: calc(var(--hy-container-padding) * 2);
      background-color: var(--sl-color-neutral-200);
      border-radius: var(--hy-container-radius);
      border-left: calc(var(--hy-container-padding) / 2) solid var(--sl-color-primary-500);
      color: var(--sl-color-primary-500);
      width: calc(100% - var(--hy-container-padding) * 3.5);
      margin-bottom: var(--hy-container-padding);
    }
  `

  // /** 本地化控制器 */
  // private _localize = new LocalizeController(this)

  @property({ type: Boolean, attribute: 'has-content' })
  hasContent = false
  render() {
    return html`
      <div class="reasoner-block" ?data-has-content="${this.hasContent}">
        <slot name="content"></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-reasoner-block': HyosanChatReasonerBlock
  }
}
