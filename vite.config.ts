import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	server: {
		port: 29510,
	},
	preview: {
		port: 29511,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	plugins: [
		// 用于生成 `d.ts` 文件, refer https://github.com/qmhc/vite-plugin-dts/blob/HEAD/README.zh-CN.md
		dts({ tsconfigPath: './tsconfig.lib.json' }),
	],
	build: {
		outDir: 'dist-app',
	},
})
