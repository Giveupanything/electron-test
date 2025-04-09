/* eslint-disable @typescript-eslint/no-unused-vars */
import { DIFY_API_URL } from '@/config';
import { TransferMethod } from '@/typings/app';
import { AnnotationReply, MessageEnd, MessageReplace } from './type';
import { message } from 'antd';

export type WorkflowStartedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: {
      id: string
      workflow_id: string
      sequence_number: number
      created_at: number
    }
  }

export type WorkflowFinishedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: {
      id: string
      workflow_id: string
      status: string
      outputs: any
      error: string
      elapsed_time: number
      total_tokens: number
      total_steps: number
      created_at: number
      finished_at: number
    }
  }

export type NodeStartedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: {
      id: string
      node_id: string
      node_type: string
      index: number
      predecessor_node_id?: string
      inputs: any
      created_at: number
      extras?: any
    }
  }

export type NodeFinishedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: {
      id: string
      node_id: string
      node_type: string
      index: number
      predecessor_node_id?: string
      inputs: any
      process_data: any
      outputs: any
      status: string
      error: string
      elapsed_time: number
      execution_metadata: {
        total_tokens: number
        total_price: number
        currency: string
      }
      created_at: number
    }
  }

export type IterationStartedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: NodeTracing
  }

export enum ErrorHandleTypeEnum {
    none = 'none',
    failBranch = 'fail-branch',
    defaultValue = 'default-value',
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
    VariableAggregator = 'variable-aggregator',
    Tool = 'tool',
    ParameterExtractor = 'parameter-extractor',
    Iteration = 'iteration',
    DocExtractor = 'document-extractor',
    ListFilter = 'list-operator',
    IterationStart = 'iteration-start',
    Assigner = 'assigner', // is now named as VariableAssigner
    Agent = 'agent',
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

export type NodeTracing = {
    id: string
    index: number
    predecessor_node_id: string
    node_id: string
    iteration_id?: string
    node_type: BlockEnum
    title: string
    inputs: any
    process_data: any
    outputs?: any
    status: string
    parallel_run_id?: string
    error?: string
    elapsed_time: number
    execution_metadata?: {
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
    metadata: {
      iterator_length: number
      iterator_index: number
    }
    created_at: number
    created_by: {
      id: string
      name: string
      email: string
    }
    iterDurationMap?: IterationDurationMap
    finished_at: number
    extras?: any
    expand?: boolean // for UI
    details?: NodeTracing[][] // iteration detail
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

export type IterationDurationMap = Record<string, number>

export type IOnDataMoreInfo = {
    conversationId?: string
    taskId?: string
    messageId: string
    errorMessage?: string
    errorCode?: string
}

export type ThoughtItem = {
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

export type VisionFile = {
    id?: string
    type: string
    transfer_method: TransferMethod
    url: string
    upload_file_id: string
    belongs_to?: string
  }

export type IterationNextResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: NodeTracing
  }

export type IterationFinishedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: NodeTracing
  }

export type ParallelBranchStartedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: NodeTracing
  }

export type ParallelBranchFinishedResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: NodeTracing
  }

export type TextChunkResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: {
      text: string
    }
  }

export type TextReplaceResponse = {
    task_id: string
    workflow_run_id: string
    event: string
    data: {
      text: string
    }
  }

export type AgentLogResponse = {
    task_id: string
    event: string
    data: AgentLogItemWithChildren
  }

