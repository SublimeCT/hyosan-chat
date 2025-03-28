export class HyosanChatUploadFile {
  uid: string
  file?: File
  url?: string
  size = 0
  name: string
  progress = 0
  error = ''
  static updateKey = 0
  constructor(file: File) {
    this.uid = HyosanChatUploadFile.getUid()
    this.size = file.size
    this.name = file.name
  }
  static getUid() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      HyosanChatUploadFile.updateKey++
    )
  }
}
