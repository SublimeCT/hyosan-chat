import hljs from 'highlight.js'
import type { MarkdownItAsync } from 'markdown-it-async'

/**
 * 自定义插件: 添加复制按钮
 * @param md markdown-it 实例
 */
export default function CodeBlockWrapper(md: MarkdownItAsync) {
  // const defaultRenderer = md.renderer.rules.fence || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]
    const code = token.content.trim()
    const lang = token.info.trim()

    let highlightedCode = ''
    if (lang && hljs.getLanguage(lang)) {
      highlightedCode = hljs.highlight(code, { language: lang }).value
    } else {
      highlightedCode = md.utils.escapeHtml(code)
    }

    // const copyButtonHtml = '<button class="copy-button" title="Copy to clipboard">Copy</button>';
    const preHtml = `<pre class="hljs"><code>${highlightedCode}</code></pre>`
    // const html = `<div class="code-block">${copyButtonHtml}${preHtml}</div>`;
    const html = `<hyosan-chat-code-block-wrapper language="${lang}">${preHtml}</hyosan-chat-code-block-wrapper>`

    return html
  }
}
