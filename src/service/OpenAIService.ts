import { BaseService } from './BaseService'

/** `OpenAI` 或与之兼容的服务(例如 `deepseek`) */
export class OpenAIService extends BaseService {
	key = 'OpenAI'
	keyHelpUrl = 'https://platform.openai.com/docs/api-reference/chat'
	url = 'https://api.openai.com/v1'
	model = 'gpt-4o-mini'

	/** 系统预设提示 */
	system_prompt?: string

	async fetchChatCompletion() {}
}
