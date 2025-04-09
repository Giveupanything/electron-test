import type { ReactNode } from 'react'
export type SiteInfo = {
  title: string
  chat_color_theme?: string
  chat_color_theme_inverted?: boolean
  icon_type?: AppIconType | null
  icon?: string
  icon_background?: string | null
  icon_url?: string | null
  description?: string
  prompt_public?: boolean
  copyright?: string
  privacy_policy?: string
  custom_disclaimer?: string
  show_workflow_steps?: boolean
  use_icon_as_answer_icon?: boolean
}

export type AppData = {
  app_id: string
  can_replace_logo?: boolean
  custom_config?: Record<string, any>
  enable_site?: boolean
  end_user_id?: string
  site: SiteInfo
}

export type ChatConfig = Omit<ModelConfig, 'model'> & {
  supportAnnotation?: boolean
  appId?: string
  supportFeedback?: boolean
  supportCitationHitInfo?: boolean
}

export type OnSend = {
  (message: string, files?: FileEntity[]): void
  (message: string, files: FileEntity[] | undefined, isRegenerate: boolean, lastAnswer?: ChatItem | null): void
}

export enum InputVarType {
  textInput = 'text-input',
  paragraph = 'paragraph',
  select = 'select',
  number = 'number',
  url = 'url',
  files = 'files',
  json = 'json', // obj, array
  contexts = 'contexts', // knowledge retrieval
  iterator = 'iterator', // iteration input
  singleFile = 'file',
  multiFiles = 'file-list',
}

export interface InputForm {
  type: InputVarType
  label: string
  variable: any
  required: boolean
  [key: string]: any
}

export type OnRegenerate = (chatItem: ChatItem) => void

export type Feedback = {
  rating: 'like' | 'dislike' | null
}
import type { ThemeBuilder } from '@/components/base/audio-btn/theme/theme-context'

export type ChatProps = {
  appData?: AppData
  chatList: ChatItem[]
  config?: ChatConfig
  isResponding?: boolean
  noStopResponding?: boolean
  onStopResponding?: () => void
  noChatInput?: boolean
  onSend?: OnSend
  inputs?: Record<string, any>
  inputsForm?: InputForm[]
  onRegenerate?: OnRegenerate
  chatContainerClassName?: string
  chatContainerInnerClassName?: string
  chatFooterClassName?: string
  chatFooterInnerClassName?: string
  suggestedQuestions?: string[]
  showPromptLog?: boolean
  questionIcon?: ReactNode
  answerIcon?: ReactNode
  allToolIcons?: Record<string, string | Emoji>
  onAnnotationEdited?: (question: string, answer: string, index: number) => void
  onAnnotationAdded?: (annotationId: string, authorName: string, question: string, answer: string, index: number) => void
  onAnnotationRemoved?: (index: number) => void
  chatNode?: ReactNode
  onFeedback?: (messageId: string, feedback: Feedback) => void
  chatAnswerContainerInner?: string
  hideProcessDetail?: boolean
  hideLogModal?: boolean
  themeBuilder?: ThemeBuilder
  switchSibling?: (siblingMessageId: string) => void
  showFeatureBar?: boolean
  showFileUpload?: boolean
  onFeatureBarClick?: (state: boolean) => void
  noSpacing?: boolean
}
export type AppIconType = 'image' | 'emoji'
export const AppModes = ['advanced-chat', 'agent-chat', 'chat', 'completion', 'workflow'] as const
export type AppMode = typeof AppModes[number]
export type SiteConfig = {
  /** Application URL Identifier: `http://dify.app/{access_token}` */
  access_token: string
  /** Public Title */
  title: string
  /** Application Description will be shown in the Client  */
  description: string
  /** Define the color in hex for different elements of the chatbot, such as:
   * The header, the button , etc.
    */
  chat_color_theme: string
  /** Invert the color of the theme set in chat_color_theme */
  chat_color_theme_inverted: boolean
  /** Author */
  author: string
  /** User Support Email Address */
  support_email: string
  /**
   * Default Language, e.g. zh-Hans, en-US
   * Use standard RFC 4646, see https://www.ruanyifeng.com/blog/2008/02/codes_for_language_names.html
   */
  /**  Custom Domain */
  customize_domain: string
  /** Theme */
  theme: string
  /** Custom Token strategy Whether Terminal Users can choose their OpenAI Key */
  customize_token_strategy: 'must' | 'allow' | 'not_allow'
  /** Is Prompt Public */
  prompt_public: boolean
  /** Web API and APP Base Domain Name */
  app_base_url: string
  /** Copyright */
  copyright: string
  /** Privacy Policy */
  privacy_policy: string
  /** Custom Disclaimer */
  custom_disclaimer: string

  icon_type: AppIconType | null
  icon: string
  icon_background: string | null
  icon_url: string | null

  show_workflow_steps: boolean
  use_icon_as_answer_icon: boolean
}
export type App = {
  /** App ID */
  id: string
  /** Name */
  name: string
  /** Description */
  description: string

  /**
   * Icon Type
   * @default 'emoji'
  */
  icon_type: AppIconType | null
  /** Icon, stores file ID if icon_type is 'image' */
  icon: string
  /** Icon Background, only available when icon_type is null or 'emoji' */
  icon_background: string | null
  /** Icon URL, only available when icon_type is 'image' */
  icon_url: string | null
  /** Whether to use app icon as answer icon */
  use_icon_as_answer_icon: boolean

  /** Mode */
  mode: AppMode
  /** Enable web app */
  enable_site: boolean
  /** Enable web API */
  enable_api: boolean
  /** API requests per minute, default is 60 */
  api_rpm: number
  /** API requests per hour, default is 3600 */
  api_rph: number
  /** Whether it's a demo app */
  is_demo: boolean
  /** Model configuration */
  model_config: ModelConfig
  app_model_config: ModelConfig
  /** Timestamp of creation */
  created_at: number
  /** Web Application Configuration */
  site: SiteConfig
  /** api site url */
  api_base_url: string
  tags: Tag[]
  workflow?: {
    id: string
    created_at: number
    created_by?: string
    updated_at: number
    updated_by?: string
  }
}

