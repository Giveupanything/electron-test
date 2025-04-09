import Loading from '@/components/UI/loading';
import { useChatContext } from '../context/chat-context';
import Sidebar from './sidebar';
import ConfigPanel from './config-panel';
import ChatWrapper from './chat-wrapper';

export default function ChatPage() {

  const {
    apiKey, loading, showConfigPanelBeforeChat, chatTree, loadingChatList, currentConversationId, conversationList, appInfo, appMate, chatList, isResponding, messageTaskId,
    suggestedQuestions, appParams, currentConversationItem, newConversationInputs, inputsForms,
    handleChangeConversation, handleNewConversation, setConversationName, handleDelete, handleStartChat, handleSend, setTargetMessageId, handleFeedback, handleRegenerate, handleStop,
    checkInputsRequired
  } = useChatContext();

  const chatReady = (!showConfigPanelBeforeChat || !!chatTree.length);

  if(loading) return <Loading type="app" />;

  return (
    <div
      className="h-full flex"
      style={{
        backgroundImage: (chatReady && !loadingChatList) ? 'linear-gradient(180deg,rgba(249,250,251,.9),rgba(242,244,247,.9) 90.48%)' : 'none'
      }}
    >
      {/* 侧边栏 */}
      <Sidebar
        apiKey={apiKey}
        currentConversationId={currentConversationId}
        conversationList={conversationList}
        handleChangeConversation={handleChangeConversation}
        handleNewConversation={handleNewConversation}
        setConversationName={setConversationName}
        handleDelete={handleDelete}
      />

      {/* 内容区 */}
      <div className={`overflow-hidden flex-1 rounded-md w-full h-full min-w-[750px] ${showConfigPanelBeforeChat && !chatTree.length && 'flex items-center justify-center'}`}>
        {
          showConfigPanelBeforeChat && !loadingChatList && !chatTree.length && (
            <div className={`flex w-full items-center justify-center h-full`}>
              <ConfigPanel
                appInfo={appInfo}
                appMate={appMate}
                showConfigPanelBeforeChat={showConfigPanelBeforeChat}
                handleStartChat={handleStartChat}
              />
            </div>
          )
        }

        {
          loadingChatList && chatReady && (
            <Loading type="app" />
          )
        }

        {
          chatReady && !loadingChatList && (
            <ChatWrapper
              key={currentConversationId}
              apiKey={apiKey}
              appParams={appParams}
              chatList={chatList}
              isResponding={isResponding}
              messageTaskId={messageTaskId}
              suggestedQuestions={suggestedQuestions}
              inputs={currentConversationId ? currentConversationItem?.inputs || {} : newConversationInputs}
              inputsForms={inputsForms}
              handleSend={handleSend}
              setTargetMessageId={setTargetMessageId}
              handleFeedback={handleFeedback}
              handleRegenerate={handleRegenerate}
              handleStop={handleStop}
              checkInputsRequired={checkInputsRequired}
            />
          )
        }
      </div>
    </div>
  );
}
