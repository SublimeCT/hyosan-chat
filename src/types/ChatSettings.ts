import { DefaultService } from '@/service/DefaultService'

export class ChatSettings {
  baseUrl = import.meta.env.VITE_CONNECT_URL || DefaultService.defaultURL
  modelName = import.meta.env.VITE_CONNECT_MODEL || DefaultService.defaultModel
  apiKey = import.meta.env.VITE_API_KEY || ''
  /**
   * 默认的系统提示词
   * @since 0.3.1
   */
  systemPrompts = import.meta.env.VITE_SYSTEM_PROMPTS || ''
  /**
   * 是否将所有会话 / 消息数据保存到本地(`indexeddb`)
   * @description 值为 `'true'` 时为启用
   * @since 0.4.1
   */
  localize = import.meta.env.VITE_DATA_LOCALIZE || ''
  /** 从本地存储获取设置 */
  static fromLocalStorage() {
    const settings = new ChatSettings()
    const baseUrl = localStorage.getItem('hyosan-chat-baseUrl')
    const modelName = localStorage.getItem('hyosan-chat-modelName')
    const apiKey = localStorage.getItem('hyosan-chat-apiKey')
    const systemPrompts = localStorage.getItem('hyosan-chat-systemPrompts')
    const localize = localStorage.getItem('hyosan-chat-localize')
    if (baseUrl) settings.baseUrl = baseUrl
    if (modelName) settings.modelName = modelName
    if (apiKey) settings.apiKey = apiKey
    if (systemPrompts) settings.systemPrompts = systemPrompts
    if (localize) settings.localize = localize
    return settings
  }
  /** 保存设置到本地存储 */
  static saveLocalStorage(settings: ChatSettings) {
    localStorage.setItem('hyosan-chat-baseUrl', settings.baseUrl)
    localStorage.setItem('hyosan-chat-modelName', settings.modelName)
    localStorage.setItem('hyosan-chat-apiKey', settings.apiKey)
    localStorage.setItem('hyosan-chat-systemPrompts', settings.systemPrompts)
    localStorage.setItem('hyosan-chat-localize', settings.localize)
  }
}
