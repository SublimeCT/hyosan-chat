import type { AnyObject } from './helpers'

type GroupType = string

/**
 * @desc 会话数据
 * @descEN Conversation data
 */
export interface Conversation extends AnyObject {
	/**
	 * @desc 唯一标识
	 * @descEN Unique identifier
	 */
	key: string

	/**
	 * @desc 会话名称
	 * @descEN Conversation name
	 */
	label: string

	/**
	 * @desc 会话时间戳
	 * @descEN Conversation timestamp
	 */
	timestamp?: number

	/**
	 * @desc 会话分组类型，与 {@link ConversationsProps.groupable} 联动
	 * @descEN Conversation type
	 */
	group?: GroupType

	/**
	 * @desc 会话图标
	 * @descEN conversation icon
	 */
	icon?: string

	/**
	 * @desc 是否禁用
	 * @descEN Whether to disable
	 */
	disabled?: boolean
}

export type GroupSorter = Parameters<GroupType[]['sort']>[0]

export interface Groupable {
	/**
	 * @desc 分组排序函数
	 * @descEN Group sorter
	 */
	sort?: GroupSorter
	/**
	 * @desc 自定义分组标签渲染
	 * @descEN Semantic custom rendering
	 */
	title?: string
}
