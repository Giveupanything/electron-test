import { useRef, useState } from 'react';
import Textarea from 'rc-textarea';
import cn from '@/utils/classnames';
import { SendOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useChatContext } from '@/context/chat-context';

export default function ChatInputArea({ onSend }: { onSend: (query: string) => void }) {

  const { checkInputsRequired, isResponding } = useChatContext();

  const wrapperRef = useRef(null);
  const textareaRef = useRef(null);
  const [query, setQuery] = useState('');

  const handleSend = () => {
    if(!query || !query.trim()) {
      message.error('请输入内容');
      return;
    }

    if(isResponding) {
      message.error('请等待上条信息响应完成');
      return;
    }

    if(checkInputsRequired()) {
      onSend(query);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      setQuery(query.replace(/\n$/, ''));
      handleSend();
    }
  };

  return (
    <div className="relative pb-[9px] bg-[#fffffff2] border border-white rounded-xl shadow-md z-10">
      <div className="relative px-[9px] pt-[9px] max-h-[158px] overflow-x-hidden overflow-y-auto">
        <div
          ref={wrapperRef}
          className="flex items-center justify-between"
        >
          <div className="flex items-center relative grow w-full">
            <Textarea
              ref={textareaRef}
              className={cn('p-1 w-full leading-6 body-lg-regular text-text-tertiary bg-transparent outline-none')}
              placeholder="请输入消息"
              autoFocus
              autoSize={{ minRows: 1 }}
              // onResize={handleTextareaResize}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                //   handleTextareaResize()
              }}
              maxLength={10000}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="h-full flex">
            <div className="px-[7px] py-[2px] rounded-lg bg-[#2d60e7] flex-shrink-0 cursor-pointer" onClick={handleSend}><SendOutlined className="text-white" /></div>
          </div>
        </div>

      </div>
    </div>
  );
}
