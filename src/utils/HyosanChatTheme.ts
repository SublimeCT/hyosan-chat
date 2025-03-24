import type { Translation } from '@/translations/translation'
import shoelaceDarkCss from '@shoelace-style/shoelace/dist/themes/dark.css?inline'
import shoelaceLightCss from '@shoelace-style/shoelace/dist/themes/light.css?inline'

/** shoelace 组件库的主题属性 */
export enum HyosanChatShoelaceTheme {
  shoelaceLight = 'sl-theme-light',
  shoelaceDark = 'sl-theme-dark',
  auto = 'auto',
}

export interface HyosanChatThemeItem {
  /** 主题名称(多语言 key) */
  i18nKey: keyof Translation
  /** css 内容 */
  cssText: string
}

/** shoelace 组件库的主题 css 内容 */
export const HyosanChatShoelaceThemes: Record<
  HyosanChatShoelaceTheme,
  HyosanChatThemeItem
> = {
  /** light theme */
  [HyosanChatShoelaceTheme.shoelaceLight]: {
    i18nKey: 'lightTheme',
    cssText: shoelaceLightCss,
  },
  /** dark theme */
  [HyosanChatShoelaceTheme.shoelaceDark]: {
    i18nKey: 'darkTheme',
    cssText: shoelaceDarkCss,
  },
  /** Follow system Settings */
  [HyosanChatShoelaceTheme.auto]: {
    i18nKey: 'followSystemTheme',
    cssText: `
      @media (prefers-color-scheme: light) {
        ${shoelaceLightCss}
      }
      @media (prefers-color-scheme: dark) {
        :root, ${shoelaceDarkCss}
      }
    `,
  },
}

/**
 * 设置 hyosan-chat 主题
 * @description 用于切换底层组件库 `shoelace` 的主题, `<hyosan-chat>` 组件会根据 `shoelaceTheme` 的值自动切换主题
 */
export class HyosanChatTheme {
  static TAG_ATTRIBUTE = 'data-hyosan-chat-theme'
  static getStyleElement() {
    return document.querySelector(`style[${HyosanChatTheme.TAG_ATTRIBUTE}]`)
  }
  static setStyleElement(theme: HyosanChatShoelaceTheme) {
    const styleElement = HyosanChatTheme.getStyleElement()
    const item = HyosanChatShoelaceThemes[theme]
    const cssNode = document.createTextNode(item.cssText)
    if (styleElement) {
      styleElement.innerHTML = ''
      styleElement.appendChild(cssNode)
      styleElement.setAttribute(HyosanChatTheme.TAG_ATTRIBUTE, theme)
    } else {
      const style = document.createElement('style')
      style.setAttribute(HyosanChatTheme.TAG_ATTRIBUTE, theme)
      style.setAttribute('type', 'text/css')
      style.appendChild(cssNode)
      document.head.appendChild(style) // 将包含 shoelace 主题样式的标签插入到 head 中
    }
    HyosanChatTheme._updateThemeClass(theme)
  }
  /** 在根元素上切换 shoelace 主题类 */
  private static _updateThemeClass(theme: HyosanChatShoelaceTheme) {
    document.documentElement.classList.add(theme)
    Object.values(HyosanChatShoelaceTheme).forEach((c) => {
      if (c !== theme) {
        document.documentElement.classList.remove(c)
      }
    })
  }
}
