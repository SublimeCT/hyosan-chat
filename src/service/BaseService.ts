import Emittery from 'emittery'
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

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
	messages: BaseServiceMessages = []
	/** 系统预设提示词 */
	abstract systemPrompt?: string

	/** 请求控制器 */
	abortController: AbortController | null = null
	/**
	 * 事件总线
	 * @todo 声明 EventType
	 */
	emitter = new Emittery()
	/** 断开流式请求 并 移除当前 service 的所有事件监听器 */
	destroy() {
		if (this.abortController) this.abortController.abort()
		this.emitter.clearListeners()
	}

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
	 * 发送选择重新生成
	 * @param conversationId 当前会话 ID
	 * @param messages 聊天消息列表, 参考 https://platform.openai.com/docs/api-reference/chat/create
	 * @param retryMessage 当前需要重新生成的消息
	 */
	abstract retry(
		conversationId: string,
		messages: BaseServiceMessages,
		retryMessage: BaseServiceMessageItem,
	): Promise<void>
	/** 发起聊天请求 */
	abstract fetchChatCompletion(): Promise<void>
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
	handleRequestMessages(messages: BaseServiceMessages) {
		return messages.map((v) => {
			const _message = { ...v }
			Reflect.deleteProperty(_message, '$loading')
			Reflect.deleteProperty(_message, '$reasoningContent')
			Reflect.deleteProperty(_message, '$error')
			return _message
		})
	}
	/**
	 * 获取初始状态下的助手消息
	 * @description 用于在发送消息时加入 messages
	 */
	getEmptyAssistantMessage(): BaseServiceMessageItem {
		const message: BaseServiceMessageItem = {
			role: 'assistant',
			content: '',
			$loading: true,
			$reasoningContent: '',
		}
		return message
	}
}

export interface BaseServiceMessage {
	/** 当前消息是否正在加载 */
	$loading?: boolean
	/** 思考阶段内容(在发起请求时会被删除) */
	$reasoningContent?: string
	/** 当前消息遇到的错误 */
	$error?: string | Error
}
export type BaseServiceMessageItem = ChatCompletionMessageParam &
	BaseServiceMessage
/**
 * 会话消息列表
 * @description 用于发起 `/chat/completions` 请求的 `messages` 参数
 * @see 详见 [Create chat completion - OpenAI Platform](https://platform.openai.com/docs/api-reference/chat/create)
 */
export type BaseServiceMessages = Array<BaseServiceMessageItem>

/** 在组件内部使用的基本的消息类型 */
export interface BaseServiceMessageNode {
	/** 消息内容 */
	content: string
	/** 消息的思考内容 */
	reasoningContent: string
}
