/**
 * @typedef {Object} UserConfigOptions
 * @property {string[]} globs - 要分析的文件路径模式。
 * @property {string[]} exclude - 要排除的文件路径模式。
 * @property {string} outdir - 输出清单的目录。
 * @property {boolean} dev - 开发模式，提供额外的日志记录。
 * @property {boolean} watch - 监视模式，文件更改时生成新的清单。
 * @property {boolean} dependencies - 包含第三方自定义元素清单。
 * @property {boolean} packagejson - 将清单路径输出到 `package.json`，默认为 true。
 * @property {boolean} litelement - 启用对 LitElement 语法的特殊处理。
 * @property {boolean} catalyst - 启用对 Catalyst 语法的特殊处理。
 * @property {boolean} fast - 启用对 FASTElement 语法的特殊处理。
 * @property {boolean} stencil - 启用对 Stencil 语法的特殊处理。
 * @property {Array<() => import('@custom-elements-manifest/analyzer').Plugin>} plugins - 自定义插件数组。
 * @property {function({ts: import('@custom-elements-manifest/analyzer').InitializeParams['ts'], globs: string[]}): SourceFile[]} overrideModuleCreation - 覆盖默认模块创建的函数。
 */
// import * as path from 'node:path';
import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';
import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';
import { customElementVuejsPlugin } from 'custom-element-vuejs-integration';
import { parse } from 'comment-parser';
import { pascalCase } from 'pascal-case';
import commandLineArgs from 'command-line-args';
import fs from 'node:fs';


const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const { name, description, version, author, homepage, license } = packageData;

const { outdir } = commandLineArgs([
  { name: 'litelement', type: String },
  { name: 'analyze', defaultOption: true },
  { name: 'outdir', type: String }
]);

function noDash(string) {
  return string.replace(/^\s?-/, '').trim();
}

function replace(string, terms) {
  terms.forEach(({ from, to }) => {
    _string = string?.replace(from, to);
  });

  return _string;
}

/**
 * custon-elements-manifest 配置
 * @type {UserConfigOptions}
 */
const userConfigOptions = {
  globs: ['src/components/**/*.ts'],
  plugins: [
    // Append package data
    {
      name: 'shoelace-package-data',
      packageLinkPhase({ customElementsManifest }) {
        customElementsManifest.package = { name, description, version, author, homepage, license };
      }
    },
    // Parse custom jsDoc tags
    {
      name: 'shoelace-custom-tags',
      analyzePhase({ ts, node, moduleDoc }) {
        switch (node.kind) {
          case ts.SyntaxKind.ClassDeclaration: {
            const className = node.name.getText();
            const classDoc = moduleDoc?.declarations?.find(declaration => declaration.name === className);
            const customTags = ['animation', 'dependency', 'documentation', 'since', 'status', 'title'];
            let customComments = '/**';

            node.jsDoc?.forEach(jsDoc => {
              jsDoc?.tags?.forEach(tag => {
                const tagName = tag.tagName.getText();

                if (customTags.includes(tagName)) {
                  customComments += `\n * @${tagName} ${tag.comment}`;
                }
              });
            });

            // This is what allows us to map JSDOC comments to ReactWrappers.
            classDoc.jsDoc = node.jsDoc?.map(jsDoc => jsDoc.getFullText()).join('\n');

            const parsed = parse(`${customComments}\n */`);
            parsed[0].tags?.forEach(t => {
              switch (t.tag) {
                // Animations
                case 'animation':
                  if (!Array.isArray(classDoc.animations)) {
                    classDoc.animations = [];
                  }
                  classDoc.animations.push({
                    name: t.name,
                    description: noDash(t.description)
                  });
                  break;

                // Dependencies
                case 'dependency':
                  if (!Array.isArray(classDoc.dependencies)) {
                    classDoc.dependencies = [];
                  }
                  classDoc.dependencies.push(t.name);
                  break;

                // Value-only metadata tags
                case 'documentation':
                case 'since':
                case 'status':
                case 'title':
                  classDoc[t.tag] = t.name;
                  break;

                // All other tags
                default:
                  if (!Array.isArray(classDoc[t.tag])) {
                    classDoc[t.tag] = [];
                  }

                  classDoc[t.tag].push({
                    name: t.name,
                    description: t.description,
                    type: t.type || undefined
                  });
              }
            });
          }
        }
      }
    },

    {
      name: 'shoelace-react-event-names',
      analyzePhase({ ts, node, moduleDoc }) {
        switch (node.kind) {
          case ts.SyntaxKind.ClassDeclaration: {
            const className = node.name.getText();
            const classDoc = moduleDoc?.declarations?.find(declaration => declaration.name === className);

            if (classDoc?.events) {
              classDoc.events.forEach(event => {
                event.reactName = `on${pascalCase(event.name)}`;
                event.eventName = `${pascalCase(event.name)}Event`;
              });
            }
          }
        }
      }
    },

    // Generate custom VS Code data
    customElementVsCodePlugin({
      outdir,
      cssFileName: null,
      // referencesTemplate: (_, tag) => [
      //   {
      //     name: 'Documentation',
      //     url: `https://shoelace.style/components/${tag.replace('sl-', '')}`
      //   }
      // ]
    }),

    customElementJetBrainsPlugin({
      outdir: './dist',
      excludeCss: true,
      packageJson: false,
      // referencesTemplate: (_, tag) => {
      //   return {
      //     name: 'Documentation',
      //     url: `https://shoelace.style/components/${tag.replace('sl-', '')}`
      //   };
      // }
    }),

    customElementVuejsPlugin({
      outdir: './dist/cem-types/vue',
      fileName: 'index.d.ts',
      // componentTypePath: (_, tag) => `../../components/${tag.replace('sl-', '')}/${tag.replace('sl-', '')}.component.js`
      // componentTypePath: (_, tag) => `../../components/${tag.replace('sl-', '')}/${tag.replace('sl-', '')}.component.js`
    })

  ]
}

export default userConfigOptions
