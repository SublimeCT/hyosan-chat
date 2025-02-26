import { resolve } from 'node:path'
import { defineConfig } from 'vite'

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
})
