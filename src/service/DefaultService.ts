import {
	EventStreamContentType,
	fetchEventSource,
} from '@microsoft/fetch-event-source'
// import OpenAI from 'openai'
import type {
	ChatCompletionChunk,
	ChatCompletionCreateParamsStreaming,
} from 'openai/resources/index.mjs'
import {
	BaseService,
	type BaseServiceMessageItem,
	type BaseServiceMessageNode,
	type BaseServiceMessages,
} from './BaseService'

// const openai = new OpenAI()
// openai.chat.completions.create({ messages: [], model: 'gpt-4o-mini' })

export class RetriableError<T> extends Error {
	constructor(
		message: string,
		public detail: T,
	) {
		super(message)
	}
}
export class FatalError<T = any> extends Error {
	constructor(
		message: string,
		public detail: T,
	) {
		super(message)
	}
}

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

	async retry(
		conversationId: string,
		messages: BaseServiceMessages,
		retryMessage: BaseServiceMessageItem,
	) {
		if (!this.apiKey) throw new Error('Missing API Key')
		this.conversationId = conversationId

		const retryMessageIndex = messages.findIndex((m) => m === retryMessage)
		if (retryMessageIndex === -1) throw new Error('Invalid Retry message')
		messages.splice(retryMessageIndex, 1)

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

		/** 初始状态下的助手消息 */
		const assistantMessage = this.getEmptyAssistantMessage()

		this.messages.push(assistantMessage) // 加入助手消息

		const body: ChatCompletionCreateParamsStreaming = {
			model: this.model,
			temperature: this.chat.temperature,
			messages: this.handleRequestMessages(this.messages.slice(0, -1)),
			stream: true,
		}

		return new Promise<void>((resolve, reject) => {
			fetchEventSource(`${this.url}/chat/completions`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					...this.headers,
				},
				body: JSON.stringify(body),
				signal: abortController.signal,
				onopen: async (response) => {
					if (response.ok) {
						if (response.type === 'cors') {
							return
						} else if (
							response.headers.get('content-type') === EventStreamContentType
						) {
							this.emitter.emit('send-open')
							return // everything's good
						} else {
							console.warn('Unkonwn response type: ', response)
							this.emitter.emit('send-open')
							return
						}
					} else if (
						response.status >= 400 &&
						response.status < 500 &&
						response.status !== 429
					) {
						console.error('[DefaultService] Fatal open error: ', response)
						// client-side errors are usually non-retriable:
						throw new FatalError(
							`Fatel Open Error: ${response.status}`,
							response,
						)
					} else {
						console.error('[DefaultService] Retriable open error: ', response)
						throw new RetriableError(
							`Retriable Open Error: ${response.status}`,
							response,
						)
					}
				},
				onmessage: (event) => {
					// if the server emits an error message, throw an exception
					// so it gets handled by the onerror callback below:
					if (event.event === 'FatalError')
						throw new FatalError(`Fatal Error: ${event.data.toString()}`, event)

					try {
						if (event.data === '[DONE]') {
							assistantMessage.$loading = false
							this.emitter.emit('send-done')
							return resolve()
						}
						if (event.data === '') return
						const data = this.getChatCompletionByResponse(event.data)
						const content = this.getContentByResponse(data)
						// 加入思考内容
						if (content.reasoningContent)
							assistantMessage.$reasoningContent += content.reasoningContent
						// 加入消息内容
						if (content.content) assistantMessage.content += content.content
						// console.warn(JSON.stringify(messages))
						this.setChatCompletionParams(data.id, data.created)
						// 只有返回消息内容时才触发事件
						if (content.content || content.reasoningContent) {
							this.emitter.emit('data', data)
						}
					} catch (e) {
						console.error('Data processing error:', e)
					}
				},
				onclose: () => {
					console.log('close')
					this.emitter.emit('close')
					resolve()
					// reject(new Error('Connection closed unexpectedly'));
				},
				onerror: (error) => {
					console.log('[DefaultService] catch error: ', error, error.message)
					assistantMessage.$error = error
					console.log(assistantMessage)
					if (error instanceof FatalError) {
						this.emitter.emit('error', error)
						reject(error)
						throw error
					} else if (error && error.message === 'Failed to fetch') {
						this.emitter.emit('error', error)
						reject(error)
						throw error
					} else if (error instanceof RetriableError) {
						this.emitter.emit('error', error)
						reject(error)
						throw error
					} else if (error === 'AbortError') {
						this.emitter.emit('abort')
						resolve()
					} else {
						this.emitter.emit('error', error)
						reject(error)
					}
				},
			}).finally(() => {
				console.log('[DefaultService] done')
				this.emitter.emit('done')
				// this.abortController = null
				resolve()
			})
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
	 * @returns 本次返回的文本内容和推理内容
	 */
	getContentByResponse(
		responseText: string | ChatCompletionChunk,
	): BaseServiceMessageNode {
		const data =
			typeof responseText === 'string'
				? this.getChatCompletionByResponse(responseText)
				: responseText
		/** 消息内容 */
		const content = data.choices[0]?.delta?.content || ''
		const deltaObject = data.choices[0]?.delta as any
		/** 推理内容 */
		const reasoningContent = deltaObject.reasoning_content || '' // 暂不考虑 openai 的推理模型格式
		return { content, reasoningContent }
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
