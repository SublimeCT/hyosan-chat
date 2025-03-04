/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** 请求地址 */
	readonly VITE_CONNECT_URL: string
	/** 模型名称 */
	readonly VITE_CONNECT_MODEL: string
	/** API Key (⚠️ 仅用于测试) */
	readonly VITE_API_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
