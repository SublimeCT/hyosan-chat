import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs'
import type { ServiceHandler } from './ServiceHandler'

/**
 * 对话服务 基类
 * @template C 模型配置参数
 */
export abstract class BaseService<C extends object = object> {
	/** 当前服务的唯一标识 */
	abstract readonly key: string
	/** 服务的帮助文档地址 */
	abstract readonly keyHelpUrl: string
	/** 服务的请求地址 */
	abstract url: string
	/** 使用的模型名称或模型配置 */
	abstract chat: C
	/** 服务请求处理器 */
	abstract handler: ServiceHandler
	/**
	 * 当前服务的消息列表
	 * @see https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages
	 */
	abstract messages: BaseServiceMessages
	/** 系统预设提示词 */
	abstract systemPrompt?: string

	/**
	 * 发起聊天请求
	 * @param messages 聊天消息列表, 参考 https://platform.openai.com/docs/api-reference/chat/create
	 * @param handler 聊天请求处理器, 用于处理流式请求的回调函数和停止流式请求
	 */
	abstract fetchChatCompletion(messages: BaseServiceMessages): Promise<void>
}

/** 会话消息列表 */
export type BaseServiceMessages =
	ChatCompletionCreateParamsStreaming['messages']
