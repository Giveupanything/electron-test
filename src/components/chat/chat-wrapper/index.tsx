import ChatInputArea from '../chat-input-area';
import { useChatContext } from '@/context/chat-context';
import { useCallback, useEffect, useRef } from 'react';
import Answer from '../answer';
import Question from '../question';
import { Button } from 'antd';
import StopCircle from '@/components/base/icon/StopCircle';

export default function ChatWrapper() {

  const { handleSend, chatList, isResponding, handleFeedback, handleStop, handleRegenerate, setTargetMessageId, messageTaskId } = useChatContext();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  function onSend(query: string) {
    handleSend(query);
  }

  useEffect(() => {
    console.log('chatList:>> ', chatList);
  }, [chatList]);

  const handleScrollToBottom = useCallback(() => {
    if(chatList.length > 1 && chatContainerRef.current && !userScrolledRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatList.length]);

  useEffect(() => {
    handleScrollToBottom();
  }, [handleScrollToBottom]);

  useEffect(() => {
    if(chatContainerRef.current) {
      requestAnimationFrame(() => {
        handleScrollToBottom();
      });
    }
  });

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if(chatContainer) {
      const setUserScrolled = () => {
        if(chatContainer) userScrolledRef.current = chatContainer.scrollHeight - chatContainer.scrollTop >= chatContainer.clientHeight + 300;
      };
      chatContainer.addEventListener('scroll', setUserScrolled);
      return () => chatContainer.removeEventListener('scroll', setUserScrolled);
    }
  }, []);

  return (
    <div
      className="h-full bg-chatbot-bg overflow-hidden"
    >
      <div className="relative h-full flex flex-col">
        <div className="relative h-full overflow-y-auto overflow-x-hidden flex-1" ref={chatContainerRef}>

          <div className="mx-auto pt-6 w-full max-w-[720px]">
            {chatList.map((item) => {
              if(item.isAnswer) {
                const isLast = item.id === chatList[chatList.length - 1].id;
                return <Answer
                  key={item.id}
                  item={item}
                  feedbackDisabled={false}
                  onFeedback={handleFeedback}
                  onRegenerate={handleRegenerate}
                  switchSibling={id => setTargetMessageId(id)}
                  isResponding={isResponding && isLast}
                />;
              }
              return (
                <Question
                  key={item.id}
                  id={item.id}
                  content={item.content}
                  useCurrentUserAvatar={false}
                  imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
                />
              );
            })}
          </div>
        </div>

        {/* input */}
        <div className="pb-4 w-full">
          {/* 暂停 */}
          {
            (isResponding && messageTaskId) &&
            <div className="flex justify-center mb-4">
              <Button className="rounded-lg" onClick={handleStop}>
                <StopCircle className="mr-[5px] w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-normal">停止响应</span>
              </Button>
            </div>
          }

          <div className="mx-auto w-full max-w-[720px] relative">
            <ChatInputArea onSend={onSend} />
          </div>
        </div>
      </div>

    </div>
  );
}
