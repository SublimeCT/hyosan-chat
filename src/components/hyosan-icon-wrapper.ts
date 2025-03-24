import ShoelaceElement from '@/internal/shoelace-element'
import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * sl-button 按钮中的 svg 标签 wrapper 组件
 * @description 需要为 `svg` 添加 `width="1em" height="1em" fill="currentColor"` 属性
 * @example
 * ```html
 * <hyosan-icon-wrapper>
 *   <svg width="1em" height="1em" fill="currentColor">...</svg>
 * </hyosan-icon-wrapper>
 * ```
 */
@customElement('hyosan-icon-wrapper')
export class HyosanIconWrapper extends ShoelaceElement {
  static styles? = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `

  @property({ reflect: true })
  fontSize = '1.5em'

  render() {
    return html`
      <div class="wrapper" style=${this.fontSize ? `font-size: ${this.fontSize};` : ''}>
        <slot></slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-icon-wrapper': HyosanIconWrapper
  }
}
