
import { useState, useEffect, useRef } from 'react';
import cn from 'classnames';
import { useBoolean, useSetState } from 'ahooks';
import { BubbleTextMod, AlertCircle, Loading } from '@/components/icon/communication';
import TabHeader from '@/components/base/tab-header';
import Button from '@/components/base/button';
// import { XMarkIcon } from '@heroicons/react/24/outline';
import RunOnce from './run-once';
import RunBatch from './run-batch';
import ResDownload from './run-batch/res-download';
import Result from './result';
import { getParameters, getInfo } from '@/api/text';
import Toast from '@/components/base/toast';
import useBreakpoints, { MediaType } from '@/types/use-breakpoints';
import { Resolution, TransferMethod, TaskStatus, type PromptConfig, Task, PromptVariable, VisionSettings, VisionFile, UserInputFormItem } from '@/types/app';
import { getUrlParam } from '@/utils';
import '@/assets/style/markdown.scss';

const GROUP_SIZE = 5;
const userInputsFormToPromptVariables = (useInputs: UserInputFormItem[] | null) => {
  if(!useInputs) return [];
  const promptVariables: PromptVariable[] = [];
  useInputs.forEach((item: any) => {
    const isParagraph = !!item.paragraph;
    const [type, content] = (() => {
      if(isParagraph) return ['paragraph', item.paragraph];

      if(item['text-input']) return ['string', item['text-input']];

      if(item.number) return ['number', item.number];

      return ['select', item.select];
    })();
    if(type === 'string' || type === 'paragraph') {
      promptVariables.push({
        key: content.variable,
        name: content.label,
        required: content.required,
        type,
        max_length: content.max_length,
        options: []
      });
    } else if(type === 'number') {
      promptVariables.push({
        key: content.variable,
        name: content.label,
        required: content.required,
        type,
        options: []
      });
    } else {
      promptVariables.push({
        key: content.variable,
        name: content.label,
        required: content.required,
        type: 'select',
        options: content.options
      });
    }
  });
  return promptVariables;
};

