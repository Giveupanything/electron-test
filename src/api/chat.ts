import { del, get, post } from '@/axios';
import { IOnCompleted, IOnData, IOnError, IOnFile, IOnMessageEnd, IOnMessageReplace, IOnNodeFinished, IOnNodeStarted, IOnThought, IOnWorkflowFinished, IOnWorkflowStarted, ssePost } from '@/axios/sse';
import { AppConversationData, AppInfo } from '@/typings/app';

/** 获取会话列表 */
export const fetchConversations = (params: object) => get('conversations', { limit: 100, sort_by: '-created_at', ...params }) as unknown as Promise<AppConversationData>;

/** 获取应用参数 */
export const fetchAppParams = (params: object) => get('parameters', params) as unknown as Promise<any>;

/** 获取应用详情 */
export const fetchAppInfo = (params: object) => get('info', params) as unknown as Promise<AppInfo>;

/** 获取应用详情 */
export const fetchAppMeta = (params: object) => get('meta', params) as unknown as Promise<any>;

/** 修改应用名称 */
export const renameConversation = (id: string, params: object) => post(`conversations/${id}/name`, params);

/** 删除应用 */
export const delConversation = (id: string, params?: object) => del(`conversations/${id}`, params, { 'Content-Type': 'application/json' });

/** 获取对话历史消息 */
export const fetchChatList = (params: object) => get('messages', params) as unknown as Promise<AppConversationData<any>>;

/* 生成会话名称 */
export const generationConversationName = ({ id, params }: { id: string, params: object }) => post(`conversations/${id}/name`, { auto_generate: true, ...params });

/* 更新反馈 */
export const updateFeedback = (id: string, params: object) => post(`messages/${id}/feedbacks`, params);

/* 暂停 */
export const stopChat = (id: string, params: object) => post(`chat-messages/${id}/stop`, params);

/** 获取推荐问题 */
export const fetchSuggsted = (id: string, params: object) => get(`messages/${id}/suggested`, params) as unknown as Promise<{data: string[]}>;

export const sendChatMessage = async (
  body: Record<string, any>,
  {
    onData,
    onCompleted,
    onThought,
    onFile,
    onError,
    getAbortController,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onNodeStarted,
    onNodeFinished,
    onWorkflowFinished
  }: {
        onData?: IOnData
        onCompleted?: IOnCompleted
        onFile?: IOnFile
        onThought?: IOnThought
        onMessageEnd?: IOnMessageEnd
        onMessageReplace?: IOnMessageReplace
        onError?: IOnError
        getAbortController?: (abortController: AbortController) => void
        onWorkflowStarted?: IOnWorkflowStarted
        onNodeStarted?: IOnNodeStarted
        onNodeFinished?: IOnNodeFinished
        onWorkflowFinished?: IOnWorkflowFinished
      }
) => {
  const { apiKey, ...newBody } = body;
  return ssePost('chat-messages', {
    apiKey,
    body: {
      ...newBody,
      response_mode: 'streaming'
    }
  }, { onData, onCompleted, onThought, onFile, onError, getAbortController, onMessageEnd, onMessageReplace, onNodeStarted, onWorkflowStarted, onWorkflowFinished, onNodeFinished });
};
