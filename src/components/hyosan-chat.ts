import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('hyosan-chat')
export class HyosanChat extends LitElement {
  render() {
    return html`
      <h2>HyosanChat</h2>
      <div>Hello Lit!</div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat': HyosanChat
  }
}
