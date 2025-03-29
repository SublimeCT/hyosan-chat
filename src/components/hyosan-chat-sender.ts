import ShoelaceElement from '@/internal/shoelace-element'
import { LocalizeController } from '@/utils/localize'
import { css, html } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'

import '@shoelace-style/shoelace/dist/components/textarea/textarea.js'
import '@shoelace-style/shoelace/dist/components/switch/switch.js'
import '@shoelace-style/shoelace/dist/components/animated-image/animated-image.js'
import '@shoelace-style/shoelace/dist/components/progress-bar/progress-bar.js'
import { HyosanChatUploadFile } from '@/types/HyosanChatUploadFile'
import { ifDefined } from 'lit/directives/if-defined.js'

/** 发送 组件 */
@customElement('hyosan-chat-sender')
export class HyosanChatSender extends ShoelaceElement {
  static styles? = css`
    :host {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      width: var(--hy-main-container-width);
      min-width: var(--hy-main-container-min-width);
      max-width: var(--hy-main-container-max-width);
      margin-bottom: var(--hy-main-container-margin-bottom);
      background-color: var(--sl-color-neutral-100);
      padding: var(--hy-container-padding);
      border-radius: var(--hy-container-padding);
    }
    .container > main {
      width: 100%;
      sl-textarea::part(base) {
        border: none;
        box-shadow: none;
        background-color: transparent;
      }
      sl-textarea::part(textarea) {
        border: none;
        padding-left: 0.5em;
        padding-right: 0.5em;
      }
    }
    .container > footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    section > main {
      width: 100%;
    }
    section > footer {
      width: 100%;
    }
    .option-buttons {
      display: flex;
      align-items: center;
    }
    .option-buttons > sl-button {
      margin-right: var(--hy-container-padding);
    }
    .option-buttons > sl-button:last-of-type {
      margin: 0;
    }
    .attachments-container {
      width: 100%;
      display: flex;
      overflow-x: auto;
      padding-bottom: var(--hy-container-padding);
    }
    .attachments {
      display: flex;
      flex-shrink: 0;
      height: var(--hy-attachments-height);
      max-height: var(--hy-attachments-height);
      min-width: var(--hy-attachments-height);
      padding: var(--hy-container-padding);
      margin-right: var(--hy-container-padding);
      background-color: var(--sl-color-primary-200);
      border-radius: var(--hy-container-radius);
      flex-direction: column;
      position: relative;
      .attachment-image {
        height: 100%;
        max-height: 100%;
      }
      .attachment-file {
        height: 100%;
        max-height: 100%;
        display: flex;
      }
    }
    .attachments .button-remove {
      position: absolute;
      right: 0;
      top: 0;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
    }
    .attachments .button-remove:hover {
      transform: scale(1.2);
    }
    .attachments:last-of-type {
      margin-right: 0;
    }
  `

  /** 本地化控制器 */
  private _localize = new LocalizeController(this)

  /** 是否正在加载中 */
  @property({ reflect: true, type: Boolean })
  loading = false

  /** 是否启用搜索开关 */
  @property({ type: Boolean })
  enableSearch = false

  /** 是否启用搜索功能 */
  @property({ type: Boolean, reflect: true })
  openSearch = false

  /**
   * 是否允许上传文件
   * @since 0.6.0
   */
  @property({ type: Boolean })
  enableUpload = false
  /**
   * 允许上传的文件类型
   * @since 0.6.0
   * @see https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input/file#%E9%99%90%E5%88%B6%E5%85%81%E8%AE%B8%E7%9A%84%E6%96%87%E4%BB%B6%E7%B1%BB%E5%9E%8B
   */
  @property()
  uploadAccept = 'image/*'
  /**
   * capture 属性是一个字符串，如果 accept 属性指出了 input 是图片或者视频类型，则它指定了使用哪个摄像头去获取这些数据。
   * - `user` 表示应该使用前置摄像头和（或）麦克风。
   * - `environment` 表示应该使用后置摄像头和（或）麦克风。
   *
   * 如果缺少此属性，则用户代理可以自由决定做什么。如果请求的前置模式不可用，则用户代理可能退回到其首选的默认模式。
   * @since 0.6.0
   * @see https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/capture
   */
  @property()
  uploadCapture?: 'user' | 'environment'

