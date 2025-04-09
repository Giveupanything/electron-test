import {
  memo,
  useEffect
} from 'react';
import cn from '@/utils/classnames';
import { Markdown } from '@/components/base/markdown';
import CodeEditor from '@/components/workflow/workflow-process/editor/code-editor';
import { CodeLanguage } from '@/types/app';
import type { WorkflowProcess } from '@/types/app';
import { FileList } from '@/components/base/file-uploader';

const ResultTab = ({
  data,
  content,
  currentTab,
  onCurrentTabChange
}: {
  data?: WorkflowProcess
  content: any
  currentTab: string
  onCurrentTabChange: (tab: string) => void
}) => {

  const switchTab = async (tab: string) => {
    onCurrentTabChange(tab);
  };
  useEffect(() => {
    if(data?.resultText || !!data?.files?.length) {
      switchTab('RESULT');
    } else {
      switchTab('DETAIL');
    }
  }, [data?.files?.length, data?.resultText]);

  return (
    <div className="grow relative flex flex-col">
      {(data?.resultText || !!data?.files?.length) && (
        <div className="shrink-0 flex items-center mb-2 border-b-[0.5px] border-[rgba(0,0,0,0.05)]">
          <div
            className={cn(
              'mr-6 py-3 border-b-2 border-transparent text-[13px] font-semibold leading-[18px] text-gray-400 cursor-pointer',
              currentTab === 'RESULT' && '!border-[rgb(21,94,239)] text-gray-700'
            )}
            onClick={() => switchTab('RESULT')}
          >结果</div>
          <div
            className={cn(
              'mr-6 py-3 border-b-2 border-transparent text-[13px] font-semibold leading-[18px] text-gray-400 cursor-pointer',
              currentTab === 'DETAIL' && '!border-[rgb(21,94,239)] text-gray-700'
            )}
            onClick={() => switchTab('DETAIL')}
          >详情</div>
        </div>
      )}
      <div className={cn('grow bg-white')}>
        {currentTab === 'RESULT' && (
          <>
            {data?.resultText && <Markdown content={data?.resultText || ''} />}
            {!!data?.files?.length && (
              <div className="flex flex-col gap-2">
                {data?.files.map((item: any) => (
                  <div key={item.varName} className="flex flex-col gap-1 system-xs-regular">
                    <div className="py-1 text-text-tertiary text-xs">{item.varName}</div>
                    <FileList
                      files={item.list}
                      showDeleteAction={false}
                      showDownloadAction
                      canPreview
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {currentTab === 'DETAIL' && content && (
          <div className="mt-1">
            <CodeEditor
              readOnly
              title={<div>JSON OUTPUT</div>}
              language={CodeLanguage.json}
              value={content}
              isJSONStringifyBeauty
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(ResultTab);
