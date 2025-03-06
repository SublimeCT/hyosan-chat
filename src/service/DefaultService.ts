import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs'
import { BaseService, type BaseServiceMessages } from './BaseService'
import { ServiceHandler } from './ServiceHandler'

/** `OpenAI` 或与之兼容的服务(例如 `DeepSeek`) */
export class DefaultService extends BaseService<DefaultServiceChat> {
	/** `OpenAI` 的默认 {@link url} */
	static defaultURL = 'https://api.openai.com/v1'
	/** `OpenAI` 的默认 {@link model} */
	static defaultModel = 'gpt-4o-mini'
	/** `OpenAI` 的默认预设提示词 {@link systemPrompt} */
	static defaultSystemPrompt = 'You are a helpful assistant'

	handler: ServiceHandler = new ServiceHandler()
	key = 'Default'
	keyHelpUrl = 'https://platform.openai.com/docs/api-reference/chat'
	url = DefaultService.defaultURL
	messages = []
	systemPrompt = DefaultService.defaultSystemPrompt

	chat: DefaultServiceChat = { model: DefaultService.defaultModel }

	async fetchChatCompletion(messages: BaseServiceMessages = this.messages) {
		console.log(messages)
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
	Pick<ChatCompletionCreateParamsStreaming, 'model' | 'temperature'>
>
