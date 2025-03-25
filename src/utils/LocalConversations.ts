import type { BaseServiceMessages } from '@/service/BaseService'
import type { Conversation } from '@/types/conversations'

/**
 * IndexedDB 数据库管理器
 * @description 封装 IndexedDB 的基本操作
 */
class DatabaseManager {
  /**
   * IndexedDB 数据库实例
   */
  private static db: IDBDatabase | null = null

  /**
   * 数据库名称
   */
  private static dbName = 'hyosan-chat-db'

  /**
   * 数据库版本
   */
  private static dbVersion = 1

  /**
   * 初始化 IndexedDB 数据库
   * @returns 初始化完成后的 Promise
   */
  static async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      request.addEventListener(
        'upgradeneeded',
        (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('conversations')) {
            const store = db.createObjectStore('conversations', { keyPath: 'key' })
            store.createIndex('createTime', 'createTime', { unique: false })
          }
          if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', { keyPath: 'conversationId' })
          }
        },
      )
      request.addEventListener('success', (event: Event) => {
        DatabaseManager.db = (event.target as IDBOpenDBRequest).result
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
  static getStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly',
  ): IDBObjectStore {
    if (!DatabaseManager.db) {
      throw new Error('Database not initialized')
    }
    return DatabaseManager.db.transaction(storeName, mode).objectStore(storeName)
  }

  /**
   * 执行对象存储的请求操作
   * @param storeName 存储空间名称
   * @param method 操作方法 (如 'put', 'get', 'delete')
   * @param data 操作数据 (可选)
   * @param mode 事务模式 (默认为 'readonly')
   * @returns 操作结果的 Promise
   */
  static executeStoreRequest<T>(
    storeName: string,
    method: 'put' | 'get' | 'delete' | 'getAll' | 'openCursor',
    data?: any,
    mode: IDBTransactionMode = method === 'put' || method === 'delete' ? 'readwrite' : 'readonly',
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const store = DatabaseManager.getStore(storeName, mode)
      const request = store[method](data)
      request.addEventListener('success', () => resolve(request.result as T))
      request.addEventListener('error', () => reject(request.error))
    })
  }
}

/**
 * 本地化会话和消息存储类
 * @description 使用 IndexedDB 存储会话和消息
 */
export class LocalConversations {
  /**
   * 保存会话
   * @param conversation 会话对象
   * @returns 保存操作的 Promise
   */
  public static async saveConversation(conversation: Conversation): Promise<void> {
    await DatabaseManager.initDB()
    const conversationWithTime = {
      ...conversation,
      createTime: Date.now(), // 添加时间戳字段
    }
    return DatabaseManager.executeStoreRequest<void>('conversations', 'put', conversationWithTime)
  }

  /**
   * 读取所有会话，按时间戳降序排列
   * @returns 会话对象数组的 Promise
   */
  public static async getConversations(): Promise<Conversation[] | null> {
    await DatabaseManager.initDB()
    const store = DatabaseManager.getStore('conversations', 'readonly')
    const index = store.index('createTime')
    const request = index.openCursor(null, 'prev') // 使用游标按降序获取
    const conversations: Conversation[] = []
    return new Promise((resolve, reject) => {
      request.addEventListener('success', () => {
        const cursor = request.result
        function continueCursor() {
          if (cursor) {
            conversations.push(cursor.value)
            cursor.continue()
          } else {
            resolve(conversations.length > 0 ? conversations : null)
          }
        }
        continueCursor()
      })
      request.addEventListener('error', () => reject(request.error))
    })
  }

  /**
   * 获取某一条会话
   * @param key 会话的 key
   * @returns 会话对象的 Promise
   */
  public static async getConversationById(key: string): Promise<Conversation | null> {
    await DatabaseManager.initDB()
    const result = await DatabaseManager.executeStoreRequest<any>('conversations', 'get', key)
    return result || null
  }

  /**
   * 更新会话
   * @param conversation 会话对象
   * @returns 更新操作的 Promise
   */
  public static async updateConversation(conversation: Conversation): Promise<void> {
    return this.saveConversation(conversation)
  }

  /**
   * 删除会话
   * @param key 会话的 key
   * @returns 删除操作的 Promise
   */
  public static async deleteConversation(key: string): Promise<void> {
    await DatabaseManager.initDB()
    // 同步删除该 conversation 下的所有 messages
    await this.deleteMessages(key)
    return DatabaseManager.executeStoreRequest<void>('conversations', 'delete', key)
  }

  /**
   * 保存消息
   * @param conversationId 会话 ID
   * @param messages 消息数组
   * @returns 保存操作的 Promise
   */
  public static async saveMessages(
    conversationId: string,
    messages: BaseServiceMessages,
  ): Promise<void> {
    await DatabaseManager.initDB()
    return DatabaseManager.executeStoreRequest<void>('messages', 'put', { conversationId, messages })
  }

  /**
   * 读取消息
   * @param conversationId 会话 ID
   * @returns 消息数组的 Promise
   */
  public static async getMessages(
    conversationId: string,
  ): Promise<BaseServiceMessages | null> {
    await DatabaseManager.initDB()
    const result = await DatabaseManager.executeStoreRequest<any>('messages', 'get', conversationId)
    return result?.messages || null
  }

  /**
   * 更新消息
   * @param conversationId 会话 ID
   * @param messages 消息数组
   * @returns 更新操作的 Promise
   */
  public static async updateMessages(
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
  public static async deleteMessages(conversationId: string): Promise<void> {
    await DatabaseManager.initDB()
    return DatabaseManager.executeStoreRequest<void>('messages', 'delete', conversationId)
  }
}