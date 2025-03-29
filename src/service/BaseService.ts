import type { HyosanChatUploadFile } from '@/types/HyosanChatUploadFile'
import Emittery from 'emittery'
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources/index'

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
    console.log('%c[BaseService] %cdestroy()', 'color: teal', 'color: green')
  }

  /**
   * 获取指定消息列表中是否有消息处于 `loading` 状态
   * @param messages 消息列表
   * @returns 当前是否有消息处于 `loading` 状态
   */
  static isMessagesLoading(messages: BaseServiceMessages) {
    for (const message of messages) {
      if (message[MessageDataKey]?.loading) {
        return true
      }
    }
    return false
  }

  /**
   * 发送用户输入的内容
   * @param contentOrMessage 消息内容 或 消息数据
   * @param conversationId 当前会话 ID
   * @param messages 聊天消息列表, 参考 https://platform.openai.com/docs/api-reference/chat/create
   */
  abstract send(
    contentOrMessage: string | BaseServiceMessageItem,
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

  /** 处理聊天消息中的推理内容 */
  abstract handleMessageReasoningContent(
    message: BaseServiceMessageItem<
      true,
      HyosanChatChatCompletionAssistantMessageParam
    >,
  ): Promise<void>

  /** 处理聊天消息 parts */
  abstract handleMessagePart(
    part: HyosanChatMessageContentPart,
    message: BaseServiceMessageItem<true>,
  ): Promise<void>
  /**
   * 设置聊天流式请求接口的相关参数
   * @param chatCompletionId 当前聊天接口的唯一 `ID`
   * @param chatCompletionCreated 当前聊天接口创建的时间
   */
  setChatCompletionParams(
    chatCompletionId?: string,
    chatCompletionCreated?: number,
  ): void {
    this.chatCompletionId = chatCompletionId || ''
    this.chatCompletionCreated = chatCompletionCreated || 0
  }
  /**
   * 获取初始状态下的助手消息
   * @description 用于在发送消息时加入 messages
   */
  getEmptyAssistantMessage(): BaseServiceMessageItem<
    true,
    HyosanChatChatCompletionAssistantMessageParam
  > {
    const message: BaseServiceMessageItem<true> = {
      role: 'assistant',
      content: '',
      [MessageDataKey]: {
        loading: true,
      },
    }
    return message
  }
  /**
   * 通过消息内容和附件创建 user message
   * @param content 消息内容
   * @param files 附件文件
   * @since 0.6.0
   * @returns user message
   */
  static generateUserMessage(content: string, files?: HyosanChatUploadFile[]): BaseServiceMessageItem {
    if (files?.length) {
      const userMessageContent: HyosanChatChatCompletionUserMessageParam['content'] = [{ type: 'text', text: content }]
      for (const file of files) {
        const filePart = BaseService.getFileMessageContentPart(file)
        userMessageContent.push(filePart)
      }
      return { role: 'user', content: userMessageContent as ChatCompletionContentPart[] }
    } else {
      return { role: 'user', content }
    }
  }
  /**
   * 创建附件 message part
   * @param file 附件
   * @since 0.6.0
   * @returns 附件 message part
   */
  static getFileMessageContentPart(file: HyosanChatUploadFile): HyosanChatMessageContentPart {
    if (file.type.startsWith('audio')) {
      return { type: 'input_audio', input_audio: { data: file.url || '', format: file.type.includes('wav') ? 'wav' : 'mp3' } }
    } else if (file.type.startsWith('video')) {
      return { type: 'video_url', video_url: { url: file.url || ''} }
    } else {
      return { type: 'image_url', image_url: { url: file.url || '' } }
    }
  }
}

/**
 * 在消息(`message`) 中用于保存消息状态和数据的 `key`, `value` 类型为 {@link BaseServiceMessage}
 * @description 如需访问在此属性上存储的数据, 必须引入此 `Symbol`, **此属性不可枚举**
 * @example
 * ```typescript
 * import { MessageDataKey } from '@/service/BaseService'
 *
 * const messages: BaseServiceMessages = []
 * // ...
 * const messageData = messages[0][MessageDataKey]
 * ```
 * @since 0.5.0
 */
