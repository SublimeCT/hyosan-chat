import mitt from 'mitt'
import type {
	ChatCompletionCreateParamsStreaming,
	ChatCompletionMessageParam,
} from 'openai/resources/index.mjs'

/**
 * 对话服务 基类
 * @template C 模型配置参数
 */
export abstract class BaseService<
	C extends object = object,
> extends EventTarget {
	/** 当前服务的唯一标识 */
	abstract readonly key: string
	/** 服务的帮助文档地址 */
	abstract readonly keyHelpUrl: string
	/** 服务的请求地址 */
	abstract url: string
	/** 模型名称 */
	abstract model: string

	// /** 当前聊天 ID */
	// id = ''
	/** 当前会话 ID */
	conversationId = ''
	/** 当前 chat completion 唯一 ID */
	chatCompletionId = ''
	/** 当前 chat completion 创建时间 */
	chatCompletionCreated = 0

	/** API KEY */
	apiKey = ''
	/** 请求头 */
	headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}
	/** 当前使用的模型配置 */
	abstract chat: C
	/**
	 * 当前服务的消息列表
	 * @see https://platform.openai.com/docs/api-reference/chat/create#chat-create-messages
	 */
	abstract messages: BaseServiceMessages
	/** 系统预设提示词 */
	abstract systemPrompt?: string

	/** 请求控制器 */
	abortController: AbortController | null = null
	/** 事件总线 */
	emitter = mitt()

	/**
	 * 发送用户输入的内容
	 * @param content 消息内容
	 * @param conversationId 当前会话 ID
	 * @param messages 聊天消息列表, 参考 https://platform.openai.com/docs/api-reference/chat/create
	 */
	abstract send(
		content: string,
		conversationId: string,
		messages: BaseServiceMessages,
	): Promise<void>
	/**
	 * 发起聊天请求
	 * @param messages 聊天消息列表, 参考 https://platform.openai.com/docs/api-reference/chat/create
	 * @param handler 聊天请求处理器, 用于处理流式请求的回调函数和停止流式请求
	 */
	abstract fetchChatCompletion(messages: BaseServiceMessages): Promise<void>
	/**
	 * 设置聊天流式请求接口的相关参数
	 * @param chatCompletionId 当前聊天接口的唯一 ID
	 * @param chatCompletionCreated 当前聊天接口创建的时间
	 */
	setChatCompletionParams(
		chatCompletionId?: string,
		chatCompletionCreated?: number,
	): void {
		this.chatCompletionId = chatCompletionId || ''
		this.chatCompletionCreated = chatCompletionCreated || 0
	}
}

export interface BaseServiceMessage {
	/** 当前消息是否正在加载 */
	$loading?: boolean
}
export type BaseServiceMessageItem = ChatCompletionMessageParam &
	BaseServiceMessage
/**
 * 会话消息列表
 * @description 用于发起 `/chat/completions` 请求的 `messages` 参数
 * @see 详见 [Create chat completion - OpenAI Platform](https://platform.openai.com/docs/api-reference/chat/create)
 */
export type BaseServiceMessages = Array<BaseServiceMessageItem>
