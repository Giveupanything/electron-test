/*
 * @Author: dushuai
 * @Date: 2025-03-17 15:05:00
 * @LastEditors: dushuai
 * @LastEditTime: 2025-03-19 16:41:00
 * @description: 对话相关类型
 */
declare namespace Chat {

    type ConversationItem = {
        id: string
        name: string
        inputs: Record<string, any> | null
        introduction: string
    }

    /**
     * User Input Form Item
     */
    type UserInputFormItem = {
        'text-input': TextTypeFormItem
    } | {
        'select': SelectTypeFormItem
    } | {
        'paragraph': TextTypeFormItem
    }

    type PromptVariable = {
        key: string
        name: string
        type: string
        default?: string | number
        options?: string[]
        max_length?: number
        required: boolean
    }

    type PromptConfig = {
        prompt_template: string
        prompt_variables: PromptVariable[]
    }

    type MessageRating = (['like', 'dislike', null])[number]

    type Feedbacktype = {
        rating: MessageRating
        content?: string | null
    }

    type MessageMore = {
        time: string
        tokens: number
        latency: number | string
    }

    type IChatItem = {
        id: string
        content: string
        /**
         * Specific message type
         */
        isAnswer: boolean
        /**
         * The user feedback result of this message
         */
        feedback?: Feedbacktype
        /**
         * The admin feedback result of this message
         */
        adminFeedback?: Feedbacktype
        /**
         * Whether to hide the feedback area
         */
        feedbackDisabled?: boolean
        /**
         * More information about this message
         */
        more?: MessageMore
        annotation?: Annotation
        useCurrentUserAvatar?: boolean
        isOpeningStatement?: boolean
        suggestedQuestions?: string[]
        log?: { role: string; text: string }[]
        agent_thoughts?: ThoughtItem[]
        message_files?: FileEntity[]
        citation?: any[]
        allFiles?: any[]
        parentMessageId?: string
        parentMessageId?: string | null
        siblingCount?: number
        siblingIndex?: number
        prevSibling?: string
        nextSibling?: string
    }

    type LogAnnotation = {
        content: string
        account: {
          id: string
          name: string
          email: string
        }
        created_at: number
    }

    type Annotation = {
        id: string
        authorName: string
        logAnnotation?: LogAnnotation
        created_at?: number
    }

    type ThoughtItem = {
        id: string
        tool: string // plugin or dataset. May has multi.
        thought: string
        tool_input: string
        message_id: string
        observation: string
        position: number
        files?: string[]
        message_files?: VisionFile[]
    }

    enum TransferMethod {
        all = 'all',
        local_file = 'local_file',
        remote_url = 'remote_url',
      }

    type VisionFile = {
        id?: string
        type: string
        transfer_method: TransferMethod;
        url: string
        upload_file_id: string
        belongs_to?: string
    }

    type ChatItem = IChatItem & {
        isError?: boolean
        workflow_run_id?: string
        workflowProcess?: WorkflowProcess
    }

    enum WorkflowRunningStatus {
        Waiting = 'waiting',
        Running = 'running',
        Succeeded = 'succeeded',
        Failed = 'failed',
        Stopped = 'stopped',
    }

    type WorkflowProcess = {
        status: WorkflowRunningStatus
        tracing: NodeTracing[]
        expand?: boolean // for UI
    }

    enum BlockEnum {
        Start = 'start',
        End = 'end',
        Answer = 'answer',
        LLM = 'llm',
        KnowledgeRetrieval = 'knowledge-retrieval',
        QuestionClassifier = 'question-classifier',
        IfElse = 'if-else',
        Code = 'code',
        TemplateTransform = 'template-transform',
        HttpRequest = 'http-request',
        VariableAssigner = 'variable-assigner',
        Tool = 'tool',
    }

    type NodeTracing = {
        id: string
        index: number
        predecessor_node_id: string
        node_id: string
        node_type: BlockEnum
        title: string
        inputs: any
        process_data: any
        outputs?: any
        status: string
        error?: string
        elapsed_time: number
        execution_metadata: {
            total_tokens: number
            total_price: number
            currency: string
            iteration_id?: string
            iteration_index?: number
            parallel_id?: string
            parallel_start_node_id?: string
            parent_parallel_id?: string
            parent_parallel_start_node_id?: string
            parallel_mode_run_id?: string
            iteration_duration_map?: IterationDurationMap
            error_strategy?: ErrorHandleTypeEnum
            agent_log?: AgentLogItem[]
            tool_info?: {
              agent_strategy?: string
              icon?: string
            }
        }
        created_at: number
        created_by: {
          id: string
          name: string
          email: string
        }
        finished_at: number
        extras?: any
        expand?: boolean // for UI
    }
}