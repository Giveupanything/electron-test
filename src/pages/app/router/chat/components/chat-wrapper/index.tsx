import ChatInputArea from '../chat-input-area';
import { memo, MutableRefObject, useCallback, useEffect, useRef } from 'react';
import Answer from '../answer';
import Question from '../question';
import { Button } from 'antd';
import StopCircle from '@/components/base/icon/StopCircle';
import { ChatItemInTree, InputForm } from '@/utils/utils';
import { FeedbackFunc } from '@/axios/type';
import { SendOptions } from '../../context/chat-context';
import TryToAsk from '../try-to-ask';
import { FileEntity } from '../../types';

type Props = {
  chatList: ChatItemInTree[];
  isResponding: boolean;
  messageTaskId: MutableRefObject<string>;
  suggestedQuestions: string[];
  appParams: any;
  inputs: Record<string, any> | null
  inputsForms: InputForm[]
  apiKey: string
  handleSend: (query: string, options?: SendOptions) => void;
  handleFeedback: FeedbackFunc;
  handleRegenerate: (chat: ChatItemInTree) => void;
  handleStop: () => void;
  setTargetMessageId: (id: string) => void;
  checkInputsRequired: () => boolean;
}

function ChatWrapper({
  apiKey,
  appParams,
  chatList,
  isResponding,
  messageTaskId,
  suggestedQuestions,
  inputs,
  inputsForms,
  handleSend,
  handleFeedback,
  handleRegenerate,
  handleStop,
  setTargetMessageId,
  checkInputsRequired
}: Props) {

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  function onSend(query: string, files?: FileEntity[]) {
    handleSend(query, { files });
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

  const hasTryToAsk = appParams?.suggested_questions_after_answer?.enabled && !!suggestedQuestions?.length && onSend;

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
                  apiKey={apiKey}
                  id={item.id}
                  content={item.content}
                  useCurrentUserAvatar={false}
                  // imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
                  messageFiles={item.message_files || []}
                />
              );
            })}
          </div>
        </div>

        {/* input */}
        <div className="pb-4 w-full">
          {/* 暂停 */}
          {
            (isResponding && messageTaskId.current) &&
            <div className="flex justify-center mb-4">
              <Button className="rounded-lg" onClick={handleStop}>
                <StopCircle className="mr-[5px] w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500 font-normal">停止响应</span>
              </Button>
            </div>
          }

          {
            hasTryToAsk && (
              <TryToAsk
                suggestedQuestions={suggestedQuestions}
                onSend={onSend}
              />
            )
          }

          <div className="mx-auto w-full max-w-[720px] relative">
            <ChatInputArea
              apiKey={apiKey}
              fileConfig={appParams?.file_upload}
              isResponding={isResponding}
              inputs={inputs}
              inputsForms={inputsForms}
              onSend={onSend}
              checkInputsRequired={checkInputsRequired}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default memo(ChatWrapper);
