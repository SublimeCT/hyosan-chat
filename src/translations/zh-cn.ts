import {
  type Translation,
  registerTranslation,
} from '@/translations/translation'

const translation: Translation = {
  $code: 'zh-cn',
  $name: '简体中文',
  $dir: 'ltr',

  test: '测试',
  startANewChat: '开始新聊天',
  sendTips: '按 Enter 键发送, 按 Shift + Enter 键换行',
  copy: '复制',
  copySuccessfully: '复制成功!',
  rename: '重命名',
  edit: '编辑',
  delete: '删除',
  stopOutput: '停止输出',
  retry: '重新生成',
  enableSearch: '联网搜索',
  ariaSendInput: '发送框',
  ariaConversationsList: '会话列表',
  settings: '设置',
  baseUrl: 'Base URL',
  modelName: '模型名称',
  apiKey: 'API Key',
  systemPrompts: '默认的系统提示词',
  save: '保存',
  reset: '重置',
  close: '关闭',
}

registerTranslation(translation)

export default translation
