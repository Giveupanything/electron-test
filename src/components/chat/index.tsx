import { useChatContext } from '@/context/chat-context';
import Sidebar from './sidebar';
import ConfigPanel from './config-panel';
import Loading from '../UI/loading';
import ChatWrapper from './chat-wrapper';

export default function ChatPage() {

  const { apiKey, showConfigPanelBeforeChat, chatTree, loadingChatList, loading, currentConversationId } = useChatContext();

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
      <Sidebar apiKey={apiKey} />

      {/* 内容区 */}
      <div className={`overflow-hidden flex-1 rounded-md w-full h-full min-w-[750px] ${showConfigPanelBeforeChat && !chatTree.length && 'flex items-center justify-center'}`}>
        {
          showConfigPanelBeforeChat && !loadingChatList && !chatTree.length && (
            <div className={`flex w-full items-center justify-center h-full`}>
              <ConfigPanel />
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
            <ChatWrapper key={currentConversationId} />
          )
        }
      </div>
    </div>
  );
}
