import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("hyosan-chat")
export class HyosanChat extends LitElement {
	@property({ reflect: true })
	message = "Hello Lit";

	render() {
		return html`
      <h2>HyosanChat</h2>
      <div>Hello Lit!</div>
    `;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"hyosan-chat": HyosanChat;
	}
}
