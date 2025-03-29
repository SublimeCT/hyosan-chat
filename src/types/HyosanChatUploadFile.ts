export class HyosanChatUploadFile {
  uid: string
  file?: File
  url?: string
  base64?: string
  size = 0
  name: string
  type: string
  progress = 0
  error = ''
  static updateKey = 0
  constructor(file: File) {
    this.uid = HyosanChatUploadFile.getUid()
    this.size = file.size
    this.name = file.name
    this.type = file.type
  }
  static getUid() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      HyosanChatUploadFile.updateKey++
    )
  }
  static isImage(file: HyosanChatUploadFile) {
    return file.type.startsWith('image/')
  }
  static sizeLabel(file: HyosanChatUploadFile) {
    const size = file.size
    if (size < 1024) {
      return `${size} B`
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`
    }
    if (size < 1024 * 1024 * 1024) {
      return `${(size / 1024 / 1024).toFixed(2)} MB`
    }
  }
}
