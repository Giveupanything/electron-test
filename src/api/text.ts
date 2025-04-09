/*
 * @Author: ming
 * @Date: 2025-03-17 16:01:30
 * @LastEditors: ming
 * @LastEditTime: 2025-03-17 16:01:34
 * @description: 心平气和
 */
import { get, post } from '@/axios';
import { ssePost, IOnCompleted, IOnData, IOnError, IOnNodeFinished, IOnTextChunk, IOnTextReplace, IOnIterationStarted, IOnIterationNext, IOnIterationFinished, IOnNodeStarted, IOnWorkflowFinished, IOnWorkflowStarted } from '@/axios/sse';
import type { Feedbacktype, CodeGenRes, ModelN, DefaultModelResponse } from '@/types/app';
import { DIFY_API_URL } from '@/config';
import { getUrlParam } from '@/utils';
import type { Fetcher } from 'swr';

type defaultParams = Record<string, any> | undefined
export const getParameters = (params?: defaultParams) => get<{ captcha: string }>('parameters', params);
export const getInfo = (params?: defaultParams) => get<{ captcha: string }>('info', params);

export const uploadRemoteFileInfo = (url: string) => {
  // fetch(`${DIFY_API_URL}remote-files/upload`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${getUrlParam('', 'APIKEY')}`
  //   },
  //   body: JSON.stringify({ url, user: 'abc-123' })
  // });
  return post<{ id: string; name: string; size: number; mime_type: string; url: string }>('remote-files/upload', { body: { url, user: 'abc-123' }});
};

export const sendCompletionMessage = async (
  body: Record<string, any>,
  {
    onData,
    onCompleted,
    onError
  }: {
    onData: IOnData;
    onCompleted: IOnCompleted;
    onError: IOnError;
  }
) => {
  return ssePost('completion-messages', {
    apiKey: getUrlParam('', 'APIKEY'),
    body: {
      ...body,
      response_mode: 'streaming',
      user: 'abc-123'
    }
  }, { onData, onCompleted, onError });
};

export const sendWorkflowMessage = async (
  body: Record<string, any>,
  {
    onWorkflowStarted,
    onNodeStarted,
    onNodeFinished,
    onWorkflowFinished,
    onIterationStart,
    onIterationNext,
    onIterationFinish,
    onTextChunk,
    onTextReplace
  }: {
    onWorkflowStarted: IOnWorkflowStarted
    onNodeStarted: IOnNodeStarted
    onNodeFinished: IOnNodeFinished
    onWorkflowFinished: IOnWorkflowFinished
    onIterationStart: IOnIterationStarted
    onIterationNext: IOnIterationNext
    onIterationFinish: IOnIterationFinished
    onTextChunk: IOnTextChunk
    onTextReplace: IOnTextReplace
  }
) => {
  return ssePost(
    'workflows/run', {
      apiKey: getUrlParam('', 'APIKEY'),
      body: {
        ...body,
        response_mode: 'streaming',
        user: 'abc-123'
      }
    },
    { onNodeStarted, onWorkflowStarted, onWorkflowFinished, onNodeFinished, onIterationStart, onIterationNext, onIterationFinish, onTextChunk, onTextReplace }
  );
};

export const fetchAppParams = async () => {
  return get('parameters');
};

export const updateFeedback = async ({
  url,
  body
}: {
  url: string;
  body: Feedbacktype;
}) => {
  return post(url, { body });
};

export const updateFeedbackNew = async ({
  url,
  body
}: {
  url: string;
  body: Feedbacktype;
}) => {
  return fetch(`${DIFY_API_URL}${url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${getUrlParam('', 'APIKEY')}`,
      'Content-Type': 'application/json'
    }
  });
};

export const generateRuleCode = (body: Record<string, any>) => {
  return post<CodeGenRes>('/rule-code-generate', {
    body
  });
};

export const fetchModelList: Fetcher<{ data: ModelN[] }, string> = (url) => {
  return get<{ data: ModelN[] }>(url);
};

export const fetchDefaultModal: Fetcher<{ data: DefaultModelResponse }, string> = (url) => {
  return get<{ data: DefaultModelResponse }>(url);
};

export const fetchTextGenerationMessage = ({
  appId,
  messageId
}: { appId: string; messageId: string }) => {
  return get<Promise<any>>(`/apps/${appId}/messages/${messageId}`);
};

export const textToAudioStream = (url: string, header: { content_type: string }, body: { streaming: boolean; voice?: string; message_id?: string; text?: string | null | undefined }) => {
  return fetch(`${DIFY_API_URL}${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getUrlParam('', 'APIKEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: 'abc-123',
      ...body
    })
  });
};