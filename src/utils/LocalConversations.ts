import type { BaseServiceMessages } from '@/service/BaseService'
import type { Conversation } from '@/types/conversations'

/**
 * 本地化会话和消息存储类
 * @description 使用 IndexedDB 存储会话和消息
 */
export class LocalConversations {
  private db: IDBDatabase | null = null

  constructor() {
    this.initDB()
  }

  /**
   * 初始化 IndexedDB 数据库
   */
  private initDB() {
    const request = indexedDB.open('hyosan-chat-db', 1)

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBRequest<IDBDatabase>)?.result

      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'key' })
      }

      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'conversationId' })
      }
    }

    request.onsuccess = (event: Event) => {
      this.db = (event.target as IDBOpenDBRequest).result
    }

    request.onerror = (event: Event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error)
    }
  }

  /**
   * 获取对象存储空间
   * @param storeName 存储空间名称
   * @param mode 事务模式 (默认为 'readonly')
   * @returns 对象存储空间
   */
  private getStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly',
  ): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db.transaction(storeName, mode).objectStore(storeName)
  }

  /**
   * 保存会话
   * @param conversation 会话对象
   */
  public async saveConversation(conversation: Conversation) {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('conversations', 'readwrite')
      const conversationWithTime = {
        ...conversation,
        createTime: new Date(),
      }
      const request = store.put(conversationWithTime)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 读取所有会话
   * @returns 会话对象数组
   */
  public async getConversations(): Promise<Conversation[]> {
    return new Promise<Conversation[]>((resolve, reject) => {
      const store = this.getStore('conversations')
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 更新会话
   * @param conversation 会话对象
   */
  public async updateConversation(conversation: Conversation) {
    return this.saveConversation(conversation)
  }

  /**
   * 删除会话
   * @param key 会话的 key
   */
  public async deleteConversation(key: string) {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('conversations', 'readwrite')
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 保存消息
   * @param conversationId 会话 ID
   * @param messages 消息数组
   */
  public async saveMessages(
    conversationId: string,
    messages: BaseServiceMessages,
  ) {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('messages', 'readwrite')
      const request = store.put({ conversationId, messages })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 读取消息
   * @param conversationId 会话 ID
   * @returns 消息数组
   */
  public async getMessages(
    conversationId: string,
  ): Promise<BaseServiceMessages> {
    return new Promise<BaseServiceMessages>((resolve, reject) => {
      const store = this.getStore('messages')
      const request = store.get(conversationId)

      request.onsuccess = () => resolve(request.result?.messages || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * 更新消息
   * @param conversationId 会话 ID
   * @param messages 消息数组
   */
  public async updateMessages(
    conversationId: string,
    messages: BaseServiceMessages,
  ) {
    return this.saveMessages(conversationId, messages)
  }

  /**
   * 删除消息
   * @param conversationId 会话 ID
   */
  public async deleteMessages(conversationId: string) {
    return new Promise<void>((resolve, reject) => {
      const store = this.getStore('messages', 'readwrite')
      const request = store.delete(conversationId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}
