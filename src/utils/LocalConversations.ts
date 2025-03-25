import type { BaseServiceMessages } from '@/service/BaseService'
import type { Conversation } from '@/types/conversations'

/**
 * 本地化会话和消息存储类
 * @description 使用 IndexedDB 存储会话和消息
 */
export class LocalConversations {
  /**
   * IndexedDB 数据库实例
   */
  private db: IDBDatabase | null = null

  /**
   * 初始化 IndexedDB 数据库
   * @returns 初始化完成后的 Promise
   */
  public async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('hyosan-chat-db', 1)
      request.addEventListener(
        'upgradeneeded',
        (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('conversations')) {
            db.createObjectStore('conversations', { keyPath: 'key' })
          }
          if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', { keyPath: 'conversationId' })
          }
        },
      )
      request.addEventListener('success', (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve()
      })
      request.addEventListener('error', (event: Event) => {
        console.error(
          'Database error:',
          (event.target as IDBOpenDBRequest).error,
        )
        reject((event.target as IDBOpenDBRequest).error)
      })
    })
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
   * @returns 保存操作的 Promise
   */
  public async saveConversation(conversation: Conversation): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('conversations', 'readwrite')
      const conversationWithTime = {
        ...conversation,
        createTime: new Date(),
      }
      const request = store.put(conversationWithTime)
      request.addEventListener('success', () => resolve())
      request.addEventListener('error', () => reject(request.error))
    })
  }

  /**
   * 读取所有会话
   * @returns 会话对象数组的 Promise
   */
  public async getConversations(): Promise<Conversation[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('conversations')
      const request = store.getAll()
      request.addEventListener('success', () => resolve(request.result))
      request.addEventListener('error', () => reject(request.error))
    })
  }

  /**
   * 更新会话
   * @param conversation 会话对象
   * @returns 更新操作的 Promise
   */
  public async updateConversation(conversation: Conversation): Promise<void> {
    return this.saveConversation(conversation)
  }

  /**
   * 删除会话
   * @param key 会话的 key
   * @returns 删除操作的 Promise
   */
  public async deleteConversation(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('conversations', 'readwrite')
      const request = store.delete(key)
      request.addEventListener('success', () => resolve())
      request.addEventListener('error', () => reject(request.error))
    })
  }

  /**
   * 保存消息
   * @param conversationId 会话 ID
   * @param messages 消息数组
   * @returns 保存操作的 Promise
   */
  public async saveMessages(
    conversationId: string,
    messages: BaseServiceMessages,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('messages', 'readwrite')
      const request = store.put({ conversationId, messages })
      request.addEventListener('success', () => resolve())
      request.addEventListener('error', () => reject(request.error))
    })
  }

  /**
   * 读取消息
   * @param conversationId 会话 ID
   * @returns 消息数组的 Promise
   */
  public async getMessages(
    conversationId: string,
  ): Promise<BaseServiceMessages> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('messages')
      const request = store.get(conversationId)
      request.addEventListener('success', () =>
        resolve(request.result?.messages || []),
      )
      request.addEventListener('error', () => reject(request.error))
    })
  }

  /**
   * 更新消息
   * @param conversationId 会话 ID
   * @param messages 消息数组
   * @returns 更新操作的 Promise
   */
  public async updateMessages(
    conversationId: string,
    messages: BaseServiceMessages,
  ): Promise<void> {
    return this.saveMessages(conversationId, messages)
  }

  /**
   * 删除消息
   * @param conversationId 会话 ID
   * @returns 删除操作的 Promise
   */
  public async deleteMessages(conversationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('messages', 'readwrite')
      const request = store.delete(conversationId)
      request.addEventListener('success', () => resolve())
      request.addEventListener('error', () => reject(request.error))
    })
  }
}
