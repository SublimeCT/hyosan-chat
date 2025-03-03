import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { withResetSheets } from './sheets'
import '@shoelace-style/shoelace/dist/components/card/card.js'
import type { Conversation } from './types/conversations'

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
					height: 75vh;
					display: flex;
					justify-content: center;
					align-items: center;
					overflow: auto;
				}
			}
		}
	`)

	private items: Array<Conversation> = [
		{ key: '001', label: '会话1' },
		{ key: '002', label: '会话2' },
		{ key: '003', label: '会话3' },
		{ key: '004', label: '会话4' },
		{ key: '005', label: '会话5' },
		{ key: '006', label: '会话6' },
		{ key: '007', label: '会话7' },
		{ key: '008', label: '会话8' },
		{ key: '009', label: '会话9' },
		{ key: '010', label: '会话10' },
		{ key: '011', label: '会话11' },
		{ key: '012', label: '会话12' },
		{ key: '013', label: '会话13' },
		{ key: '014', label: '会话14' },
		{ key: '015', label: '会话14' },
		{ key: '016', label: '会话16' },
		{ key: '017', label: '会话17' },
		{ key: '018', label: '会话18' },
	]

	render() {
		return html`
			<sl-card class="demo-container">
				<header slot="header">
					<h1>HyosanChatDemo</h1>
				</header>
				<main>
					<hyosan-chat .items=${this.items}></hyosan-chat>
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
