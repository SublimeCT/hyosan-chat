import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
	preview: {
		port: 29521,
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	plugins: [
		// 用于生成 `d.ts` 文件, refer https://github.com/qmhc/vite-plugin-dts/blob/HEAD/README.zh-CN.md
		dts({ tsconfigPath: './tsconfig.lib.json' }),
		// https://www.npmjs.com/package/vite-plugin-static-copy
		viteStaticCopy({
			targets: [
				{
					src: './node_modules/@shoelace-style/shoelace/cdn/themes/dark.css',
					dest: 'sheets',
				},
				{
					src: './node_modules/@shoelace-style/shoelace/cdn/themes/light.css',
					dest: 'sheets',
				},
			],
		}),
	],
	build: {
		lib: {
			name: 'hyosan-chat',
			entry: ['src/lib.ts'],
			fileName: 'hyosan-chat',
		},
	},
})
