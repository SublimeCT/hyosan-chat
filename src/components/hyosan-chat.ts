import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '@shoelace-style/shoelace/dist/components/button/button.js'
import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@/utils/localize'

@customElement('hyosan-chat')
export class HyosanChat extends ShoelaceElement {
	static styles? = css`
		:host {
			width: 100%;
			height: 100%;
		}	
	`

	private _locailze = new LocalizeController(this)

	@property({ reflect: true })
	message = ''

	render() {
		return html`
			<h2>${this.message}</h2>
			<sl-button variant="primary">Hello Shoelace</sl-button>
			<p>${this._locailze.term('test')}</p>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat': HyosanChat
	}
}
