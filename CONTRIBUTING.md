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
| 目录 / 文件                        | 说明                                                         |
| ---------------------------------- | ------------------------------------------------------------ |
| `src/lib.ts`                       | 打包为库时的入口文件                                         |
| `src/main.ts`                      | 打包为应用时的入口文件                                       |
| `src/components/*`                 | 所有组件                                                     |
| `src/components/index.ts`          | `export` 所有对外提供的组件, 私有组件不对外 `exoprt`         |
| `src/internal`                     | 组件库内部使用的 class / function 等                         |
| `src/internal/shoelace-element.ts` | 组件库使用的多语言文案                                       |
| `src/translations/*.ts`            | 组件库使用的多语言文案                                       |
| `src/translations/translation.ts`  | 组件库使用的多语言文案的字段类型                             |
| `src/sheets/index.ts`              | 可重用样式定义                                               |
| `src/utils/*.ts`                   | utils 工具方法                                               |
| `src/utils/localize.ts`            | 基于 `Lit Controller` 的国际化支持类, 详见 [国际化](#国际化) |

## 国际化
组件库基于 [@shoelace-style/localize](https://www.npmjs.com/package/@shoelace-style/localize) 实现国际化功能, 在组件中应该将所有硬编码的字符改为多语言实现:

```typescript
import { html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@/utils/localize'

@customElement('hyosan-chat')
export class HyosanChat extends ShoelaceElement {
	private _locailze = new LocalizeController(this)

	@property({ reflect: true })
	message = ''

	render() {
		return html`
			<p>${this._locailze.term('test')}</p>
    `
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hyosan-chat': HyosanChat
	}
}
```

1. 在 `src/translations/*.ts` 目录中添加对应的文案内容

首先在 `src/translations/translation.ts` 中添加文案字段:

```diff
import type { Translation as DefaultTranslation } from '@shoelace-style/localize';

// Export functions from the localize lib so we have one central place to import them from
export { registerTranslation } from '@shoelace-style/localize';

export interface Translation extends DefaultTranslation {
  $code: string; // e.g. en, en-GB
  $name: string; // e.g. English, Español
  $dir: 'ltr' | 'rtl';

+  test: string;
}
```

在 `src/translations/en.ts` 中添加英文文案:
```diff
import { registerTranslation, type Translation } from '@/translations/translation';

const translation: Translation = {
  $code: 'en',
  $name: 'English',
  $dir: 'ltr',

+  test: 'test',
};

registerTranslation(translation);

export default translation;
```

其他语言的文案也一样, 只需要修改 `src/translations/<lang>.ts` 中的文案即可

2. 在组件中声明 `private _locailze = new LocalizeController(this)`
3. 在 `render` 中使用 `this._locailze.term('test')`

## Snippets
在编写 `Lit` 组件时, 我们时常需要从其他写好的组件中复制代码(每个组件都要写的那部分), 在项目中的 `.vscode/hy.code-snippets` 中提供了一些 `snippets`, 在开发时可以输入 `hy-`, 就会看到这些代码片段

## 开发规范
### 语言规范
- **严格使用 `TypeScript`**: 不允许存在 `js` 文件, 所有 `js` 文件必须转换为 `ts`
- **类型安全**: 不允许出现任何 `any` 类型
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

### 样式
- 优先将在多个地方使用的样式值写成 `css` 变量, 并增加注释
- 可复用的样式应当写到 `src/sheets/index.ts`, 特别是多个组件共享的样式, 并增加注释
- 全局样式应当写到 `src/sheets/global-styles.css`, 特别是全局的 `css` 变量, 并增加注释

### 文档
- 重视文档编写, 必要时应该在 `README.md` / `CONTRIBUTING.md` 中增加文档
- `README.md` 作为项目的入口页, 应该尽可能简洁清晰, 帮助用户(而不是开发者)快速了解项目
- `CONTRIBUTING.md` 是贡献指南, 应该包含项目的开发文档, 帮助开发者快速了解如何贡献项目

### 其他
- 必须使用 `pnpm` 替代 `npm`
- 在 `vue` 代码中, `<script>` 必须使用 `setup` 和 `lang="ts"`, 必须使用 `Composition API`
- 严格遵循现有技术栈进行开发, 代码必须在现有版本的技术栈下正常运行, 例如现有的 `lit` 是 `3.x`, 不能编写在 `3.x` 中已废弃或更改的 `API`
- 严格检查可能造成内存泄露的代码, 特别是在组件中添加的全局监听事件, 应该在组件销毁时移除