export type AppSSO = {
  enable_sso: boolean
}

export type DefaultModelResponse = {
  model: string
  model_type: ModelTypeEnum
  provider: {
    provider: string
    icon_large: TypeWithI18N
    icon_small: TypeWithI18N
  }
}

export type DefaultModel = {
  provider: string
  model: string
}

export type Model = {
  /** LLM provider, e.g., OPENAI */
  provider: string
  /** Model name, e.g, gpt-3.5.turbo */
  name: string
  mode: ModelModeType
  /** Default Completion call parameters */
  completion_params: CompletionParams
}

export enum ModelTypeEnum {
  textGeneration = 'llm',
  textEmbedding = 'text-embedding',
  rerank = 'rerank',
  speech2text = 'speech2text',
  moderation = 'moderation',
  tts = 'tts',
}

export enum ModelFeatureEnum {
  toolCall = 'tool-call',
  multiToolCall = 'multi-tool-call',
  agentThought = 'agent-thought',
  vision = 'vision',
  video = 'video',
  document = 'document',
  audio = 'audio',
}

export enum ConfigurationMethodEnum {
  predefinedModel = 'predefined-model',
  customizableModel = 'customizable-model',
  fetchFromRemote = 'fetch-from-remote',
}

export enum ModelStatusEnum {
  active = 'active',
  noConfigure = 'no-configure',
  quotaExceeded = 'quota-exceeded',
  noPermission = 'no-permission',
  disabled = 'disabled',
}

export type ModelItem = {
  model: string
  label: TypeWithI18N
  model_type: ModelTypeEnum
  features?: ModelFeatureEnum[]
  fetch_from: ConfigurationMethodEnum
  status: ModelStatusEnum
  model_properties: Record<string, string | number>
  load_balancing_enabled: boolean
  deprecated?: boolean
}

export type ModelN = {
  provider: string
  icon_large: TypeWithI18N
  icon_small: TypeWithI18N
  label: TypeWithI18N
  models: ModelItem[]
  status: ModelStatusEnum
}

