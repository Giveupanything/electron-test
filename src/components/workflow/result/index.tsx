'use client';
import React, { useEffect, useRef, useState, type FC } from 'react';
import { useBoolean } from 'ahooks';
import produce from 'immer';
import cn from 'classnames';
import NoData from '../no-data';
import TextGenerationRes from './item';
import Toast from '@/components/base/toast';
import { sendCompletionMessage, sendWorkflowMessage, updateFeedbackNew } from '@/api/text';
import { NodeRunningStatus, TransferMethod, WorkflowRunningStatus, type Feedbacktype, PromptConfig, VisionFile, VisionSettings, WorkflowProcess } from '@/types/app';
import { Loading } from '@/components/icon/communication';
import { sleep } from '@/utils';
import { getFilesInLogs } from '@/components/base/file-uploader/utils';

export type IResultProps = {
  isWorkflow: boolean
  isCallBatchAPI: boolean
  isPC: boolean
  isMobile: boolean
  isError: boolean
  promptConfig: PromptConfig | null
  inputs: Record<string, any>
  controlSend?: number
  controlRetry?: number
  controlStopResponding?: number
  onShowRes: () => void
  taskId?: number
  onCompleted: (completionRes: string, taskId?: number, success?: boolean) => void
  visionConfig?: VisionSettings
  completionFiles?: VisionFile[]
}

