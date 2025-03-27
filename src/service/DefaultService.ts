import { renderMarkdown } from '@/utils/markdown/markdown'
import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source'
// import OpenAI from 'openai'
import type {
  ChatCompletionChunk,
  ChatCompletionCreateParamsStreaming,
} from 'openai/resources/index'
import {
  BaseService,
  type BaseServiceMessageItem,
  // type BaseServiceMessageNode,
  BaseServiceMessagePart,
  type BaseServiceMessages,
  type HyosanChatChatCompletionAssistantMessageParam,
  type HyosanChatMessageContentPart,
  HyosanChatMessageContentPartTypesType,
  MessageDataKey,
  MessagePartDataKey,
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
export class DefaultService extends BaseService<DefaultChatCompletionCreateParamsStreamingOptions> {
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

  chat: DefaultChatCompletionCreateParamsStreamingOptions = {}

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
    }
    this.abortController = new AbortController()
    const abortController = this.abortController

    /** 初始状态下的助手消息 */
    const assistantMessage = this.getEmptyAssistantMessage()

    this.messages.push(assistantMessage) // 加入助手消息

    const body: DefaultChatCompletionCreateParamsStreaming = {
      model: this.model,
      ...this.chat,
      messages: this.messages.slice(0, -1),
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
              assistantMessage[MessageDataKey].loading = false
              this.emitter.emit('send-done')
              return resolve()
            }
            if (event.data === '') return
            const data = this.getChatCompletionByResponse(event.data)
            const updated = this.updateAssistantByResponse(
              assistantMessage,
              data,
            )
            // // const content = this.getContentByResponse(data)
            // // 加入思考内容
            // if (content.reasoningContent)
            //   assistantMessage.content += content.reasoningContent
            // // 加入消息内容
            // if (content.content) assistantMessage.content += content.content
            // // console.warn(JSON.stringify(messages))
            this.setChatCompletionParams(data.id, data.created)
            // 只有返回消息内容时才触发事件
            if (updated) {
              this.emitter.emit('data')
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
          assistantMessage[MessageDataKey].error = error
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
   * 将当前返回的数据更新到助手消息中
   * @description 暂不支持返回多条消息的情况
   * @param axxistantMessage 当前请求对应的助手消息
   * @param data 当前请求的返回值, 具体类型可参考 https://api-docs.deepseek.com/zh-cn/api/create-chat-completion#responses 或者 https://platform.openai.com/docs/api-reference/chat-streaming/streaming
   */
  updateAssistantByResponse(
    assistantMessage: BaseServiceMessageItem<
      true,
      HyosanChatChatCompletionAssistantMessageParam
    >,
    data: ChatCompletionChunk,
  ): boolean {
    const firstMessage = data.choices[0] // 暂时只取第一条消息
    let updated = false
    // 加入消息内容
    if (firstMessage.delta.content) {
      assistantMessage.content += firstMessage.delta.content
      updated = true
    }
    // 加入思考内容
    if ((firstMessage.delta as any).reasoning_content) {
      assistantMessage.reasoning_content =
        (assistantMessage.reasoning_content || '') +
        (firstMessage.delta as any).reasoning_content
      updated = true
    }
    return updated
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

  // /**
  //  * 从原始的流式请求中获取文本内容
  //  * @param responseText 原始流式接口返回值
  //  * @returns 本次返回的文本内容和推理内容
  //  * @deprecated 从 `0.5.0` 起弃用
  //  */
  // getContentByResponse(
  //   responseText: string | ChatCompletionChunk,
  // ): BaseServiceMessageNode {
  //   const data =
  //     typeof responseText === 'string'
  //       ? this.getChatCompletionByResponse(responseText)
  //       : responseText
  //   /** 消息内容 */
  //   const content = data.choices[0]?.delta?.content || ''
  //   const deltaObject = data.choices[0]?.delta as any
  //   /** 推理内容 */
  //   const reasoningContent = deltaObject.reasoning_content || '' // 暂不考虑 openai 的推理模型格式
  //   return { content, reasoningContent }
  // }

  /** 处理聊天消息 parts */
  async handleMessagePart(
    part: HyosanChatMessageContentPart,
    message: BaseServiceMessageItem<true>,
  ) {
    if (!part[MessagePartDataKey])
      part[MessagePartDataKey] = new BaseServiceMessagePart()
    if (part.type === HyosanChatMessageContentPartTypesType.text) {
      // 文本消息
      part[MessagePartDataKey].htmlContent = await renderMarkdown(part.text)
    } else if (part.type === HyosanChatMessageContentPartTypesType.image_url) {
      // 图片消息
      const img = document.createElement('img')
      img.src = part.image_url.url
      part[MessagePartDataKey].htmlContent = img
    } else if (
      part.type === HyosanChatMessageContentPartTypesType.input_audio
    ) {
      // 音频消息
      const audio = document.createElement('audio')
      audio.src = part.input_audio.data
      part[MessagePartDataKey].htmlContent = audio
    }
    if (typeof message.content === 'string') {
      message[MessageDataKey].onlyContent = part[MessagePartDataKey].htmlContent
    }
  }

  /** 处理聊天消息中的推理内容 */
  async handleMessageReasoningContent(
    message: BaseServiceMessageItem<
      true,
      HyosanChatChatCompletionAssistantMessageParam
    >,
  ) {
    message[MessageDataKey].reasoningContent = await renderMarkdown(
      message.reasoning_content || '',
    )
    // console.log(message[MessageDataKey].reasoningContent)
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
export type DefaultServiceChat = Partial<ChatCompletionCreateParamsStreaming>
// export type DefaultServiceChat = Partial<
//   Pick<
//     ChatCompletionCreateParamsStreaming,
//     'temperature' | 'tools' | 'max_tokens' | 'top_p' | 'stream_options' | 'response_format'
//   >
// >

/**
 * 当前适配的大模型的请求参数类型
 * @description 目前只兼容 阿里云 / 腾讯云
 * - [阿里云](https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope?spm=a2c4g.11186623.0.i4#d553cbbee6mxk)
 * - [腾讯云](https://cloud.tencent.com/document/product/1729/111007)
 */
export type DefaultChatCompletionCreateParamsStreaming = Omit<
  ChatCompletionCreateParamsStreaming,
  'messages'
> & {
  messages: BaseServiceMessages
} & DefaultAliyunChatCompletionCreateParamsStreaming

/**
 * 当前适配的大模型的请求参数类型(请求参数)
 * @description 目前只兼容 阿里云 / 腾讯云
 * - [阿里云](https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope?spm=a2c4g.11186623.0.i4#d553cbbee6mxk)
 * - [腾讯云](https://cloud.tencent.com/document/product/1729/111007)
 */
export type DefaultChatCompletionCreateParamsStreamingOptions =
  DefaultServiceChat &
    DefaultAliyunChatCompletionCreateParamsStreaming &
    DefaultTentcentCloudChatCompletionCreateParamsStreaming

/**
 * 阿里云(通义千问)自定义参数
 * @see https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api#05cfceb898csa
 */
export interface DefaultAliyunChatCompletionCreateParamsStreaming {
  /**
   * 是否启用联网搜索功能
   *
   * 模型在生成文本时是否使用互联网搜索结果进行参考。取值如下：
   * - true：启用互联网搜索，模型会将搜索结果作为文本生成过程中的参考信息，但模型会基于其内部逻辑判断是否使用互联网搜索结果。
   * 如果模型没有搜索互联网，建议优化Prompt。
   * - false（默认）：关闭互联网搜索。
   *
   * 支持的模型:
   * - 通义千问-Max
   * - 通义千问-Plus
   * - 通义千问-Turbo
   * @see [阿里云 enable_search](https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api#e1fada1a719u7)
   */
  enable_search?: boolean
}

/**
 * 腾讯云(混元)自定义参数
 * @see https://cloud.tencent.com/document/product/1729/111007
 */
export interface DefaultTentcentCloudChatCompletionCreateParamsStreaming {
  /** 搜索引文角标开关。 */
  citation?: boolean

  /**
   * 是否开启深度研究该问题，默认是false，在值为true且命中深度研究该问题时，会返回深度研究该问题信息。
   * @see https://cloud.tencent.com/document/product/1729/111007
   */
  enable_deep_search?: boolean
}