export type IOnData = (message: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => void
export type IOnThought = (though: ThoughtItem) => void
export type IOnFile = (file: VisionFile) => void
export type IOnMessageEnd = (messageEnd: MessageEnd) => void
export type IOnMessageReplace = (messageReplace: MessageReplace) => void
export type IOnAnnotationReply = (messageReplace: AnnotationReply) => void
export type IOnCompleted = (hasError?: boolean) => void
export type IOnError = (msg: string, code?: string) => void
export type IOnWorkflowStarted = (workflowStarted: WorkflowStartedResponse) => void
export type IOnWorkflowFinished = (workflowFinished: WorkflowFinishedResponse) => void
export type IOnNodeStarted = (nodeStarted: NodeStartedResponse) => void
export type IOnNodeFinished = (nodeFinished: NodeFinishedResponse) => void
export type IOnIterationStarted = (workflowStarted: IterationStartedResponse) => void
export type IOnIterationNext = (workflowStarted: IterationNextResponse) => void
export type IOnNodeRetry = (nodeFinished: NodeFinishedResponse) => void
export type IOnIterationFinished = (workflowFinished: IterationFinishedResponse) => void
export type IOnParallelBranchStarted = (parallelBranchStarted: ParallelBranchStartedResponse) => void
export type IOnParallelBranchFinished = (parallelBranchFinished: ParallelBranchFinishedResponse) => void
export type IOnTextChunk = (textChunk: TextChunkResponse) => void
export type IOnTTSChunk = (messageId: string, audioStr: string, audioType?: string) => void
export type IOnTTSEnd = (messageId: string, audioStr: string, audioType?: string) => void
export type IOnTextReplace = (textReplace: TextReplaceResponse) => void
export type IOnAgentLog = (agentLog: AgentLogResponse) => void

type IOtherOptions = {
    isPublicAPI?: boolean
    bodyStringify?: boolean
    needAllResponseContent?: boolean
    deleteContentType?: boolean
    onData?: IOnData // for stream
    onThought?: IOnThought
    onFile?: IOnFile
    onMessageEnd?: IOnMessageEnd
    onMessageReplace?: IOnMessageReplace
    onError?: IOnError
    onCompleted?: IOnCompleted // for stream
    getAbortController?: (abortController: AbortController) => void
    onWorkflowStarted?: IOnWorkflowStarted
    onWorkflowFinished?: IOnWorkflowFinished
    onNodeStarted?: IOnNodeStarted
    onNodeFinished?: IOnNodeFinished
    onIterationStart?: IOnIterationStarted
    onIterationNext?: IOnIterationNext
    onIterationFinish?: IOnIterationFinished
    onNodeRetry?: IOnNodeRetry
    onParallelBranchStarted?: IOnParallelBranchStarted
    onParallelBranchFinished?: IOnParallelBranchFinished
    onTextChunk?: IOnTextChunk
    onTTSChunk?: IOnTTSChunk
    onTTSEnd?: IOnTTSEnd
    onTextReplace?: IOnTextReplace
    onAgentLog?: IOnAgentLog
  }

// const TIME_OUT = 100000;

// const ContentType = {
//   json: 'application/json',
//   stream: 'text/event-stream',
//   form: 'application/x-www-form-urlencoded; charset=UTF-8',
//   download: 'application/octet-stream' // for download
// };

// const baseOptions = {
//   method: 'GET',
//   mode: 'cors',
//   credentials: 'include', // always send cookies、HTTP Basic authentication.
//   headers: new Headers({
//     'Content-Type': ContentType.json
//   }),
//   redirect: 'follow'
// };

function unicodeToChar(text: string) {
  return text.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
}

const handleStream = (
  response: Response,
  onData: IOnData,
  onCompleted?: IOnCompleted,
  onThought?: IOnThought,
  onMessageEnd?: IOnMessageEnd,
  onMessageReplace?: IOnMessageReplace,
  onFile?: IOnFile,
  onWorkflowStarted?: IOnWorkflowStarted,
  onWorkflowFinished?: IOnWorkflowFinished,
  onNodeStarted?: IOnNodeStarted,
  onNodeFinished?: IOnNodeFinished,
  onIterationStart?: IOnIterationStarted,
  onIterationNext?: IOnIterationNext,
  onIterationFinish?: IOnIterationFinished,
  onNodeRetry?: IOnNodeRetry,
  onParallelBranchStarted?: IOnParallelBranchStarted,
  onParallelBranchFinished?: IOnParallelBranchFinished,
  onTextChunk?: IOnTextChunk,
  onTTSChunk?: IOnTTSChunk,
  onTTSEnd?: IOnTTSEnd,
  onTextReplace?: IOnTextReplace,
  onAgentLog?: IOnAgentLog
) => {
  if(!response.ok) throw new Error('Network response was not ok');

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let bufferObj: Record<string, any>;
  let isFirstMessage = true;
  function read() {
    let hasError = false;
    reader?.read().then((result: any) => {
      if(result.done) {
        onCompleted && onCompleted();
        return;
      }
      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split('\n');
      try {
        lines.forEach((message) => {
          if(message.startsWith('data: ')) { // check if it starts with data:
            try {
              bufferObj = JSON.parse(message.substring(6)) as Record<string, any>;// remove data: and parse as json
            } catch(e) {
              // mute handle message cut off
              onData('', isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id
              });
              return;
            }
            if(bufferObj.status === 400 || !bufferObj.event) {
              onData('', false, {
                conversationId: undefined,
                messageId: '',
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code
              });
              hasError = true;
              onCompleted?.(true);
              return;
            }
            // console.log('bufferObj:>> ', bufferObj);

            if(bufferObj.event === 'message' || bufferObj.event === 'agent_message') {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id
              });
              isFirstMessage = false;
            } else if(bufferObj.event === 'agent_thought') {
              onThought?.(bufferObj as ThoughtItem);
            } else if(bufferObj.event === 'message_file') {
              onFile?.(bufferObj as VisionFile);
            } else if(bufferObj.event === 'message_end') {
              onMessageEnd?.(bufferObj as MessageEnd);
            } else if(bufferObj.event === 'message_replace') {
              onMessageReplace?.(bufferObj as MessageReplace);
            } else if(bufferObj.event === 'workflow_started') {
              onWorkflowStarted?.(bufferObj as WorkflowStartedResponse);
            } else if(bufferObj.event === 'workflow_finished') {
              onWorkflowFinished?.(bufferObj as WorkflowFinishedResponse);
            } else if(bufferObj.event === 'node_started') {
              onNodeStarted?.(bufferObj as NodeStartedResponse);
            } else if(bufferObj.event === 'node_finished') {
              onNodeFinished?.(bufferObj as NodeFinishedResponse);
            } else if(bufferObj.event === 'iteration_started') {
              onIterationStart?.(bufferObj as IterationStartedResponse);
            } else if(bufferObj.event === 'iteration_next') {
              onIterationNext?.(bufferObj as IterationNextResponse);
            } else if(bufferObj.event === 'iteration_completed') {
              onIterationFinish?.(bufferObj as IterationFinishedResponse);
            } else if(bufferObj.event === 'node_retry') {
              onNodeRetry?.(bufferObj as NodeFinishedResponse);
            } else if(bufferObj.event === 'parallel_branch_started') {
              onParallelBranchStarted?.(bufferObj as ParallelBranchStartedResponse);
            } else if(bufferObj.event === 'parallel_branch_finished') {
              onParallelBranchFinished?.(bufferObj as ParallelBranchFinishedResponse);
            } else if(bufferObj.event === 'text_chunk') {
              onTextChunk?.(bufferObj as TextChunkResponse);
            } else if(bufferObj.event === 'text_replace') {
              onTextReplace?.(bufferObj as TextReplaceResponse);
            } else if(bufferObj.event === 'agent_log') {
              onAgentLog?.(bufferObj as AgentLogResponse);
            } else if(bufferObj.event === 'tts_message') {
              onTTSChunk?.(bufferObj.message_id, bufferObj.audio, bufferObj.audio_type);
            } else if(bufferObj.event === 'tts_message_end') {
              onTTSEnd?.(bufferObj.message_id, bufferObj.audio);
            }
          }
        });
        buffer = lines[lines.length - 1];
      } catch(e) {
        onData('', false, {
          conversationId: undefined,
          messageId: '',
          errorMessage: `${e}`
        });
        hasError = true;
        onCompleted?.(true);
        return;
      }
      if(!hasError) read();
    });
  }
  read();
};

