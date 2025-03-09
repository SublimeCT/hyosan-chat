import { fetchEventSource } from '@microsoft/fetch-event-source'
// import OpenAI from 'openai'
import type {
	ChatCompletionChunk,
	ChatCompletionCreateParamsStreaming,
} from 'openai/resources/index.mjs'
import { BaseService, type BaseServiceMessages } from './BaseService'

// const openai = new OpenAI()
// openai.chat.completions.create({ messages: [], model: 'gpt-4o-mini' })

/** `OpenAI` 或与之兼容的服务(例如 `DeepSeek`) */
export class DefaultService extends BaseService<DefaultServiceChat> {
	/** `OpenAI` 的默认 {@link url} */
	static defaultURL = 'https://api.openai.com/v1'
	/** `OpenAI` 的默认 {@link model} */
	static defaultModel = 'gpt-4o-mini'
	/** `OpenAI` 的默认预设提示词 {@link systemPrompt} */
	static defaultSystemPrompt = 'You are a helpful assistant'

	key = 'Default'
	model = DefaultService.defaultModel
	keyHelpUrl = 'https://platform.openai.com/docs/api-reference/chat'
	url = DefaultService.defaultURL
	// messages = []
	systemPrompt = DefaultService.defaultSystemPrompt

	chat: DefaultServiceChat = {}

	async send(
		content: string,
		conversationId: string,
		messages: BaseServiceMessages,
	) {
		if (!content) return // 忽略空消息
		if (!this.apiKey) throw new Error('Missing API Key')
		this.conversationId = conversationId
		if (messages.length === 0) {
			messages.push({ role: 'system', content: this.systemPrompt })
		}
		messages.push({ role: 'user', content }) // 加入用户消息
		this.setChatCompletionParams()
		this.messages = messages
		this.emitter.emit('before-send')
		return await this.fetchChatCompletion()
	}
	async fetchChatCompletion() {
		if (this.abortController) {
			this.abortController.abort()
		} else {
			this.abortController = new AbortController()
		}
		const abortController = this.abortController

		const body: ChatCompletionCreateParamsStreaming = {
			model: this.model,
			temperature: this.chat.temperature,
			messages: this.messages,
			stream: true,
		}

		return new Promise<void>((resolve, reject) => {
			try {
				fetchEventSource(`${this.url}/chat/completions`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${this.apiKey}`,
						...this.headers,
					},
					body: JSON.stringify(body),
					signal: abortController.signal,
					onopen: async (response) => {
						if (response.status === 200) {
							this.messages.push({ role: 'assistant', content: '', $loading: true }) // 加入助手消息
							this.emitter.emit('send-open')
						} else {
							reject({
								type: 'HTTP_ERROR',
								status: response.status,
								statusText: response.statusText,
							})
						}
					},
					onmessage: (event) => {
						try {
							if (event.data === '[DONE]') {
								this.messages[this.messages.length - 1].$loading = false
								this.emitter.emit('send-done')
								return resolve()
							}
							if (event.data === '') return
							const data = this.getChatCompletionByResponse(event.data)
							const content = this.getContentByResponse(data)
							this.messages[this.messages.length - 1].content += content
							// console.warn(JSON.stringify(messages))
							this.setChatCompletionParams(data.id, data.created)
							this.emitter.emit('data', data)
						} catch (e) {
							console.error('Data processing error:', e)
						}
					},
					onclose: () => {
						this.emitter.emit('close')
						resolve()
						// reject(new Error('Connection closed unexpectedly'));
					},
					onerror: (err) => {
						return reject(err)
					},
				})
			} catch (error: any) {
				if (error.name === 'AbortError') {
					this.emitter.emit('abort')
					resolve()
				} else {
					reject(error)
				}
			} finally {
				this.abortController = null
			}
		})
	}

	/**
	 * 从原始的流式请求中获取流式请求的返回数据
	 * @param responseText 原始流式接口返回值
	 * @returns 本次返回的文本内容
	 */
	getChatCompletionByResponse(responseText: string) {
		if (typeof responseText !== 'string' || responseText === '')
			throw new Error('Invalid response')
		const data = JSON.parse(responseText) as ChatCompletionChunk
		return data
	}

	/**
	 * 从原始的流式请求中获取文本内容
	 * @param responseText 原始流式接口返回值
	 * @returns 本次返回的文本内容
	 */
	getContentByResponse(responseText: string | ChatCompletionChunk) {
		const data =
			typeof responseText === 'string'
				? this.getChatCompletionByResponse(responseText)
				: responseText
		return data.choices[0]?.delta?.content || ''
	}

	static from(service: Partial<DefaultService>) {
		const _service = new DefaultService()
		Object.assign(_service, service)
		return _service
	}
}

/**
 * `OpenAI` 或与之兼容的服务(例如 `DeepSeek`)的 chat 配置
 * @description 根据使用情况 `pick`
 */
export type DefaultServiceChat = Partial<
	Pick<ChatCompletionCreateParamsStreaming, 'temperature'>
>
