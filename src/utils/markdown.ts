import katex from 'katex'
import 'katex/dist/contrib/mhchem.mjs'
import hljs from 'highlight.js'
import { Marked, marked } from 'marked'
import type { RendererExtension, TokenizerExtension, Tokens } from 'marked'

export function toMarkdown(content: string) {
	const htmlContent = marked.parse(content) as string
	return htmlContent
}
