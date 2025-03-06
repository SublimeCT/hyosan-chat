import { type CSSResult, css } from 'lit'

/** reset 样式 */
export const resetSheets = css`html,body,h1,h2,h3,h4,p,header { padding: 0; margin: 0; }`

/**
 * 添加包含 reset 样式的样式
 * @param sheets 样式集合
 */
export function withResetSheets(...sheets: CSSResult[]) {
	return [resetSheets, ...sheets]
}
