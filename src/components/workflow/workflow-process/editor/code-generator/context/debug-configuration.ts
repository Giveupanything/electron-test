import { createContext, useContext } from 'use-context-selector';
import {
  ModelModeType,
  DEFAULT_AGENT_SETTING,
  ModelConfig,
  ConversationHistoriesRole,
  type DataSet,
  BlockStatus,
  PromptItem,
  ExternalDataTool
} from '@/types/app';

type IDebugConfiguration = {
  mode: string
  isAdvancedMode: boolean
  modelConfig: ModelConfig
  setModelConfig: (modelConfig: ModelConfig) => void
  conversationHistoriesRole: ConversationHistoriesRole
  showHistoryModal: () => void
  showSelectDataSet: () => void
  externalDataToolsConfig: ExternalDataTool[]
  currentAdvancedPrompt: PromptItem | PromptItem[]
  setCurrentAdvancedPrompt: (prompt: PromptItem | PromptItem[], isUserChanged?: boolean) => void
  modelModeType: ModelModeType
  dataSets: DataSet[]
  hasSetBlockStatus: BlockStatus
}

const DebugConfigurationContext = createContext<IDebugConfiguration>({
  mode: '',
  isAdvancedMode: false,
  modelConfig: {
    provider: 'OPENAI', // 'OPENAI'
    model_id: 'gpt-3.5-turbo', // 'gpt-3.5-turbo'
    mode: ModelModeType.unset,
    configs: {
      prompt_template: '',
      prompt_variables: []
    },
    more_like_this: null,
    opening_statement: '',
    suggested_questions: [],
    sensitive_word_avoidance: null,
    speech_to_text: null,
    text_to_speech: null,
    file_upload: null,
    suggested_questions_after_answer: null,
    retriever_resource: null,
    annotation_reply: null,
    dataSets: [],
    agentConfig: DEFAULT_AGENT_SETTING
  },
  setModelConfig: () => { },
  conversationHistoriesRole: {
    user_prefix: 'user',
    assistant_prefix: 'assistant'
  },
  currentAdvancedPrompt: [],
  setCurrentAdvancedPrompt: () => { },
  showHistoryModal: () => { },
  showSelectDataSet: () => { },
  externalDataToolsConfig: [],
  modelModeType: ModelModeType.chat,
  dataSets: [],
  hasSetBlockStatus: {
    context: false,
    history: false,
    query: false
  }
});

export const useDebugConfigurationContext = () => useContext(DebugConfigurationContext);

export default DebugConfigurationContext;
