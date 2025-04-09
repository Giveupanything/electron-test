import { memo, useState } from 'react';
import Textarea from 'rc-textarea';
import cn from '@/utils/classnames';
import { message } from 'antd';
import { useCheckInputsForms } from '@/hooks/use-check-input-forms';
import { InputForm } from '@/utils/utils';
import { useTextAreaHeight } from './hooks';
import Operation from './operation';
import { FileEntity, FileUpload } from '../../types';
import { FileListInChatInput } from '../file-list';
import { useFileStore } from '../../context/file-context';
import { TransferMethod } from '@/typings/app';

type Props = {
  isResponding: boolean;
  inputs: Record<string, any> | null
  inputsForms: InputForm[]
  fileConfig: FileUpload;
  apiKey: string
  onSend: (query: string, files?: FileEntity[]) => void;
  checkInputsRequired: () => boolean;
}

function ChatInputArea({
  isResponding,
  apiKey,
  onSend,
  inputs,
  inputsForms,
  fileConfig
}: Props) {

  const { checkInputsForm } = useCheckInputsForms();
  const {
    wrapperRef,
    textareaRef,
    textValueRef,
    holdSpaceRef,
    handleTextareaResize,
    isMultipleLine
  } = useTextAreaHeight();

  const filesStore = useFileStore();

  const [query, setQuery] = useState('');

  const handleSend = () => {
    const { files, setFiles } = filesStore.getState();
    if(files.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId)) {
      message.error('请等待文件上传完成');
      return;
    }

    if(!query || !query.trim()) {
      message.error('请输入内容');
      return;
    }

    if(isResponding) {
      message.error('请等待上条信息响应完成');
      return;
    }

    if(checkInputsForm(inputs || {}, inputsForms)) {
      onSend(query, files);
      setQuery('');
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      setQuery(query.replace(/\n$/, ''));
      handleSend();
    }
  };

  const operation = (
    <Operation
      ref={holdSpaceRef}
      fileConfig={fileConfig}
      // speechToTextConfig={speechToTextConfig}
      // onShowVoiceInput={handleShowVoiceInput}
      handleSend={handleSend}
    />
  );

  return (
    <div className="relative pb-[9px] bg-[#fffffff2] border border-white rounded-xl shadow-md z-10">
      <div className="relative px-[9px] pt-[9px] max-h-[158px] overflow-x-hidden overflow-y-auto">
        <FileListInChatInput apiKey={apiKey} fileConfig={fileConfig} />
        <div
          ref={wrapperRef}
          className="flex items-center justify-between"
        >
          <div className="flex items-center relative grow w-full">
            <div
              ref={textValueRef}
              className="absolute w-auto h-auto p-1 leading-6 body-lg-regular pointer-events-none whitespace-pre invisible"
            >
              {query}
            </div>
            <Textarea
              ref={textareaRef}
              className={cn('p-1 w-full leading-6 body-lg-regular text-text-tertiary bg-transparent outline-none')}
              placeholder="和机器人聊天"
              autoFocus
              autoSize={{ minRows: 1 }}
              value={query}
              onResize={handleTextareaResize}
              onChange={(e) => {
                setQuery(e.target.value);
                handleTextareaResize();
              }}
              maxLength={10000}
              onKeyDown={handleKeyDown}
            />
          </div>
          {!isMultipleLine && operation}
        </div>
      </div>
      {
        isMultipleLine && (
          <div className="px-[9px]">{operation}</div>
        )
      }
    </div>
  );
}

export default memo(ChatInputArea);