export type PromptVariable = {
  key: string
  name: string
  type: string // "string" | "number" | "select",
  default?: string | number
  required?: boolean
  options?: string[]
  max_length?: number
  is_context_var?: boolean
  enabled?: boolean
  config?: Record<string, any>
  icon?: string
  icon_background?: string
}

export enum Theme {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export type PromptConfig = {
  prompt_template: string
  prompt_variables: PromptVariable[]
}

export enum Resolution {
  low = 'low',
  high = 'high',
}

export enum TransferMethod {
  all = 'all',
  local_file = 'local_file',
  remote_url = 'remote_url',
}

export type ImageFile = {
  type: TransferMethod
  _id: string
  fileId: string
  file?: File
  progress: number
  url: string
  base64Url?: string
  deleted?: boolean
}

export type VisionSettings = {
  enabled: boolean
  number_limits: number
  detail: Resolution
  transfer_methods: TransferMethod[]
  image_file_size_limit?: number | string
}

export type VisionFile = {
  id?: string
  type: string
  transfer_method: TransferMethod
  url: string
  upload_file_id: string
}

export type TextTypeFormItem = {
  label: string
  variable: string
  required: boolean
  max_length: number
}

export type SelectTypeFormItem = {
  label: string
  variable: string
  required: boolean
  options: string[]
}
/**
 * User Input Form Item
 */
export type UserInputFormItem = {
  'text-input': TextTypeFormItem
} | {
  select: SelectTypeFormItem
} | {
  paragraph: TextTypeFormItem
}

export enum TaskStatus {
  pending = 'pending',
  running = 'running',
  completed = 'completed',
  failed = 'failed',
}

export type TaskParam = {
  inputs: Record<string, any>
}

export type Task = {
  id: number
  status: TaskStatus
  params: TaskParam
}

export enum NodeRunningStatus {
  NotStart = 'not-start',
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
}

export enum WorkflowRunningStatus {
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Stopped = 'stopped',
}

export const MessageRatings = ['like', 'dislike', null] as const;
export type MessageRating = typeof MessageRatings[number]
export type Feedbacktype = {
  rating: MessageRating
  content?: string | null
  user?: string 
}

export enum BlockEnum {
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
  ParameterExtractor = 'parameter-extractor',
  Iteration = 'iteration',
  DocExtractor = 'document-extractor',
  ListFilter = 'list-operator',
  IterationStart = 'iteration-start',
  Assigner = 'assigner', // is now named as VariableAssigner
  Agent = 'agent',
}

export type NodeTracing = {
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
  retryDetail?: NodeTracing[] // retry detail
  retry_index?: number
  parallelDetail?: { // parallel detail. if is in parallel, this field will be set
    isParallelStartNode?: boolean
    parallelTitle?: string
    branchTitle?: string
    children?: NodeTracing[]
  }
  parallel_id?: string
  parallel_start_node_id?: string
  parent_parallel_id?: string
  parent_parallel_start_node_id?: string
  agentLog?: AgentLogItemWithChildren[] // agent log
}

export type FileEntity = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  transferMethod: TransferMethod
  supportFileType: string
  originalFile?: File
  uploadedId?: string
  base64Url?: string
  url?: string
  isRemote?: boolean
}

export type WorkflowProcess = {
  status: WorkflowRunningStatus
  tracing: NodeTracing[]
  expand?: boolean // for UI
  resultText?: string
  files?: FileEntity[]
}

export interface EnabledOrDisabled {
  enabled?: boolean
}

export type FileUploadConfigResponse = {
  batch_count_limit: number
  image_file_size_limit?: number | string // default is 10MB
  file_size_limit: number // default is 15MB
  audio_file_size_limit?: number // default is 50MB
  video_file_size_limit?: number // default is 100MB
  workflow_file_upload_limit?: number // default is 10
}

