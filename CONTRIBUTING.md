# 贡献指南

## cli
```bash
# 安装依赖
pnpm i

# 启动开发环境
pnpm run dev

# 构建生成版本
pnpm run build
```

## 目录结构
```bash
./
├── CONTRIBUTING.md
├── README.md
├── biome.json
├── commitlint.config.ts
├── dist
│   ├── assets
│   │   ├── index-CMq9iakL.js
│   │   └── index-D4VIsfOM.css
│   ├── index.html
│   └── vite.svg
├── index.html
├── package.json
├── pnpm-lock.yaml
├── public
│   └── vite.svg
├── src
│   ├── assets
│   │   └── lit.svg
│   ├── components
│   │   ├── hyosan-chat.ts
│   │   └── index.ts
│   ├── index.css
│   ├── main.ts
│   └── vite-env.d.ts
├── tsconfig.json
└── vite.config.ts
```

## 开发规范
### 语言规范
- **严格使用 `TypeScript`**: 不允许存在 `js` 文件, 所有 `js` 文件必须转换为 `ts`
- **`ts` 配置**: 严格遵循 `tsconfig.json` 中的配置, 引入类型时使用 `import type`
- **使用现代语法**: 优先使用 `ES2020+` 语法, 避免使用已过时的 `API`

### 注释规范
所有注释必须 **使用 [jsdoc](https://jsdoc.app/) 格式**

正确示例:
```typescript
/**
 * 计算两个数值相加的结果
 * @param countA 数值 A
 * @param countB 数值 B
 */
export function sum(countA: number, countB: number) {
  return countA + countB
}
```

错误示例:
```typescript
// 计算两个数值相加的结果
export function sum(countA: number, countB: number) {
  return countA + countB
}
```

- 如果代码中已经声明了数据类型, 在 `jsdoc` 注释中就不必再声明类型(`@param` / `@type`)
- 任何应该改为 `jsdoc` 注释的单行注释都要改为 `jsdoc` 注释
- 必须为每个 变量 / `function` / `class` / `type` / `interface` / `enum` / `...` 添加 `jsdoc` 注释, 注释使用中文

### 代码质量
- `ts` 中的变量命名必须具有 **语义化**
- **[biome](https://biomejs.dev/zh-cn/guides/getting-started/) 规范**: 必须遵守 `biome.json` 中配置的规则
- 性能优先:
  - 优先使用性能最好的方式实现
- 依赖管理:
  - 在引入新的依赖时要保持谨慎态度, 要考虑新依赖的 尺寸 / 性能 / 流行度 / 成熟度
  - 如无必要, 不要更新或引入新的依赖或技术栈
- 代码检查:
  - 编码完成后务必自己做一遍 `code review`
- 开发原则:
  - 代码需要遵守基本的 **开发原则**
  - 复杂的代码需要考虑使用适当的 **设计模式**
- **避免冗余**:
  - 在开发一个功能之前, 先检查项目中是否有可以复用的代码

### 文档
- 重视文档编写, 必要时应该在 `README.md` / `CONTRIBUTING.md` 中增加文档
- `README.md` 作为项目的入口页, 应该尽可能简洁清晰, 帮助用户(而不是开发者)快速了解项目
- `CONTRIBUTING.md` 是贡献指南, 应该包含项目的开发文档, 帮助开发者快速了解如何贡献项目

### 其他
- 在 `vue` 代码中, `<script>` 必须使用 `setup` 和 `lang="ts"`, 必须使用 `Composition API`
- 严格遵循现有技术栈进行开发, 代码必须在现有版本的技术栈下正常运行, 例如现有的 `lit` 是 `3.x`, 不能编写在 `3.x` 中已废弃或更改的 `API`
