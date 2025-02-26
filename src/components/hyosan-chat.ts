import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'

@customElement('hyosan-chat')
export class HyosanChat extends LitElement {
	static styles? = css`
		:host {
			width: 100%;
			height: 100%;
		}	
	`

	@property({ reflect: true })
	message = 'Hello Lit'

	render() {
		return html`
      <h2>HyosanChat Component</h2>
      <div>Hello Lit!</div>
			<sl-button variant="primary">Hello Shoelace</sl-button>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat': HyosanChat
	}
}