export const MessageDataKey = Symbol('HY_DATA')

/**
 * 在消息 parts (`message parts`) 中用于保存消息状态和数据的 `key`, `value` 类型为 {@link BaseServiceMessagePart}
 * @description 如需访问在此属性上存储的数据, 必须引入此 `Symbol`, **此属性不可枚举**
 * @example
 * ```typescript
 * import { MessagePartDataKey } from '@/service/BaseService'
 *
 * const messages: BaseServiceMessages = []
 * // ...
 * const messageData = messages[0].content[0][MessageDataKey]
 * ```
 * @since 0.5.0
 */
export const MessagePartDataKey = Symbol('HY_PART_DATA')

/**
 * 在消息(`message`) 中存储的消息状态及数据
 * @description 此数据会作为内部组件(`<hyosan-chat-bubble-list>`) 渲染时使用的数据源, 在渲染时会在每个 `message` 中都会保存 `key` 为 {@link MessageDataKey} `value` 为 {@link BaseServiceMessage} 的数据
 * @since 0.5.0
 */
export class BaseServiceMessage<T extends HTMLElement = HTMLElement> {
  /** 当前消息是否正在加载 */
  loading?: boolean
  /**
   * `HTML` 格式的内容
   * @description 只适用于只有一个 `content` 的类型为 `string` 的消息
   */
  onlyContent?: string | T
  /**
   * `HTML` 格式的思考推理内容
   * @description 如果有内容, 则会被渲染为 `HTML` 元素
   */
  reasoningContent?: string
  /** 当前消息遇到的错误 */
  error?: string | Error
}

/**
 * 在消息 `parts` (`message parts`) 中存储的消息状态及数据
 * @description 此数据会作为内部组件(`<hyosan-chat-bubble-list>`) 渲染时使用的数据源, 在渲染时会在每个 `message parts` 中都会保存 `key` 为 {@link MessagePartDataKey} `value` 为 {@link BaseServiceMessagePart} 的数据
 * @since 0.5.0
 */
export class BaseServiceMessagePart<T extends HTMLElement = HTMLElement> {
  /**
   * `HTML` 格式的消息内容
   * @description 如果有内容, 则会被渲染为 `HTML` 元素
   */
  htmlContent?: string | T
}

/** 组件可以自定义处理的消息 part 类型 */
export enum HyosanChatMessageContentPartTypesType {
  /** 文本消息 */
  text = 'text',
  /** 图片消息 */
  image_url = 'image_url',
  /** 语音消息 */
  input_audio = 'input_audio',
  /** file message(openai) */
  file = 'file',
  /** refusal message */
  refusal = 'refusal',
  /** video message */
  video_url = 'video_url',
}

/**
 * 包含所有消息中的所有类型的 parts 共有属性 interface
 * @since 0.5.0
 */
export interface HyosanChatMessageContentPartType<
  T extends
    keyof typeof HyosanChatMessageContentPartTypesType = keyof typeof HyosanChatMessageContentPartTypesType,
  ET extends string | undefined = string,
> {
  /** 消息类型 */
  type: ET extends undefined ? T : T & ET
}

/**
 * openai 所有消息的 content parts 数据类型
 * @description 应该始终保持与 {@link ChatCompletionMessageParam} 的 `content` 中的每一项的数据类型兼容
 */
export type HyosanChatOpenaiDefaultMessageContentPart = Exclude<
  ChatCompletionMessageParam['content'],
  undefined | null | string
>

/**
 * 阿里云视频消息 part 类型
 * @see https://help.aliyun.com/zh/model-studio/user-guide/qvq?spm=a2c4g.11186623.help-menu-2400256.d_1_0_1_0.67328b14YALGu1&scm=20140722.H_2877996._.OR_help-T_cn~zh-V_1#65e1aa85b4hjn
 */
export type HyosanChatAliyunVideoMessageContentPart = {
  type: 'video_url',
  video_url: { url: string }
}

