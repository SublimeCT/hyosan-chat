/**
 * @interface SpeechOptions
 * 语音合成选项接口
 */
export interface SpeechOptions {
  /** 语言代码，例如 "zh-CN" */
  lang?: string
  /** 语速 */
  rate?: number
  /** 音调 */
  pitch?: number
  /** 音量 */
  volume?: number
  /** 使用的语音对象 */
  voice?: SpeechSynthesisVoice
}

/**
 * @interface HyosanChatSpeechData
 * 存储在元素上的语音合成内部数据
 */
interface HyosanChatSpeechData {
  /** MutationObserver 实例，用于监听元素内容变化 */
  observer: MutationObserver
  /** 是否正在朗读 */
  isSpeaking: boolean
  /** 已处理文本的长度 */
  lastProcessedLength: number
  /** 当前正在朗读的 SpeechSynthesisUtterance 实例 */
  currentUtterance: SpeechSynthesisUtterance | null
  /** 朗读队列，用于存储待朗读的文本片段 */
  speechQueue: string[]
}

/**
 * @interface HTMLElementWithSpeech
 * 扩展的 HTMLElement 接口，包含语音合成相关数据
 */
export interface HTMLElementWithSpeech extends HTMLElement {
  __hyosanChatSpeechData?: HyosanChatSpeechData
}

/**
 * @class HyosanChatSpeech
 * 用于在 AI 对话组件中识别并朗读消息
 * 每次调用 speak 方法时会停止当前元素的朗读，重新开始朗读最新内容
 */
export class HyosanChatSpeech {
  /**
   * 开始朗读指定元素中的文本
   * @description 第一次调用时开始朗读, 第二次调用时停止朗读
   * @param element 需要朗读内容的 DOM 元素
   * @param options 语音合成选项
   */
  static speak(element: HTMLElement, options?: SpeechOptions) {
    const targetElement = element as HTMLElementWithSpeech

    // 如果元素已有语音数据，先停止当前朗读
    if (targetElement.__hyosanChatSpeechData) {
      return HyosanChatSpeech.stopSpeakingInternal(targetElement)
    }

    // 取消当前所有语音合成，确保新的朗读正常开始
    window.speechSynthesis.cancel()

    // 初始化语音合成内部数据
    const speechData: HyosanChatSpeechData = {
      observer: new MutationObserver(() => {
        HyosanChatSpeech.handleMutations(targetElement, options)
      }),
      isSpeaking: false,
      lastProcessedLength: 0,
      currentUtterance: null,
      speechQueue: [],
    }
    targetElement.__hyosanChatSpeechData = speechData

    // 监听元素内容变化
    speechData.observer.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    // 处理初始内容
    HyosanChatSpeech.processNewContent(targetElement, options)
  }

  /**
   * 内部方法：处理元素内容变化事件
   * @param element 目标 DOM 元素
   * @param options 语音合成选项
   */
  private static handleMutations(
    element: HTMLElementWithSpeech,
    options?: SpeechOptions,
  ) {
    const speechData = element.__hyosanChatSpeechData as HyosanChatSpeechData
    const fullText = HyosanChatSpeech.getTextContent(element)
    if (fullText.length > speechData.lastProcessedLength) {
      // 动态追加新的朗读内容
      const newText = fullText.substring(speechData.lastProcessedLength)
      if (speechData.speechQueue.length > 1) {
        speechData.speechQueue[speechData.speechQueue.length - 1] += newText
      } else {
        speechData.speechQueue.push(newText)
      }
      speechData.lastProcessedLength = fullText.length

      // 如果当前没有在朗读，则开始朗读队列中的内容
      if (!speechData.isSpeaking) {
        HyosanChatSpeech.startSpeakingQueue(element, options)
      }
    }
  }

  /**
   * 内部方法：开始朗读队列中的内容
   * @param element 目标 DOM 元素
   * @param options 语音合成选项
   */
  private static startSpeakingQueue(
    element: HTMLElementWithSpeech,
    options?: SpeechOptions,
  ) {
    const speechData = element.__hyosanChatSpeechData as HyosanChatSpeechData
    // console.log('startSpeakingQueue()', speechData.speechQueue)
    if (speechData.speechQueue.length === 0)
      return HyosanChatSpeech.stopSpeakingInternal(element)

    speechData.isSpeaking = true
    const textToSpeak = speechData.speechQueue.shift() as string
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    speechData.currentUtterance = utterance

    if (options) {
      if (options.lang) utterance.lang = options.lang
      if (options.rate) utterance.rate = options.rate
      if (options.pitch) utterance.pitch = options.pitch
      if (options.volume) utterance.volume = options.volume
      if (options.voice) utterance.voice = options.voice
    }

    const endHandler = () => {
      speechData.isSpeaking = false
      speechData.currentUtterance = null
      HyosanChatSpeech.startSpeakingQueue(element, options)
    }
    utterance.addEventListener('end', endHandler)

    const errorHandler = (event: Event) => {
      console.error('语音朗读出错', event)
      speechData.isSpeaking = false
      speechData.currentUtterance = null
      HyosanChatSpeech.startSpeakingQueue(element, options)
    }
    utterance.addEventListener('error', errorHandler)

    window.speechSynthesis.speak(utterance)
  }

  /**
   * 内部方法：处理新追加的文本并进行朗读
   * @param element 目标 DOM 元素
   * @param options 语音合成选项
   */
  private static processNewContent(
    element: HTMLElementWithSpeech,
    options?: SpeechOptions,
  ) {
    const speechData = element.__hyosanChatSpeechData as HyosanChatSpeechData
    const fullText = HyosanChatSpeech.getTextContent(element)
    speechData.speechQueue.push(fullText)
    speechData.lastProcessedLength = fullText.length

    // 如果当前没有在朗读，则开始朗读队列中的内容
    if (!speechData.isSpeaking) {
      HyosanChatSpeech.startSpeakingQueue(element, options)
    }
  }

  /**
   * 内部方法：获取元素的内容，排除指定的选择器
   * @param element 目标 DOM 元素
   * @param options 语音合成选项
   * @returns 过滤后的文本内容
   */
  private static getTextContent(element: HTMLElementWithSpeech): string {
    console.log(element)
    let text = element.textContent || ''
    text = text.replace(/\s+/g, '')
    return text
  }

  /**
   * 内部方法：停止当前元素的朗读并清理内部数据
   * @param element 目标 DOM 元素
   */
  private static stopSpeakingInternal(element: HTMLElementWithSpeech) {
    const speechData = element.__hyosanChatSpeechData as HyosanChatSpeechData
    speechData.currentUtterance?.removeEventListener(
      'end',
      (speechData.currentUtterance as any).endHandler,
    )
    speechData.currentUtterance?.removeEventListener(
      'error',
      (speechData.currentUtterance as any).errorHandler,
    )
    speechData.observer.disconnect()
    window.speechSynthesis.cancel()
    Reflect.deleteProperty(element, '__hyosanChatSpeechData')
    console.log('stop ...')
  }
}