const Result: FC<IResultProps> = ({
  isWorkflow,
  isCallBatchAPI,
  isPC,
  isMobile,
  isError,
  promptConfig,
  inputs,
  controlSend,
  controlRetry,
  controlStopResponding,
  onShowRes,
  taskId,
  onCompleted,
  visionConfig,
  completionFiles
}) => {
  const [isResponding, { setTrue: setResponsingTrue, setFalse: setRespondingFalse }] = useBoolean(false);
  useEffect(() => {
    if(controlStopResponding) setRespondingFalse();
  }, [controlStopResponding]);

  const [completionRes, doSetCompletionRes] = useState('');
  const completionResRef = useRef('');
  const setCompletionRes = (res: string) => {
    completionResRef.current = res;
    doSetCompletionRes(res);
  };
  const getCompletionRes = () => completionResRef.current;
  const [workflowProcessData, doSetWorkflowProccessData] = useState<WorkflowProcess>();
  const workflowProcessDataRef = useRef<WorkflowProcess>();
  const setWorkflowProcessData = (data: WorkflowProcess) => {
    workflowProcessDataRef.current = data;
    doSetWorkflowProccessData(data);
  };
  const getWorkflowProcessData = () => workflowProcessDataRef.current;

  const { notify } = Toast;
  const isNoData = !completionRes;

  const [messageId, setMessageId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedbacktype>({
    rating: null
  });

  const handleFeedback = async (feedback: Feedbacktype) => {
    const res = await updateFeedbackNew({ url: `messages/${messageId}/feedbacks`, body: { rating: feedback.rating, user: 'abc-123', content: 'message feedback information' }});
    const resJson = await res.json();
    if(resJson.result === 'success') {
      setFeedback(feedback);
    }
  };

  const logError = (message: string) => {
    notify({ type: 'error', message });
  };

  const checkCanSend = () => {
    // batch will check outer
    if(isCallBatchAPI) return true;

    const prompt_variables = promptConfig?.prompt_variables;
    if(!prompt_variables || prompt_variables?.length === 0) return true;

    let hasEmptyInput = '';
    const requiredVars = prompt_variables?.filter(({ key, name, required }) => {
      const res = (!key || !key.trim()) || (!name || !name.trim()) || (required || required === undefined || required === null);
      return res;
    }) || []; // compatible with old version
    requiredVars.forEach(({ key, name }) => {
      if(hasEmptyInput) return;

      if(!inputs[key]) hasEmptyInput = name;
    });

    if(hasEmptyInput) {
      logError(`${hasEmptyInput}必填`);
      return false;
    }
    // if(completionFiles.find(item => item.transfer_method === TransferMethod.local_file && !item.upload_file_id)) {
    //   notify({ type: 'info', message: '请等待图片上传完成' });
    //   return false;
    // }
    return !hasEmptyInput;
  };

  const handleSend = async () => {
    if(isResponding) {
      notify({ type: 'info', message: '请等待上条信息响应完成' });
      return false;
    }

    if(!checkCanSend()) return;

    const data: Record<string, any> = {
      inputs
    };
    if(visionConfig?.enabled && completionFiles && completionFiles?.length > 0) {
      data.files = completionFiles.map((item) => {
        if(item.transfer_method === TransferMethod.local_file) {
          return {
            ...item,
            url: ''
          };
        }
        return item;
      });
    }

    setMessageId(null);
    setFeedback({
      rating: null
    });
    setCompletionRes('');

    const res: string[] = [];
    let tempMessageId = '';

    if(!isPC) onShowRes();

    setResponsingTrue();
    let isEnd = false;
    let isTimeout = false;
    (async () => {
      await sleep(1000 * 60); // 1min timeout
      if(!isEnd) {
        setRespondingFalse();
        onCompleted(getCompletionRes(), taskId, false);
        isTimeout = true;
      }
    })();

    if(isWorkflow) {
      sendWorkflowMessage(
        data,
        {
          onWorkflowStarted: ({ workflow_run_id }) => {
            tempMessageId = workflow_run_id;
            setWorkflowProcessData({
              status: WorkflowRunningStatus.Running,
              tracing: [],
              expand: false,
              resultText: ''
            });
            setRespondingFalse();
          },
          onIterationStart: ({ data }) => {
            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.expand = true;
              draft.tracing!.push({
                ...data,
                status: NodeRunningStatus.Running,
                expand: true
              } as any);
            }));
          },
          onIterationNext: () => {
            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.expand = true;
              const iterations = draft.tracing.find(item => item.node_id === data.node_id
                && (item.execution_metadata?.parallel_id === data.execution_metadata?.parallel_id || item.parallel_id === data.execution_metadata?.parallel_id))!;
              iterations?.details!.push([]);
            }));
          },
          onIterationFinish: ({ data }) => {
            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.expand = true;
              const iterationsIndex = draft.tracing.findIndex(item => item.node_id === data.node_id
                && (item.execution_metadata?.parallel_id === data.execution_metadata?.parallel_id || item.parallel_id === data.execution_metadata?.parallel_id))!;
              draft.tracing[iterationsIndex] = {
                ...data,
                expand: !!data.error
              } as any;
            }));
          },
          onNodeStarted: ({ data }) => {
            if(data.iteration_id) {
              return;
            }

            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.expand = true;
              draft.tracing!.push({
                ...data,
                status: NodeRunningStatus.Running,
                expand: true
              } as any);
            }));
          },
          onNodeFinished: ({ data }) => {
            if(data.iteration_id) {
              return;
            }

            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              const currentIndex = draft.tracing!.findIndex(trace => trace.node_id === data.node_id
                && (trace.execution_metadata?.parallel_id === data.execution_metadata?.parallel_id || trace.parallel_id === data.execution_metadata?.parallel_id));
              if(currentIndex > -1 && draft.tracing) {
                draft.tracing[currentIndex] = {
                  ...(draft.tracing[currentIndex].extras
                    ? { extras: draft.tracing[currentIndex].extras }
                    : {}),
                  ...data,
                  expand: !!data.error
                } as any;
              }
            }));
          },
          onWorkflowFinished: ({ data }) => {
            if(isTimeout) {
              notify({ type: 'warning', message: t('appDebug.warningMessage.timeoutExceeded') });
              return;
            }
            if(data.error) {
              notify({ type: 'error', message: data.error });
              setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
                draft.status = WorkflowRunningStatus.Failed;
              }));
              setRespondingFalse();
              onCompleted(getCompletionRes(), taskId, false);
              isEnd = true;
              return;
            }
            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.status = WorkflowRunningStatus.Succeeded;
              draft.files = getFilesInLogs(data.outputs || []) as any[];
            }));
            if(!data.outputs) {
              setCompletionRes('');
            } else {
              setCompletionRes(data.outputs);
              const isStringOutput = Object.keys(data.outputs).length === 1 && typeof data.outputs[Object.keys(data.outputs)[0]] === 'string';
              if(isStringOutput) {
                setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
                  draft.resultText = data.outputs[Object.keys(data.outputs)[0]];
                }));
              }
            }
            setRespondingFalse();
            setMessageId(tempMessageId);
            onCompleted(getCompletionRes(), taskId, true);
            isEnd = true;
          },
          onTextChunk: (params) => {
            const { data: { text }} = params;
            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.resultText += text;
            }));
          },
          onTextReplace: (params) => {
            const { data: { text }} = params;
            setWorkflowProcessData(produce(getWorkflowProcessData()!, (draft) => {
              draft.resultText = text;
            }));
          }
        }
      );
    } else {
      sendCompletionMessage(data, {
        onData: (data: string, _isFirstMessage: boolean, { messageId }) => {
          tempMessageId = messageId;
          res.push(data);
          setCompletionRes(res.join(''));
        },
        onCompleted: () => {
          if(isTimeout) return;

          setRespondingFalse();
          setMessageId(tempMessageId);
          onCompleted(getCompletionRes(), taskId, true);
          isEnd = true;
        },
        onError() {
          if(isTimeout) return;

          setRespondingFalse();
          onCompleted(getCompletionRes(), taskId, false);
          isEnd = true;
        }
      });
    }
  };

  useEffect(() => {
    if(controlSend) handleSend();
  }, [controlSend]);

  useEffect(() => {
    if(controlRetry) handleSend();
  }, [controlRetry]);

  const renderTextGenerationRes = () => (
    <TextGenerationRes
      isWorkflow={isWorkflow}
      workflowProcessData={workflowProcessData}
      className="mt-3"
      isError={isError}
      onRetry={handleSend}
      content={completionRes || ''}
      messageId={messageId}
      isInWebApp
      onFeedback={handleFeedback}
      feedback={feedback}
      isMobile={isMobile}
      isLoading={isCallBatchAPI ? (!completionRes && isResponding) : false}
      taskId={isCallBatchAPI ? ((taskId as number) < 10 ? `0${taskId}` : `${taskId}`) : undefined}
    />
  );

  return (
    <div className={cn(isNoData && !isCallBatchAPI && 'h-full')}>
      {!isCallBatchAPI && !isWorkflow && (
        (isResponding && !completionRes)
          ? (
            <div className="flex h-full w-full justify-center items-center">
              <Loading type="area" />
            </div>)
          : (
            <>
              {(isNoData)
                ? <NoData />
                : renderTextGenerationRes()
              }
            </>
          )
      )}
      {
        !isCallBatchAPI && isWorkflow && (
          (isResponding && !workflowProcessData)
            ? (
              <div className="flex h-full w-full justify-center items-center">
                <Loading type="area" />
              </div>
            )
            : !workflowProcessData
              ? <NoData />
              : renderTextGenerationRes()
        )
      }
      {isCallBatchAPI && (
        <div className="mt-2">
          {renderTextGenerationRes()}
        </div>
      )}
    </div>
  );
};
export default React.memo(Result);
