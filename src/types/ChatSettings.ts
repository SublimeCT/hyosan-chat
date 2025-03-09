import { DefaultService } from "@/service/DefaultService"

export class ChatSettings {
  baseUrl = DefaultService.defaultURL
  modelName = DefaultService.defaultModel
  apiKey = ''
  /** 从本地存储获取设置 */
  static fromLocalStorage() {
    const settings = new ChatSettings()
    const baseUrl = localStorage.getItem('hyosan-chat-baseUrl')
    const modelName = localStorage.getItem('hyosan-chat-modelName')
    const apiKey = localStorage.getItem('hyosan-chat-apiKey')
    if (baseUrl) settings.baseUrl = baseUrl
    if (modelName) settings.modelName = modelName
    if (apiKey) settings.apiKey = apiKey
    return settings
  }
  /** 保存设置到本地存储 */
  static saveLocalStorage(settings: ChatSettings) {
    localStorage.setItem('hyosan-chat-baseUrl', settings.baseUrl)
    localStorage.setItem('hyosan-chat-modelName', settings.modelName)
    localStorage.setItem('hyosan-chat-apiKey', settings.apiKey)
  }
}