/**
 * 当前组件内部可以解析的 content parts 数据类型
 * @description 兼容 OpenAI content parts, 并在此基础上扩展新类型
 * @since 0.5.0
 */
export type HyosanChatDefaultMessageContentPart =
  HyosanChatOpenaiDefaultMessageContentPart[number] |
  HyosanChatAliyunVideoMessageContentPart

/**
 * 消息中的所有 parts 类型
 * @since 0.5.0
 */
export type HyosanChatMessageContentPart<
  K extends boolean = false,
  P extends
    HyosanChatMessageContentPartType = HyosanChatDefaultMessageContentPart,
> = P &
  (K extends true
    ? { [MessagePartDataKey]: BaseServiceMessagePart }
    : { [MessagePartDataKey]?: BaseServiceMessagePart })

/**
 * 用户消息类型
 * @description 由于 `openai` 的助手消息中不包含思考内容, 所以只能声明一个新类型
 * @since 0.6.0
 */
export type HyosanChatChatCompletionUserMessageParam = Omit<
  ChatCompletionUserMessageParam,
  'content'
> & {
  /**
   * The contents of the assistant message. Required unless `tool_calls` or
   * `function_call` is specified.
   */
  content?: string | Array<HyosanChatMessageContentPart> | null
}

/**
 * 助手消息类型
 * @description 由于 `openai` 的助手消息中不包含思考内容, 所以只能声明一个新类型
 * @since 0.5.0
 */
export type HyosanChatChatCompletionAssistantMessageParam = Omit<
  ChatCompletionAssistantMessageParam,
  'content'
> & {
  /**
   * The contents of the assistant message. Required unless `tool_calls` or
   * `function_call` is specified.
   */
  content?: string | Array<HyosanChatMessageContentPart> | null
  /**
   * 思考内容
   * @since 0.5.0
   */
  reasoning_content?: string
}

/**
 * 组件内部使用的原始消息类型
 * @since 0.5.0
 */
export type HyosanChatChatCompletionMessageParam =
  | Exclude<ChatCompletionMessageParam, ChatCompletionAssistantMessageParam | ChatCompletionUserMessageParam>
  | HyosanChatChatCompletionAssistantMessageParam
  | HyosanChatChatCompletionUserMessageParam

/**
 * 在组件中使用的消息类型, 包含了组件内部使用的状态(例如消息加载状态)或中间数据(例如 `markdown` 转为 `html string` 的数据)
 *
 * ## CHANGELOG
 * - `0.5.0`: 修改数据结构, 将 {@link BaseServiceMessage} 移至 {@link MessageDataKey} 属性下
 * @version 0.5.0
 * @template K 是否存在 `MessageDataKey` 属性
 */
export type BaseServiceMessageItem<
  K extends boolean = false,
  C extends
    HyosanChatChatCompletionMessageParam = HyosanChatChatCompletionMessageParam,
> = C &
  (K extends true
    ? { [MessageDataKey]: BaseServiceMessage }
    : { [MessageDataKey]?: BaseServiceMessage })

/**
 * 会话消息列表
 * @description 用于发起 `/chat/completions` 请求的 `messages` 参数
 * @template K 是否存在 `MessageDataKey` 属性
 * @see 详见 [Create chat completion - OpenAI Platform](https://platform.openai.com/docs/api-reference/chat/create)
 */
export type BaseServiceMessages = Array<BaseServiceMessageItem>

/**
 * 在组件内部使用的基本的消息类型
 * @deprecated `0.5.0` 起废弃, 应使用 {@link BaseServiceMessageItem}; 在 `0.5.0` 之前, (此类型)消息内容只支持单条纯文本或带有思考内容的纯文本数据, 不支持 `OpenAI` 格式的 `ChatCompletionMessageParam`(即多类型的数据)
 * 从 `0.5.0` 起, 将不再使用此类型, 而是直接在 `messages props` 上进行数据处理
 */
export interface BaseServiceMessageNode {
  /** 消息内容 */
  content: string
  /** 消息的思考内容 */
  reasoningContent: string
}