export type FileUpload = {
  image?: EnabledOrDisabled & {
    detail?: Resolution
    number_limits?: number
    transfer_methods?: TransferMethod[]
  }
  allowed_file_types?: string[]
  allowed_file_extensions?: string[]
  allowed_file_upload_methods?: TransferMethod[]
  number_limits?: number
  fileUploadConfig?: FileUploadConfigResponse
} & EnabledOrDisabled

export enum SupportUploadFileTypes {
  image = 'image',
  document = 'document',
  audio = 'audio',
  video = 'video',
  custom = 'custom',
}

export const FILE_EXTS: Record<string, string[]> = {
  [SupportUploadFileTypes.image]: ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'],
  [SupportUploadFileTypes.document]: ['TXT', 'MD', 'MDX', 'MARKDOWN', 'PDF', 'HTML', 'XLSX', 'XLS', 'DOC', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'],
  [SupportUploadFileTypes.audio]: ['MP3', 'M4A', 'WAV', 'WEBM', 'AMR', 'MPGA'],
  [SupportUploadFileTypes.video]: ['MP4', 'MOV', 'MPEG', 'MPGA'],
}

export interface CitationItem {
  content: string
  data_source_type: string
  dataset_name: string
  dataset_id: string
  document_id: string
  document_name: string
  hit_count: number
  index_node_hash: string
  segment_id: string
  segment_position: number
  score: number
  word_count: number
}

export interface FeedbackType {
  rating: MessageRating
  content?: string | null
}

export interface MessageMore {
  time: string
  tokens: number
  latency: number | string
}

export type LogAnnotation = {
  id: string
  content: string
  account: {
    id: string
    name: string
    email: string
  }
  created_at: number
}

export type Annotation = {
  id: string
  authorName: string
  logAnnotation?: LogAnnotation
  created_at?: number
}

export type TypeWithI18N<T = string> = {
  en_US: T
  zh_Hans: T
  [key: string]: T
}

export interface ThoughtItem {
  id: string
  tool: string // plugin or dataset. May has multi.
  thought: string
  tool_input: string
  tool_labels?: { [key: string]: TypeWithI18N }
  message_id: string
  observation: string
  position: number
  files?: string[]
  message_files?: FileEntity[]
}

export interface IChatItem {
  id: string
  content: string
  citation?: CitationItem[]
  /**
   * Specific message type
   */
  isAnswer: boolean
  /**
   * The user feedback result of this message
   */
  feedback?: FeedbackType
  /**
   * The admin feedback result of this message
   */
  adminFeedback?: FeedbackType
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
  log?: { role: string; text: string; files?: FileEntity[] }[]
  agent_thoughts?: ThoughtItem[]
  message_files?: FileEntity[]
  workflow_run_id?: string
  // for agent log
  conversationId?: string
  input?: any
  parentMessageId?: string | null
  siblingCount?: number
  siblingIndex?: number
  prevSibling?: string
  nextSibling?: string
}

export type ChatItem = IChatItem & {
  isError?: boolean
  workflowProcess?: WorkflowProcess
  conversationId?: string
  allFiles?: FileEntity[]
}

export type AgentLogItem = {
  node_execution_id: string,
  id: string,
  node_id: string,
  parent_id?: string,
  label: string,
  data: object, // debug data
  error?: string,
  status: string,
  metadata?: {
    elapsed_time?: number
    provider?: string
    icon?: string
  },
}

export type AgentLogItemWithChildren = AgentLogItem & {
  hasCircle?: boolean
  children: AgentLogItemWithChildren[]
}

export type IterationDurationMap = Record<string, number>

export enum CodeLanguage {
  python3 = 'python3',
  javascript = 'javascript',
  json = 'json',
}

export enum ErrorHandleTypeEnum {
  none = 'none',
  failBranch = 'fail-branch',
  defaultValue = 'default-value',
}

export type FileResponse = {
  related_id: string
  extension: string
  filename: string
  size: number
  mime_type: string
  transfer_method: TransferMethod
  type: string
  url: string
}

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type HelpLineHorizontalPosition = {
  top: number
  left: number
  width: number
}

export type HelpLineVerticalPosition = {
  top: number
  left: number
  height: number
}

export type WorkflowRetryConfig = {
  max_retries: number
  retry_interval: number
  retry_enabled: boolean
}

export type Branch = {
  id: string
  name: string
}

export type DefaultValueForm = {
  key: string
  type: VarType
  value?: any
}

export type ToolDefaultValue = {
  provider_id: string
  provider_type: string
  provider_name: string
  tool_name: string
  tool_label: string
  title: string
  is_team_authorization: boolean
  params: Record<string, any>
  paramSchemas: Record<string, any>[]
  output_schema: Record<string, any>
}

export type CommonNodeType<T = {}> = {
  _connectedSourceHandleIds?: string[]
  _connectedTargetHandleIds?: string[]
  _targetBranches?: Branch[]
  _isSingleRun?: boolean
  _runningStatus?: NodeRunningStatus
  _runningBranchId?: string
  _singleRunningStatus?: NodeRunningStatus
  _isCandidate?: boolean
  _isBundled?: boolean
  _children?: string[]
  _isEntering?: boolean
  _showAddVariablePopup?: boolean
  _holdAddVariablePopup?: boolean
  _iterationLength?: number
  _iterationIndex?: number
  _inParallelHovering?: boolean
  _waitingRun?: boolean
  _retryIndex?: number
  isInIteration?: boolean
  iteration_id?: string
  selected?: boolean
  title: string
  desc: string
  type: BlockEnum
  width?: number
  height?: number
  error_strategy?: ErrorHandleTypeEnum
  retry_config?: WorkflowRetryConfig
  default_value?: DefaultValueForm[]
} & T & Partial<Pick<ToolDefaultValue, 'provider_id' | 'provider_type' | 'provider_name' | 'tool_name'>>


export type ValueSelector = string[] // [nodeId, key | obj key path]

export enum VarType {
  string = 'string',
  number = 'number',
  secret = 'secret',
  boolean = 'boolean',
  object = 'object',
  file = 'file',
  array = 'array',
  arrayString = 'array[string]',
  arrayNumber = 'array[number]',
  arrayObject = 'array[object]',
  arrayFile = 'array[file]',
  any = 'any',
}

export type VarGroupItem = {
  output_type: VarType
  variables: ValueSelector[]
}
export type VariableAssignerNodeType = CommonNodeType & VarGroupItem & {
  advanced_settings: {
    group_enabled: boolean
    groups: ({
      group_name: string
      groupId: string
    } & VarGroupItem)[]
  }
}

export enum ChatVarType {
  Number = 'number',
  String = 'string',
  Object = 'object',
  ArrayString = 'array[string]',
  ArrayNumber = 'array[number]',
  ArrayObject = 'array[object]',
}

export type ConversationVariable = {
  id: string
  name: string
  value_type: ChatVarType
  value: any
  description: string
}

import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from 'reactflow'

export type CommonEdgeType = {
  _hovering?: boolean
  _connectedNodeIsHovering?: boolean
  _connectedNodeIsSelected?: boolean
  _isBundled?: boolean
  _sourceRunningStatus?: NodeRunningStatus
  _targetRunningStatus?: NodeRunningStatus
  _waitingRun?: boolean
  isInIteration?: boolean
  iteration_id?: string
  sourceType: BlockEnum
  targetType: BlockEnum
}


export type Edge = ReactFlowEdge<CommonEdgeType>

export type EnvironmentVariable = {
  id: string
  name: string
  value: any
  value_type: 'string' | 'number' | 'secret'
}

export type HistoryWorkflowData = {
  id: string
  sequence_number: number
  status: string
  conversation_id?: string
}

export type Node<T = {}> = ReactFlowNode<CommonNodeType<T>>

export type RunFile = {
  type: string
  transfer_method: TransferMethod[]
  url?: string
  upload_file_id?: string
}

export type Emoji = {
  background: string
  content: string
}

export enum CollectionType {
  all = 'all',
  builtIn = 'builtin',
  custom = 'api',
  model = 'model',
  workflow = 'workflow',
}

export type Collection = {
  id: string
  name: string
  author: string
  description: TypeWithI18N
  icon: string | Emoji
  label: TypeWithI18N
  type: CollectionType
  team_credentials: Record<string, any>
  is_team_authorization: boolean
  allow_delete: boolean
  labels: string[]
  plugin_id?: string
  letter?: string
}

export type ToolParameter = {
  name: string
  label: TypeWithI18N
  human_description: TypeWithI18N
  type: string
  form: string
  llm_description: string
  required: boolean
  default: string
  options?: {
    label: TypeWithI18N
    value: string
  }[]
  min?: number
  max?: number
}

export type Tool = {
  name: string
  author: string
  label: TypeWithI18N
  description: any
  parameters: ToolParameter[]
  labels: string[]
  output_schema: Record<string, any>
}

export type ToolWithProvider = Collection & {
  tools: Tool[]
}

export type WorkflowRunningData = {
  task_id?: string
  message_id?: string
  conversation_id?: string
  result: {
    sequence_number?: number
    workflow_id?: string
    inputs?: string
    process_data?: string
    outputs?: string
    status: string
    error?: string
    elapsed_time?: number
    total_tokens?: number
    created_at?: number
    created_by?: string
    finished_at?: number
    steps?: number
    showSteps?: boolean
    total_steps?: number
    files?: FileResponse[]
    exceptions_count?: number
  }
  tracing?: NodeTracing[]
}

export type FetchWorkflowDraftResponse = {
  id: string
  graph: {
    nodes: Node[]
    edges: Edge[]
    viewport?: Viewport
  }
  features?: any
  created_at: number
  created_by: {
    id: string
    name: string
    email: string
  }
  hash: string
  updated_at: number
  tool_published: boolean
  environment_variables?: EnvironmentVariable[]
  conversation_variables?: ConversationVariable[]
  version: string
}

export type VersionHistory = FetchWorkflowDraftResponse

export type CodeGenRes = {
  code: string
  language: string[]
  error?: string
}

export enum AppType {
  chat = 'chat',
  completion = 'completion',
}

export enum PromptRole {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export enum ModelModeType {
  chat = 'chat',
  completion = 'completion',
  unset = '',
}

export interface PromptItem {
  role?: PromptRole
  text: string
}

export interface BlockStatus {
  context: boolean
  history: boolean
  query: boolean
}

export enum DatasetPermission {
  onlyMe = 'only_me',
  allTeamMembers = 'all_team_members',
  partialMembers = 'partial_members',
}

export enum DataSourceType {
  FILE = 'upload_file',
  NOTION = 'notion_import',
  WEB = 'website_crawl',
}

export enum IndexingType {
  QUALIFIED = 'high_quality',
  ECONOMICAL = 'economy',
}

export enum ChunkingMode {
  text = 'text_model', // General text
  qa = 'qa_model', // General QA
  parentChild = 'hierarchical_model', // Parent-Child
}

export enum RETRIEVE_METHOD {
  semantic = 'semantic_search',
  fullText = 'full_text_search',
  hybrid = 'hybrid_search',
  invertedIndex = 'invertedIndex',
  keywordSearch = 'keyword_search',
}

export enum RerankingModeEnum {
  RerankingModel = 'reranking_model',
  WeightedScore = 'weighted_score',
}

export enum WeightedScoreEnum {
  SemanticFirst = 'semantic_first',
  KeywordFirst = 'keyword_first',
  Customized = 'customized',
}

export type RetrievalConfig = {
  search_method: RETRIEVE_METHOD
  reranking_enable: boolean
  reranking_model: {
    reranking_provider_name: string
    reranking_model_name: string
  }
  top_k: number
  score_threshold_enabled: boolean
  score_threshold: number
  reranking_mode?: RerankingModeEnum
  weights?: {
    weight_type: WeightedScoreEnum
    vector_setting: {
      vector_weight: number
      embedding_provider_name: string
      embedding_model_name: string
    }
    keyword_setting: {
      keyword_weight: number
    }
  }
}

export type Tag = {
  id: string
  name: string
  type: string
  binding_count: number
}


export type DataSet = {
  id: string
  name: string
  icon: string
  icon_background: string
  description: string
  permission: DatasetPermission
  data_source_type: DataSourceType
  indexing_technique: IndexingType
  created_by: string
  updated_by: string
  updated_at: number
  app_count: number
  doc_form: ChunkingMode
  document_count: number
  word_count: number
  provider: string
  embedding_model: string
  embedding_model_provider: string
  embedding_available: boolean
  retrieval_model_dict: RetrievalConfig
  retrieval_model: RetrievalConfig
  tags: Tag[]
  partial_member_list?: string[]
  external_knowledge_info: {
    external_knowledge_id: string
    external_knowledge_api_id: string
    external_knowledge_api_name: string
    external_knowledge_api_endpoint: string
  }
  external_retrieval_model: {
    top_k: number
    score_threshold: number
    score_threshold_enabled: boolean
  }
}

export type CompletionParams = {
  max_tokens: number
  temperature: number
  echo: boolean
  stop: string[]
  presence_penalty: number
  frequency_penalty: number
}

export type AutomaticRes = {
  prompt: string
  variables: string[]
  opening_statement: string
  error?: string
}

export type ExternalDataTool = {
  type?: string
  label?: string
  icon?: string
  icon_background?: string
  variable?: string
  enabled?: boolean
  config?: {
    api_based_extension_id?: string
  } & Partial<Record<string, any>>
}

export enum AgentStrategy {
  functionCall = 'function_call',
  react = 'react',
}

export const DEFAULT_AGENT_SETTING = {
  enabled: false,
  max_iteration: 5,
  strategy: AgentStrategy.functionCall,
  tools: [],
}

export interface MoreLikeThisConfig {
  enabled: boolean
}

export type RetrieverResourceConfig = MoreLikeThisConfig

export type SuggestedQuestionsAfterAnswerConfig = MoreLikeThisConfig

export type SpeechToTextConfig = MoreLikeThisConfig

export enum TtsAutoPlay {
  enabled = 'enabled',
  disabled = 'disabled',
}

export interface TextToSpeechConfig {
  enabled: boolean
  voice?: string
  language?: string
  autoPlay?: TtsAutoPlay
}

export interface ModerationContentConfig {
  enabled: boolean
  preset_response?: string
}

export type ModerationConfig = MoreLikeThisConfig & {
  type?: string
  config?: {
    keywords?: string
    api_based_extension_id?: string
    inputs_config?: ModerationContentConfig
    outputs_config?: ModerationContentConfig
  } & Partial<Record<string, any>>
}

export interface AnnotationReplyConfig {
  id: string
  enabled: boolean
  score_threshold: number
  embedding_model: {
    embedding_provider_name: string
    embedding_model_name: string
  }
}

export type AgentTool = {
  provider_id: string
  provider_type: CollectionType
  provider_name: string
  tool_name: string
  tool_label: string
  tool_parameters: Record<string, any>
  enabled: boolean
  isDeleted?: boolean
  notAuthor?: boolean
}

export type ToolItem = {
  dataset: {
    enabled: boolean
    id: string
  }
} | {
  'sensitive-word-avoidance': {
    enabled: boolean
    words: string[]
    canned_response: string
  }
} | AgentTool

export interface AgentConfig {
  enabled: boolean
  strategy: AgentStrategy
  max_iteration: number
  tools: ToolItem[]
}

export interface ModelConfig {
  provider: string // LLM Provider: for example "OPENAI"
  model_id: string
  mode: ModelModeType
  configs: PromptConfig
  opening_statement: string | null
  more_like_this: MoreLikeThisConfig | null
  suggested_questions: string[] | null
  suggested_questions_after_answer: SuggestedQuestionsAfterAnswerConfig | null
  speech_to_text: SpeechToTextConfig | null
  text_to_speech: TextToSpeechConfig | null
  file_upload: FileUpload | null
  retriever_resource: RetrieverResourceConfig | null
  sensitive_word_avoidance: ModerationConfig | null
  annotation_reply: AnnotationReplyConfig | null
  dataSets: any[]
  agentConfig: AgentConfig
}

export interface ConversationHistoriesRole {
  user_prefix: string
  assistant_prefix: string
}