import { fetchEventSource } from '@microsoft/fetch-event-source'

/**
 * 会话补全请求
 * @param message 用户输入的消息
 * @returns 补全后的消息
 */
export async function getChatCompletions(message: string): Promise<string> {
	const url = 'https://api.example.com/completions'
	const headers = {
		'Content-Type': 'application/json',
	}

	return new Promise((resolve, reject) => {
		let response = ''

		fetchEventSource(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({ message }),
			onmessage(msg) {
				response += msg.data
			},
			onerror(err) {
				reject(new Error('Failed to fetch chat completions'))
			},
			onclose() {
				resolve(response)
			},
		})
	})
}
