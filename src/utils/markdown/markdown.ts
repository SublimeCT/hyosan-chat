import { MarkdownItAsync } from 'markdown-it-async'
import highlight from 'markdown-it-highlightjs'
import linkAttr from 'markdown-it-link-attributes'
import mathjax3 from 'markdown-it-mathjax3'
import CodeBlockWrapper from './CodeBlockWrapper'

/** markdown-it 实例 */
let _md: MarkdownItAsync

/** 获取并初始化 markdown-it 实例 */
export async function getMarkdownItInstance(): Promise<MarkdownItAsync> {
  if (_md) return _md
  _md = new MarkdownItAsync()
  // 代码高亮
  _md.use(highlight)
  // 代码块使用自定义组件包裹
  _md.use(CodeBlockWrapper)
  // 链接在新窗口打开
  _md.use(linkAttr, { attrs: { target: '_blank', rel: 'noopener' } })
  // 渲染数学公式
  _md.use(mathjax3, {
    tex: {
      tags: 'ams',
      inlineMath: [
        // start/end delimiter pairs for in-line math
        ['$', '$'],
        ['\\(', '\\)'],
      ],
      displayMath: [
        // start/end delimiter pairs for display math
        ['$$', '$$'],
        ['\\[', '\\]'],
      ],
    },
  })
  return _md
}

/**
 * 将 markdown 字符串通过 markdown-it 渲染为 html 字符串
 * @param content markdown 字符串
 * @returns html 字符串
 */
export async function renderMarkdown(content: string) {
  const processedContent = getProcessedContent(content)
  const md = await getMarkdownItInstance()
  const htmlContent = await md.renderAsync(processedContent)
  return htmlContent
}

/**
 * 将 markdown 字符串进行预处理, 将 `\\[` 和 `\\]` 替换为 `$$`
 * @param content markdown 字符串
 */
export function getProcessedContent(content: string) {
  return content.replace(/\\\[|\\\]/g, '$$')
}
