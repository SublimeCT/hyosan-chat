import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { withResetSheets } from './sheets'
import '@shoelace-style/shoelace/dist/components/card/card.js'

export const tagName = 'hyosan-chat-demo'

@customElement(tagName)
export class HyosanChatDemo extends LitElement {
	static styles = withResetSheets(css`
		:host {
			width: 100vw;
			height: 100vh;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: var(--background-color);
			transition: background-color 0.3s;
			overflow: hidden;

			@media (prefers-color-scheme: dark) {
				--background-color: #121212;
			}

			@media (prefers-color-scheme: light) {
				--background-color: #ffffff;
			}

			.demo-container {
				width: 80%;
				max-width: 1200px;
				min-width: 530px;
				height: calc(100% - 6rem);
				background-color: var(--container-background-color);
				transition: background-color 0.3s;
				overflow: auto;

				header {
					margin-bottom: 20px;

					h1 {
						font-size: 2em;
						color: var(--text-color);
						transition: color 0.3s;
					}
				}

				main {
					flex: 1;
					display: flex;
					justify-content: center;
					align-items: center;
					overflow: auto;
				}
			}
		}
	`)

	render() {
		return html`
			<sl-card class="demo-container">
				<header slot="header">
					<h1>HyosanChatDemo</h1>
				</header>
				<main>
					<hyosan-chat></hyosan-chat>
				</main>
			</sl-card>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[tagName]: HyosanChatDemo
	}
}