export const ssePost = (
  url: string,
  fetchOptions: any,
  {
    getAbortController,
    onData,
    onCompleted,
    onThought,
    onFile,
    onMessageEnd,
    onMessageReplace,
    onWorkflowStarted,
    onWorkflowFinished,
    onNodeStarted,
    onNodeFinished,
    onIterationStart,
    onIterationNext,
    onIterationFinish,
    onNodeRetry,
    onParallelBranchStarted,
    onParallelBranchFinished,
    onTextChunk,
    onTTSChunk,
    onTTSEnd,
    onTextReplace,
    onAgentLog,
    onError
  }: IOtherOptions
) => {
  const { apiKey, ...bodyOptions } = fetchOptions;

  const headers = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
    Authorization: ''
  };

  apiKey && (headers['Authorization'] = `Bearer ${apiKey}`);

  const options = Object.assign({}, {
    method: 'POST'
  }, bodyOptions, { headers });

  const urlPrefix = DIFY_API_URL;
  const urlWithPrefix = `${urlPrefix}${url}`;

  const { body } = options;
  if(body) options.body = JSON.stringify(body);

  if(getAbortController) {
    const controller = new AbortController();
    getAbortController(controller);
    options.signal = controller.signal;
  }

  fetch(urlWithPrefix, options)
    .then((res: any) => {
      if(!/^(2|3)\d{2}$/.test(res.status)) {
        // eslint-disable-next-line no-new
        new Promise(() => {
          res.json().then((data: any) => {
            console.error('data:>> ', data);
            message.warning(data.message || 'Server Error');
          });
        });
        onError?.('Server Error');
        return;
      }
      return handleStream(res, (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
        if(moreInfo.errorMessage) {
          console.error('moreInfo.errorMessage:>> ', moreInfo);
          message.warning(moreInfo.errorMessage);
          return;
        }
        onData?.(str, isFirstMessage, moreInfo);
      }, () => {
        onCompleted?.();
      }, onThought, onMessageEnd, onMessageReplace, onFile, onWorkflowStarted, onWorkflowFinished, onNodeStarted, onNodeFinished, onIterationStart, onIterationNext, onIterationFinish, onNodeRetry, onParallelBranchStarted, onParallelBranchFinished, onTextChunk, onTTSChunk, onTTSEnd, onTextReplace, onAgentLog);
    }).catch((e) => {
      console.error('error:>> ', e);
      message.warning(e);
      onError?.(e);
    });
};

