// import katex from 'katex'
// import 'katex/dist/contrib/mhchem.mjs'
import hljs from 'highlight.js'
import { Marked } from 'marked'
// import type { RendererExtension, TokenizerExtension, Tokens } from 'marked'
// import extendedLatex from "marked-extended-latex"

// refer https://www.npmjs.com/package/marked-highlight
import { markedHighlight } from 'marked-highlight'
// https://www.npmjs.com/package/marked-katex-extension
import markedKatex from "marked-katex-extension"
// https://www.npmjs.com/package/marked-linkify-it
import markedLinkifyIt from "marked-linkify-it"

const marked = new Marked(
	markedHighlight({
		emptyLangClass: 'hljs',
		langPrefix: 'hljs language-',
		highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			console.log('language', language, hljs.highlight(code, { language }).value)
      return hljs.highlight(code, { language }).value;
		}
	})
)
marked.use(markedKatex({nonStandard: true}))
marked.use(markedLinkifyIt({}, {}))

export async function toMarkdown(content: string) {
	const htmlContent = await marked.parse(content)
	return htmlContent
}
