import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs'
import type { ServiceHandler } from './ServiceHandler'

/** 对话服务 基类 */
export abstract class BaseService {
	/** 当前服务的唯一标识 */
	abstract readonly key: string

	/** 服务的帮助文档地址 */
	abstract readonly keyHelpUrl: string

	/** 服务的请求地址 */
	abstract url: string

	/** 使用的模型名称 */
	abstract model: string

	/**
	 * 发起聊天请求
	 * @param messages 聊天消息列表, 参考 https://platform.openai.com/docs/api-reference/chat/create
	 * @param handler 聊天请求处理器, 用于处理流式请求的回调函数和停止流式请求
	 */
	abstract fetchChatCompletion(
		messages: ChatCompletionCreateParamsStreaming['messages'],
		handler: ServiceHandler,
	): Promise<void>
}