// export const sseNewPost = (
//   url: string,
//   fetchOptions: any,
//   {
//     onData,
//     onCompleted,
//     onError,
//     onWorkflowStarted,
//     onWorkflowFinished,
//     onNodeStarted,
//     onNodeFinished
//   }: IOtherOptions
// ) => {

//   fetch(`${DIFY_API_URL}/${url}`, {
//     method: 'POST',
//     body: JSON.stringify(fetchOptions.body),
//     headers: {
//       Accept: 'text/event-stream',
//       // Authorization: 'Bearer app-KodF6Ci3l0srpGIv5x5PGjSr', // dify
//       Authorization: 'Bearer app-Bqu4YbhPnyU9jMDCASC4kvJV', // 188
//       'Content-Type': 'application/json'
//     }
//   }).then((res: any) => {
//     if(!/^(2|3)\d{2}$/.test(res.status)) {
//       // eslint-disable-next-line no-new
//       new Promise(() => {
//         res.json().then((data: any) => {
//         //   Toast.notify({ type: 'error', message: data.message || 'Server Error' });
//         });
//       });
//       onError?.('Server Error');
//       return;
//     }
//     return handleStream(res, (str: string, isFirstMessage: boolean, moreInfo: IOnDataMoreInfo) => {
//       if(moreInfo.errorMessage) {
//         //   Toast.notify({ type: 'error', message: moreInfo.errorMessage });
//         return;
//       }
//       onData?.(str, isFirstMessage, moreInfo);
//     }, onCompleted, onWorkflowStarted, onWorkflowFinished, onNodeStarted, onNodeFinished);
//   }).catch((e) => {
//     //   Toast.notify({ type: 'error', message: e });
//     onError?.(e);
//   });
// };