  /**
   * 是否开启图片多选，部分安卓机型不支持
   * @since 0.6.0
   */
  @property({ type: Boolean })
  uploadMultiple = false

  /**
   * 上传文件时触发
   * @since 0.6.0
   */
  @property({ attribute: false })
  uploadOnChange?: (
    file: File,
    files: Array<File>,
    currentFile: HyosanChatUploadFile,
    currentFiles: Array<HyosanChatUploadFile>,
    onProgress: (progress: number) => void,
    onSuccess: (url: string) => void,
    onFailed: (message: string) => void,
  ) => Promise<void> | void

  /** 是否处于紧凑模式 */
  @property({ type: Boolean })
  compact?: boolean

  /** 输入框内容 */
  @state()
  content = ''

  @state()
  currentFiles: Array<HyosanChatUploadFile> = []
  /** 当前是否有文件正在上传 */
  get currentFilesUploading() {
    return this.currentFiles.length > 0 && this.currentFiles.every(file => file.progress < 1)
  }

  private _handleInput(event: KeyboardEvent) {
    const textarea = event.target as HTMLTextAreaElement
    this.content = textarea.value || ''
  }
  private _handleTextareaKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      this._handleEmitSendMessage()
      this.content = '' // 清空内容
      this.requestUpdate()
    }
  }
  private _handleEmitSendMessage() {
    this.emit('send-message', { detail: { content: this.content, attachments: this.currentFiles } })
    this.content = '' // 清空内容
    this.currentFiles = []
    this.requestUpdate()
  }

  private _handleClickSearch() {
    this.openSearch = !this.openSearch
    this.emit('open-search', { detail: { open: this.openSearch } })
  }

  @query('.inner-file-input')
  private _innerFileInput?: HTMLInputElement
  private get _innerFileInputFiles(): Array<File> | undefined | null {
    return this._innerFileInput?.files
      ? Array.from(this._innerFileInput?.files)
      : null
  }
  private _handleFileChange() {
    if (
      !this._innerFileInput ||
      !this.uploadOnChange ||
      !this.enableUpload ||
      !this._innerFileInputFiles
    )
      return
    // console.log('file change', event, this._innerFileInput.files)
    const _innerFileInputFiles = this._innerFileInputFiles
    if (this._innerFileInput.files) this._innerFileInput.files = new DataTransfer().files
    for (const file of _innerFileInputFiles) {
      const _file = new HyosanChatUploadFile(file)
      this.currentFiles.push(_file)
      this.currentFiles = [...this.currentFiles]
      this.uploadOnChange(
        file,
        _innerFileInputFiles,
        _file,
        this.currentFiles,
        (progress) => {
          _file.progress = progress
          this.currentFiles = [...this.currentFiles]
        },
        (url) => {
          _file.url = url
          _file.progress = 1
          this.currentFiles = [...this.currentFiles]
        },
        (message) => _file.error = message,
      )
    }
  }

  private _handleClickUploadButton() {
    this._innerFileInput?.click()
  }

  private _imageAttachment(file: HyosanChatUploadFile) {
    return html`
      <div class="attachment-image">
        <img style="height: 100%;" src=${file.url || ''}></img>
      </div>
    `
  }
  private _fileAttachment(file: HyosanChatUploadFile) {
    return html`
      <div class="attachment-file">
        <aside>
          <hyosan-icon-wrapper slot="prefix">
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"><path d="M701.44 25.6V256h230.4z"></path><path d="M614.4 343.04V0H143.36c-20.48 0-40.96 20.48-40.96 40.96v936.96c0 25.6 20.48 46.08 40.96 46.08h768c25.6 0 40.96-20.48 40.96-40.96V343.04H614.4z m-343.04-46.08h256v87.04h-256V296.96z m512 512h-512v-87.04h512v87.04z m0-209.92h-512V512h512v87.04z" p-id="2657"></path></svg>
          </hyosan-icon-wrapper>
        </aside>
        <main>
          <div>${file.name}</div>
          <div>${HyosanChatUploadFile.sizeLabel(file)}</div>
        </main>
      </div>
    `
  }

  private _handleRemoveFile(file: HyosanChatUploadFile) {
    this.currentFiles = this.currentFiles.filter((f) => f.uid !== file.uid)
  }

  private _attachments(file: HyosanChatUploadFile) {
    const progress = Math.floor(file.progress)
    const progressHegiht = this.compact ? '2px' : '6px'
    return html`
      <section class="attachments">
        ${HyosanChatUploadFile.isImage(file) ? this._imageAttachment(file) : this._fileAttachment(file)}
        <footer>
          ${
            file.progress !== 1
              ? html`<sl-progress-bar valur=${progress} ?indeterminate=${file.progress === 0} style="--height: ${progressHegiht}"></sl-progress-bar>`
              : undefined
          }
        </footer>
        <div class="button-remove" @click=${() => this._handleRemoveFile(file)}>
          <hyosan-icon-wrapper slot="prefix">
            <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em"><path d="M512 896.211c-212.116 0-384.211-172.095-384.211-384.211S299.884 127.789 512 127.789 896.211 299.884 896.211 512 724.116 896.211 512 896.211zM693.1 602.55 602.55 512l90.55-90.55c6.003-6.003 9.505-14.008 9.505-22.512 0-8.505-3.502-17.009-9.505-23.013L648.074 330.9c-6.003-6.003-14.508-9.505-23.012-9.505-8.505 0-16.51 3.502-22.513 9.505L512 421.45l-90.55-90.55c-6.003-6.003-14.008-9.505-22.512-9.505-8.505 0-17.009 3.502-23.013 9.505L330.9 375.925c-6.003 6.003-9.505 14.508-9.505 23.013 0 8.504 3.502 16.509 9.505 22.512L421.45 512l-90.55 90.55c-6.003 6.003-9.505 14.008-9.505 22.513 0 8.504 3.502 17.009 9.505 23.012l45.025 45.025c6.003 6.003 14.508 9.505 23.013 9.505 8.504 0 16.509-3.502 22.512-9.505L512 602.55l90.55 90.55c6.003 6.003 14.008 9.505 22.513 9.505 8.504 0 17.009-3.502 23.012-9.505l45.025-45.025c6.003-6.003 9.505-14.508 9.505-23.012C702.604 616.558 699.103 608.553 693.1 602.55z" p-id="5422"></path></svg>
          </hyosan-icon-wrapper>
        </div>
      </section>
    `
  }
  private _attachmentsContainer() {
    if (!this.enableUpload) return
    if (this.currentFiles.length === 0) return
    const attachments = this.currentFiles.map(file => this._attachments(file))
    return html`
      <div class="attachments-container">
        ${attachments}
      </div>
    `
  }

  render() {
    return html`
      <div class="container">
        ${this._attachmentsContainer()}
        <main>
          <sl-textarea aria-label=${this._localize.term('ariaSendInput')} placeholder=${this._localize.term('sendTips')} value=${this.content} rows="2" resize="none" @sl-input=${this._handleInput} @keydown=${this._handleTextareaKeyDown}></sl-textarea>
        </main>
        <footer>
          <div class="option-buttons">
            <!-- <sl-switch checked>Checked</sl-switch> -->
            ${
              this.enableSearch
                ? html`
                  <sl-button
                    size="small"
                    variant=${this.openSearch ? 'primary' : 'default'}
                    @click=${this._handleClickSearch}>
                      <hyosan-icon-wrapper slot="prefix">
                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8492" width="1em" height="1em"><path d="M512 56.888889C261.688889 56.888889 56.888889 261.688889 56.888889 512s204.8 455.111111 455.111111 455.111111 455.111111-204.8 455.111111-455.111111-204.8-455.111111-455.111111-455.111111z m398.222222 426.666667h-164.977778c0-73.955556-11.377778-136.533333-28.444444-199.111112 28.444444-17.066667 56.888889-34.133333 79.644444-56.888888 68.266667 73.955556 108.088889 159.288889 113.777778 256z m-216.177778 0H540.444444V335.644444c45.511111 0 91.022222-11.377778 130.844445-28.444444 11.377778 56.888889 22.755556 113.777778 22.755555 176.355556z m-364.088888 56.888888h153.6v91.022223c-51.2 5.688889-96.711111 11.377778-142.222223 34.133333-5.688889-39.822222-11.377778-85.333333-11.377777-125.155556z m22.755555-227.555555c45.511111 11.377778 85.333333 22.755556 130.844445 22.755555v147.911112H329.955556c0-62.577778 11.377778-119.466667 22.755555-170.666667z m187.733333 227.555555h153.6c0 45.511111-5.688889 85.333333-11.377777 125.155556-45.511111-17.066667-91.022222-28.444444-142.222223-34.133333V540.444444z m221.866667-341.333333c-17.066667 17.066667-39.822222 28.444444-56.888889 39.822222-17.066667-39.822222-34.133333-79.644444-56.888889-108.088889 39.822222 17.066667 79.644444 39.822222 113.777778 68.266667z m-108.088889 62.577778c-39.822222 11.377778-73.955556 22.755556-113.777778 22.755555V113.777778c45.511111 17.066667 85.333333 73.955556 113.777778 147.911111zM483.555556 113.777778v170.666666c-39.822222 0-79.644444-11.377778-113.777778-22.755555 28.444444-73.955556 68.266667-130.844444 113.777778-147.911111zM318.577778 238.933333c-17.066667-11.377778-39.822222-22.755556-56.888889-39.822222 34.133333-28.444444 73.955556-51.2 119.466667-68.266667-22.755556 28.444444-45.511111 68.266667-62.577778 108.088889z m-96.711111-5.688889c22.755556 22.755556 51.2 39.822222 79.644444 56.888889-17.066667 56.888889-28.444444 125.155556-28.444444 199.111111H113.777778c5.688889-102.4 45.511111-187.733333 108.088889-256z m51.2 307.2c0 51.2 5.688889 102.4 17.066666 147.911112-34.133333 17.066667-68.266667 45.511111-96.711111 73.955555-45.511111-62.577778-73.955556-142.222222-79.644444-221.866667h159.288889zM227.555556 796.444444c22.755556-22.755556 45.511111-39.822222 73.955555-56.888888 17.066667 62.577778 45.511111 113.777778 73.955556 153.6-51.2-22.755556-102.4-56.888889-147.911111-96.711112z m125.155555-85.333333c45.511111-17.066667 85.333333-28.444444 130.844445-28.444444v227.555555c-51.2-17.066667-102.4-96.711111-130.844445-199.111111zM540.444444 910.222222v-227.555555c45.511111 5.688889 91.022222 11.377778 130.844445 28.444444-28.444444 102.4-79.644444 182.044444-130.844445 199.111111z m102.4-17.066666c28.444444-39.822222 56.888889-91.022222 73.955556-153.6 28.444444 17.066667 51.2 34.133333 73.955556 56.888888-39.822222 39.822222-91.022222 73.955556-147.911112 96.711112z m187.733334-136.533334c-28.444444-28.444444-62.577778-51.2-96.711111-73.955555 11.377778-45.511111 17.066667-96.711111 17.066666-147.911111H910.222222c-5.688889 85.333333-34.133333 164.977778-79.644444 221.866666z" fill="currentColor" p-id="8493"></path></svg>
                      </hyosan-icon-wrapper>
                      ${this._localize.term('enableSearch')}
                  </sl-button>
                `
                : undefined
            }
            ${
              this.enableUpload
                ? html`
                  <sl-button
                    size="small"
                    @click=${this._handleClickUploadButton}>
                      <hyosan-icon-wrapper slot="prefix">
                        <svg viewBox="0 0 1191 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"><path d="M778.128291 321.871127a57.9584 57.9584 0 0 1 80.039564 0 53.434182 53.434182 0 0 1 0 77.377164L498.371491 747.147636c-54.290618 52.503273-141.125818 67.677091-209.082182 1.973528-66.038691-63.860364-62.743273-165.664582-11.487418-215.2448L756.9408 70.581527c89.236945-86.295273 237.568-104.299055 353.261382 7.5776 115.674764 111.858036 98.080582 257.210182 9.327709 343.021382l-522.202764 504.925091c-116.661527 112.826182-322.746182 149.578473-484.258909-6.609455-161.233455-155.890036-132.747636-376.906473-22.565236-483.439709L505.986327 34.313309a57.9584 57.9584 0 0 1 80.020946 0 53.434182 53.434182 0 0 1 0 77.377164L170.542545 513.4336c-21.410909 20.703418-47.104 73.337018-53.992727 126.603636-9.309091 72.145455 13.069964 140.6976 76.557964 202.081746 109.605236 105.974691 246.765382 81.529018 324.217018 6.628073l522.202764-504.925091c48.146618-46.545455 57.474327-123.680582-9.309091-188.285673-66.466909-64.269964-144.402618-54.811927-193.256728-7.5776L357.841455 611.234909c-8.154764 7.894109-9.197382 40.475927 11.506036 60.471855 16.197818 15.676509 33.9968 12.585891 49.021673-1.954909l359.777745-347.880728z" fill="currentColor" p-id="7911"></path></svg>
                      </hyosan-icon-wrapper>
                      ${this._localize.term('uploadAttachment')}
                  </sl-button>
                  <input
                    class="inner-file-input"
                    type="file"
                    accept=${this.uploadAccept}
                    capture=${ifDefined(this.uploadCapture)}
                    ?multiple=${this.uploadMultiple}
                    @change=${this._handleFileChange}
                    style="display: none;" />
                `
                : undefined
            }
          </div>
          <div class="action-buttons">
            <sl-button variant="primary" ?loading=${this.loading || this.currentFilesUploading} ?disabled=${!this.content || this.loading} circle @click=${this._handleEmitSendMessage}>
              <hyosan-icon-wrapper>
                <svg t="1741252222107" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5069" width="1em" height="1em" fill="currentColor"><path d="M133.8 579l-44.4-44.4c-18.8-18.8-18.8-49.2 0-67.8L478 78c18.8-18.8 49.2-18.8 67.8 0l388.6 388.6c18.8 18.8 18.8 49.2 0 67.8L890 578.8c-19 19-50 18.6-68.6-0.8L592 337.2V912c0 26.6-21.4 48-48 48h-64c-26.6 0-48-21.4-48-48V337.2L202.4 578.2c-18.6 19.6-49.6 20-68.6 0.8z" p-id="5070"></path></svg>
              </hyosan-icon-wrapper>
            </sl-button>
          </div>
        </footer>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hyosan-chat-sender': HyosanChatSender
  }
  interface GlobalEventHandlersEventMap {
    /** 用户点击发送按钮 */
    'send-message': CustomEvent<{ content: string, attachments: HyosanChatUploadFile[] }>
    /** 用户点击 搜索开关 按钮时触发 */
    'open-search': CustomEvent<{ open: boolean }>
  }
}
