import ChatPage from '@/components/chat';
import { ChatContextProvider } from '@/context/chat-context';

export default function Chat() {

  return (
    <ChatContextProvider>
      <ChatPage />
    </ChatContextProvider>
  );
}