export default function TextGeneration() {
  const { notify } = Toast;
  const media = useBreakpoints();
  const isPC = media === MediaType.pc;
  const isTablet = media === MediaType.tablet;
  const isMobile = media === MediaType.mobile;
  const [currTab, setCurrTab] = useState('create');
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [textToSpeechConfig, setTextToSpeechConfig] = useState<TextToSpeechConfig | null>(null);
  const [visionConfig, setVisionConfig] = useState<VisionSettings>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.low,
    transfer_methods: [TransferMethod.local_file]
  });
  const [completionFiles, setCompletionFiles] = useState<VisionFile[]>([]);
  const [appInfo, setAppInfo] = useSetState({
    name: '',
    description: ''
  });
  useEffect(() => {
    (async () => {
      const { user_input_form, file_upload, system_parameters, text_to_speech }:any = await getParameters({ apiKey: getUrlParam('', 'APIKEY') });

      const prompt_variables = userInputsFormToPromptVariables(user_input_form);
      setPromptConfig({
        prompt_template: '',
        prompt_variables
      } as PromptConfig);
      setVisionConfig({
        ...file_upload?.image,
        image_file_size_limit: system_parameters?.image_file_size_limit || 0
      });
      getInfo({ apiKey: getUrlParam('', 'APIKEY') }).then((res: any) => {
        console.log('getInfo', res);
        setAppInfo(res);
      });
      setTextToSpeechConfig(text_to_speech?.enabled);
    })();
  }, []);
  const allTaskListRef = useRef<Task[]>([]);
  const setAllTaskList = (taskList: Task[]) => {
    doSetAllTaskList(taskList);
    allTaskListRef.current = taskList;
  };
  const handleSend = async () => {
    console.log('handleSend', inputs);
    setIsCallBatchAPI(false);
    setControlSend(Date.now());
    setAllTaskList([]);
    showResSidebar();
  };

  const checkBatchInputs = (data: string[][]) => {
    if(!data || data.length === 0) {
      notify({ type: 'error', message: '上传文件的内容不能为空' });
      return false;
    }
    const headerData = data[0];
    let isMapVarName = true;
    promptConfig?.prompt_variables.forEach((item, index) => {
      if(!isMapVarName) return;

      if(item.name !== headerData[index]) isMapVarName = false;
    });

    if(!isMapVarName) {
      notify({ type: 'error', message: '上传文件的内容与结构不匹配' });
      return false;
    }

    let payloadData = data.slice(1);
    if(payloadData.length === 0) {
      notify({ type: 'error', message: '上传文件的内容不能少于一条' });
      return false;
    }

    // check middle empty line
    const allEmptyLineIndexes = payloadData.filter(item => item.every(i => i === '')).map(item => payloadData.indexOf(item));
    if(allEmptyLineIndexes.length > 0) {
      let hasMiddleEmptyLine = false;
      let startIndex = allEmptyLineIndexes[0] - 1;
      allEmptyLineIndexes.forEach((index) => {
        if(hasMiddleEmptyLine) return;

        if(startIndex + 1 !== index) {
          hasMiddleEmptyLine = true;
          return;
        }
        startIndex++;
      });

      if(hasMiddleEmptyLine) {
        notify({ type: 'error', message: `第 ${startIndex + 2} 行的内容为空` });
        return false;
      }
    }

    // check row format
    payloadData = payloadData.filter(item => !item.every(i => i === ''));
    // after remove empty rows in the end, checked again
    if(payloadData.length === 0) {
      notify({ type: 'error', message: '上传文件的内容不能少于一条' });
      return false;
    }
    let errorRowIndex = 0;
    let requiredVarName = '';
    let moreThanMaxLengthVarName = '';
    let maxLength = 0;
    payloadData.forEach((item, index) => {
      if(errorRowIndex !== 0) return;

      promptConfig?.prompt_variables.forEach((varItem, varIndex) => {
        if(errorRowIndex !== 0) return;
        if(varItem.type === 'string') {
          const maxLen = varItem.max_length || 48;
          if(item[varIndex].length > maxLen) {
            moreThanMaxLengthVarName = varItem.name;
            maxLength = maxLen;
            errorRowIndex = index + 1;
            return;
          }
        }
        if(varItem.required === false) return;

        if(item[varIndex].trim() === '') {
          requiredVarName = varItem.name;
          errorRowIndex = index + 1;
        }
      });
    });

    if(errorRowIndex !== 0) {
      if(requiredVarName) notify({ type: 'error', message: `第 ${errorRowIndex + 1} 行: ${requiredVarName}值必填` });

      if(moreThanMaxLengthVarName) notify({ type: 'error', message: `第 ${errorRowIndex + 1} 行: ${moreThanMaxLengthVarName}值超过最大长度 ${maxLength}` });

      return false;
    }
    return true;
  };

  const handleRunBatch = (data: string[][]) => {
    console.log('data', data);

    if(!checkBatchInputs(data)) return;
    if(!allTaskFinished) {
      notify({ type: 'info', message: '请等待批量任务完成' });
      return;
    }

    const payloadData = data.filter(item => !item.every(i => i === '')).slice(1);
    const varLen = promptConfig?.prompt_variables.length || 0;
    setIsCallBatchAPI(true);
    const allTaskList: Task[] = payloadData.map((item, i) => {
      const inputs: Record<string, string> = {};
      if(varLen > 0) {
        item.slice(0, varLen).forEach((input, index) => {
          inputs[promptConfig?.prompt_variables[index].key as string] = input;
        });
      }
      return {
        id: i + 1,
        status: i < GROUP_SIZE ? TaskStatus.running : TaskStatus.pending,
        params: {
          inputs
        }
      };
    });
    setAllTaskList(allTaskList);

    setControlSend(Date.now());
    // clear run once task status
    setControlStopResponding(Date.now());
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    showResSidebar();
  };

  const [allTaskList, doSetAllTaskList] = useState<Task[]>([]);
  const allSuccessTaskList = allTaskList.filter(task => task.status === TaskStatus.completed);
  const allFailedTaskList = allTaskList.filter(task => task.status === TaskStatus.failed);
  const allTaskFinished = allTaskList.every(task => task.status === TaskStatus.completed);
  const allTaskRuned = allTaskList.every(task => [TaskStatus.completed, TaskStatus.failed].includes(task.status));
  const [isCallBatchAPI, setIsCallBatchAPI] = useState(false);
  const [controlSend, setControlSend] = useState(0);
  const [controlRetry, setControlRetry] = useState(0);
  const [controlStopResponding, setControlStopResponding] = useState(0);
  const [isShowResSidebar, { setTrue: showResSidebar, setFalse: hideResSidebar }] = useBoolean(false);
  const handleRetryAllFailedTask = () => {
    setControlRetry(Date.now());
  };

  const currGroupNumRef = useRef(0);
  const getLatestTaskList = () => allTaskListRef.current;
  const setCurrGroupNum = (num: number) => {
    currGroupNumRef.current = num;
  };
  const getCurrGroupNum = () => {
    return currGroupNumRef.current;
  };
  const setBatchCompletionRes = (res: Record<string, string>) => {
    batchCompletionResRef.current = res;
  };
  const handleCompleted = (completionRes: string, taskId?: number, isSuccess?: boolean) => {
    const allTasklistLatest = getLatestTaskList();
    const batchCompletionResLatest = getBatchCompletionRes();
    const pendingTaskList = allTasklistLatest.filter(task => task.status === TaskStatus.pending);
    const hadRunedTaskNum = 1 + allTasklistLatest.filter(task => [TaskStatus.completed, TaskStatus.failed].includes(task.status)).length;
    const needToAddNextGroupTask = (getCurrGroupNum() !== hadRunedTaskNum) && pendingTaskList.length > 0 && (hadRunedTaskNum % GROUP_SIZE === 0 || (allTasklistLatest.length - hadRunedTaskNum < GROUP_SIZE));
    if(needToAddNextGroupTask) setCurrGroupNum(hadRunedTaskNum);
    const nextPendingTaskIds = needToAddNextGroupTask ? pendingTaskList.slice(0, GROUP_SIZE).map(item => item.id) : [];
    const newAllTaskList = allTasklistLatest.map((item) => {
      if(item.id === taskId) {
        return {
          ...item,
          status: isSuccess ? TaskStatus.completed : TaskStatus.failed
        };
      }
      if(needToAddNextGroupTask && nextPendingTaskIds.includes(item.id)) {
        return {
          ...item,
          status: TaskStatus.running
        };
      }
      return item;
    });
    setAllTaskList(newAllTaskList);
    if(taskId) {
      setBatchCompletionRes({
        ...batchCompletionResLatest,
        [`${taskId}`]: completionRes
      });
    }
  };
  const renderRes = (task?: Task) => {
    return <Result
      key={task?.id}
      isWorkflow={false}
      isCallBatchAPI={isCallBatchAPI}
      isPC={isPC}
      isMobile={isMobile}
      isError={task?.status === TaskStatus.failed}
      promptConfig={promptConfig}
      inputs={isCallBatchAPI ? (task as Task).params.inputs : inputs}
      controlSend={controlSend}
      controlRetry={task?.status === TaskStatus.failed ? controlRetry : 0}
      controlStopResponding={controlStopResponding}
      onShowRes={showResSidebar}
      taskId={task?.id}
      onCompleted={handleCompleted}
      visionConfig={visionConfig}
      completionFiles={completionFiles}
      isShowTextToSpeech={!!textToSpeechConfig}
    />;
  };
  const resRef = useRef<HTMLDivElement>(null);

  const pendingTaskList = allTaskList.filter(task => task.status === TaskStatus.pending);
  const noPendingTask = pendingTaskList.length === 0;
  const showTaskList = allTaskList.filter(task => task.status !== TaskStatus.pending);
  const renderBatchRes = () => {
    return (showTaskList.map(task => renderRes(task)));
  };

  const batchCompletionResRef = useRef<Record<string, string>>({});
  const getBatchCompletionRes = () => batchCompletionResRef.current;
  const exportRes = allTaskList.map((task) => {
    const batchCompletionResLatest = getBatchCompletionRes();
    const res: Record<string, string> = {};
    const { inputs } = task.params;
    promptConfig?.prompt_variables.forEach((v) => {
      res[v.name] = inputs[v.key];
    });
    res['生成结果'] = batchCompletionResLatest[task.id];
    return res;
  });
  const renderResWrap = (
    <div ref={resRef} className={cn('flex flex-col h-full shrink-0', isPC ? 'px-10 py-8' : 'bg-gray-50', isTablet && 'p-6', isMobile && 'p-4')}>
      <>
        <div className="shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* <div className={s.starIcon} /> */}
            <div className="text-lg text-gray-800 font-semibold">AI 智能书写</div>
          </div>
          <div className="flex items-center space-x-2">
            {allFailedTaskList.length > 0 && (
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-[#D92D20]" />
                <div className="ml-1 text-[#D92D20]">{allFailedTaskList.length} 次运行失败</div>
                <Button type="primary" className="ml-2 !h-8 !px-3" onClick={handleRetryAllFailedTask}>重试</Button>
                <div className="mx-3 w-[1px] h-3.5 bg-gray-200" />
              </div>
            )}
            {allSuccessTaskList.length > 0 && (
              <ResDownload isMobile={isMobile} values={exportRes} />
            )}
            {/* <div className="flex items-center justify-center cursor-pointer" onClick={hideResSidebar}>
              <XMarkIcon className="w-4 h-4 text-gray-800" />
            </div> */}
          </div>
        </div>

        <div className="grow overflow-y-auto">
          {!isCallBatchAPI ? renderRes() : renderBatchRes()}
          {!noPendingTask && (
            <div className="mt-4">
              <Loading type="area" />
            </div>
          )}
        </div>
      </>
    </div>
  );
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-[600px] max-w-[50%] p-8 shrink-0 relative flex flex-col pb-10 h-full border-r border-gray-100 bg-white">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6  rounded-md flex items-center justify-center  text-white bg-blue-600">
                <BubbleTextMod className="w-4 h-4 text-components-avatar-shape-fill-stop-100" />
              </div>
              <div className="text-lg text-gray-800 font-semibold">{ appInfo.name }</div>
            </div>
          </div>
          { appInfo.description && <div className="mt-2 text-xs text-gray-500">{appInfo.description}</div>}
        </div>
        <TabHeader
          items={[
            { id: 'create', name: '运行一次' },
            { id: 'batch', name: '批量运行' }
          ]}
          value={currTab}
          onChange={setCurrTab}
        />
        <div className="grow h-20 overflow-y-auto">
          <div className={cn(currTab === 'create' ? 'block' : 'hidden')}>
            <RunOnce
              inputs={inputs}
              onInputsChange={setInputs}
              promptConfig={promptConfig}
              onSend={handleSend}
              visionConfig={visionConfig}
              onVisionFilesChange={setCompletionFiles}
            />
          </div>
          <div className={cn(currTab === 'batch' ? 'block' : 'hidden')}>
            <RunBatch
              vars={promptConfig?.prompt_variables || []}
              onSend={handleRunBatch}
              isAllFinished={allTaskRuned}
            />
          </div>
        </div>
      </div>
      {isPC && (
        <div className="grow h-full">
          {renderResWrap}
        </div>
      )}
      {(!isPC && isShowResSidebar) && (
        <div
          className={cn('fixed z-50 inset-0', isTablet ? 'pl-[128px]' : 'pl-6')}
          style={{
            background: 'rgba(35, 56, 118, 0.2)'
          }}
        >
          {renderResWrap}
        </div>
      )}
    </div>
  );
}