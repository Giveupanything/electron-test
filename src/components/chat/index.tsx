import { useChatContext } from "@/context/chat-context";
import Sidebar from "./sidebar";
import ConfigPanel from "./config-panel";
import Loading from "../UI/loading";
import ChatWrapper from "./chat-wrapper";
import ExpandIcon from "@/assets/icons/epand.svg";
import classNames from "classnames";
import { useUpdate } from "ahooks";

const KEY = "chat-sidebar-fold";

export default function ChatPage() {
  const {
    apiKey,
    showConfigPanelBeforeChat,
    chatTree,
    loadingChatList,
    loading,
    currentConversationId,
  } = useChatContext();

  const update = useUpdate();

  const chatReady = !showConfigPanelBeforeChat || !!chatTree.length;

  const fold = Boolean(localStorage.getItem(KEY));
  const setFold = () => {
    update();
    if (fold) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, "true");
    }
  };

  if (loading) return <Loading type="app" />;

  return (
    <div
      className="h-full flex"
      style={{
        backgroundImage:
          chatReady && !loadingChatList
            ? "linear-gradient(180deg,rgba(249,250,251,.9),rgba(242,244,247,.9) 90.48%)"
            : "none",
      }}
    >
      {/* 侧边栏 */}
      <Sidebar apiKey={apiKey} fold={fold} />

      {/* 内容区 */}
      <div
        className={`overflow-hidden flex-1 rounded-md w-full h-full min-w-[750px] ${showConfigPanelBeforeChat && !chatTree.length && "flex items-center justify-center"} relative`}
      >
        <div
          className={classNames(
            "absolute  left-2 top-4 border border-[rgba(0,0,0,0.2)] rounded p-0.5 hover:opacity-70 z-10 cursor-pointer",
            {
              "rotate-180": !fold,
            }
          )}
          onClick={() => setFold(!fold)}
        >
          <img src={ExpandIcon} alt="" />
        </div>

        {showConfigPanelBeforeChat && !loadingChatList && !chatTree.length && (
          <div className={`flex w-full items-center justify-center h-full`}>
            <ConfigPanel />
          </div>
        )}

        {loadingChatList && chatReady && <Loading type="app" />}

        {chatReady && !loadingChatList && (
          <ChatWrapper key={currentConversationId} />
        )}
      </div>
    </div>
  );
}
