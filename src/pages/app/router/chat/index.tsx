import { useLocation } from 'react-router-dom';
import ChatPage from './components';
import { ChatContextProvider } from './context/chat-context';
import { FileContextProvider } from './context/file-context';

export default function Chat() {

  const pathname = useLocation().pathname;

  return (
    <ChatContextProvider key={pathname}>
      <FileContextProvider key={pathname}>
        <ChatPage />
      </FileContextProvider>
    </ChatContextProvider>
  );
}
