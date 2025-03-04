/**
 * 连接配置接口，用于定义网络请求的配置参数
 *
 * @template T 扩展自对象类型，用于表示附加请求体属性的类型
 */
export class Connect<T extends object> {
	/** 请求的目标地址 */
	url = import.meta.env.VITE_CONNECT_URL
	/** 模型名称 */
	model = import.meta.env.VITE_CONNECT_MODEL
	/** 使用的 HTTP 方法 (GET/POST/PUT/DELETE 等) */
	method = 'POST'
	/** 请求头配置 */
	headers?: Record<string, string>
	/** 跨域请求的凭证策略 */
	credentials?: 'same-origin' | 'include' | 'omit'
	/** 附加的请求体属性 */
	additionalBodyProps?: T
	/** 是否启用流式传输 */
	stream?: boolean
}
