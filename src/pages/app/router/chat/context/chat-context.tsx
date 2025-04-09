/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchAppInfo, fetchAppMeta, fetchAppParams, fetchChatList, fetchConversations, fetchSuggsted, generationConversationName, sendChatMessage, stopChat, updateFeedback } from '@/api/chat';
import { Annotation, FeedbackFunc } from '@/axios/type';
import { DEFAULT_USER_ID } from '@/config';
import { useAppsContext } from '@/context/apps-context';
import { AppInfo, ConversationItem, Feedbacktype, InputVarType, TransferMethod } from '@/typings/app';
import { buildChatItemTree, ChatItemInTree, getFormattedChatList, getLastAnswer, getProcessedFiles, getProcessedFilesFromResponse, getThreadMessages, isValidGeneratedAnswer, processOpeningStatement } from '@/utils/utils';
import { useBoolean, useGetState, useLocalStorageState, useRequest } from 'ahooks';
import { message } from 'antd';
import produce from 'immer';
import { uniqBy } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { createContext, useContext } from 'use-context-selector';
import { FileEntity } from '../types';

export const CONVERSATION_ID_INFO = 'chat-conversation-id-info'; // localstorage key

export type SendOptions = {
    parentChat?: ChatItemInTree | undefined
    files?: FileEntity[]
};

type ChatContextValue = {
    appId: string
    apiKey: string
    pathname: string
    loading: boolean
    loadingChatList: boolean
    isResponding: boolean
    newConversationId: string
    currentConversationId: string
    newConversationInputsRef: React.MutableRefObject<Record<string, any>>
    newConversationInputs: Record<string, any>
    showConfigPanelBeforeChat: boolean
    inputsForms: any[]
    appParams: any
    appInfo: AppInfo | undefined
    appMate: any
    conversationList: ConversationItem[]
    chatList: ChatItemInTree[]
    chatTree: ChatItemInTree[]
    targetMessageId: string
    messageTaskId: React.MutableRefObject<string>
    suggestedQuestions: string[]
    currentConversationItem: ConversationItem | undefined

    handleNewConversationInputsChange: (inputs: Record<string, any>) => void
    checkInputsRequired: (silent?: boolean) => boolean
    setConversationName: (conversationId: string, newName: string) => void
    handleStartChat: () => void
    handleChangeConversation: (conversationId: string) => void
    handleNewConversation: () => void
    handleNewConversationCompleted: (newConversationId: string) => void
    handleDelete: (conversationId: string) => void
    fetchConversationAndName: (flag?: boolean) => Promise<void>
    handleSend: (msg: string, options?: SendOptions) => void
    updateCurrentQAOnTree: (o: any) => void
    handleFeedback: FeedbackFunc
    handleStop: () => void
    handleRegenerate: (message: ChatItemInTree) => void
    setTargetMessageId: (messageId: string) => void
}

const ChatContext = createContext<ChatContextValue>({
  appId: '',
  apiKey: '',
  pathname: '',
  loading: false,
  loadingChatList: false,
  isResponding: false,
  newConversationId: '',
  currentConversationId: '',
  newConversationInputsRef: { current: {}},
  newConversationInputs: {},
  showConfigPanelBeforeChat: false,
  inputsForms: [],
  appParams: {},
  appInfo: undefined,
  appMate: {},
  conversationList: [],
  chatList: [],
  chatTree: [],
  targetMessageId: '',
  messageTaskId: { current: '' },
  suggestedQuestions: [],
  currentConversationItem: undefined,

  handleNewConversationInputsChange: () => {},
  checkInputsRequired: () => false,
  setConversationName: () => {},
  handleStartChat: () => {},
  handleChangeConversation: () => {},
  handleNewConversation: () => {},
  handleNewConversationCompleted: () => {},
  handleDelete: () => {},
  fetchConversationAndName: () => Promise.resolve(),
  handleSend: () => {},
  updateCurrentQAOnTree: () => {},
  handleFeedback: () => Promise.resolve(),
  handleStop: () => {},
  handleRegenerate: () => {},
  setTargetMessageId: () => {}
});

export function ChatContextProvider({ children }: Common.Children) {

  const { appId = '' } = useParams<{ appId: string }>(),
    [search] = useSearchParams(),
    pathname = useLocation().pathname;
  const apiKey = search.get('APIKEY') || '';

  const { changeChatResponding } = useAppsContext();

  // fetch data
  const { data: conversationData, run: runFetchConversations, loading: loadingConversations } = useRequest(() => fetchConversations({ apiKey, user: DEFAULT_USER_ID }), { manual: true });
  const { data: appParams, run: runFetchAppParams, loading: loadingAppParams } = useRequest(() => fetchAppParams({ apiKey }), { manual: true });
  const { data: appInfo, run: runFetchAppInfo, loading: loadingAppInfo } = useRequest(() => fetchAppInfo({ apiKey }), { manual: true });
  const { data: appMate, run: runFetchAppMeta, loading: loadingAppMate } = useRequest(() => fetchAppMeta({ apiKey }), { manual: true });
  const { data: appChatListData, run: runFetchChatList, loading: loadingChatList } = useRequest((conversation_id) => fetchChatList({ apiKey, conversation_id, user: DEFAULT_USER_ID, limit: 50 }), { manual: true });

  function fetchAll() {
    runFetchConversations();
    runFetchAppParams();
    runFetchAppInfo();
    runFetchAppMeta();
  }

  useEffect(() => {
    if(apiKey && appId) {
      fetchAll();
    }
  }, [apiKey, appId]);

  // loading
  const loading = loadingConversations || loadingAppParams || loadingAppInfo || loadingAppMate;
  const [isResponding, { setTrue: setRespondingTrue, setFalse: setRespondingFalse }] = useBoolean(false); // is responding to user's input

  useEffect(() => {
    changeChatResponding(isResponding);
  }, [isResponding]);

  // conversationId
  const [newConversationId, setNewConversationId] = useState('');
  const [conversationIdInfo, setConversationIdInfo] = useLocalStorageState<Record<string, string>>(CONVERSATION_ID_INFO, {
    defaultValue: {}
  });
  const currentConversationId = useMemo(() => conversationIdInfo?.[appId || ''] || '', [appId, conversationIdInfo]);

  useEffect(() => {
    if(currentConversationId !== '' && currentConversationId !== newConversationId) {
      runFetchChatList(currentConversationId);
    }
  }, [currentConversationId, newConversationId]);

  const handleConversationIdInfoChange = useCallback((changeConversationId: string) => {
    if(appId) {
      setConversationIdInfo({
        ...conversationIdInfo,
        [appId || '']: changeConversationId
      });
    }
  }, [appId, conversationIdInfo, setConversationIdInfo]);

  // new conversation inputs
  const newConversationInputsRef = useRef<Record<string, any>>({});
  const [newConversationInputs, setNewConversationInputs] = useState<Record<string, any>>({});
  // show config panel before chat
  const [showConfigPanelBeforeChat, setShowConfigPanelBeforeChat] = useState(true);

  const handleNewConversationInputsChange = useCallback((newInputs: Record<string, any>) => {
    newConversationInputsRef.current = newInputs;
    setNewConversationInputs(newInputs);
  }, [setNewConversationInputs]);

  const inputsForms: any[] = useMemo(() => {
    return (appParams?.user_input_form || []).filter((item: any) => !item.external_data_tool).map((item: any) => {
      if(item.paragraph) {
        return {
          ...item.paragraph,
          type: 'paragraph'
        };
      }
      if(item.number) {
        return {
          ...item.number,
          type: 'number'
        };
      }
      if(item.select) {
        return {
          ...item.select,
          type: 'select'
        };
      }

      if(item['file-list']) {
        return {
          ...item['file-list'],
          type: 'file-list'
        };
      }

      if(item.file) {
        return {
          ...item.file,
          type: 'file'
        };
      }

      return {
        ...item['text-input'],
        type: 'text-input'
      };
    });
  }, [appParams]);

  useEffect(() => {
    const conversationInputs: Record<string, any> = {};
    inputsForms.forEach((item: any) => {
      conversationInputs[item.variable] = item.default || null;
    });

    handleNewConversationInputsChange(conversationInputs);
  }, [handleNewConversationInputsChange, inputsForms]);

  const checkInputsRequired = useCallback((silent?: boolean) => {
    let hasEmptyInput = '';
    let fileIsUploading = false;
    const requiredVars = inputsForms.filter(({ required }) => required);

    if(requiredVars.length) {
      requiredVars.forEach(({ variable, label, type }) => {
        if(hasEmptyInput) return false;

        if(fileIsUploading) return false;

        if(!newConversationInputsRef.current[variable] && !silent) hasEmptyInput = label as string;

        if((type === InputVarType.singleFile || type === InputVarType.multiFiles) && newConversationInputsRef.current[variable] && !silent) {
          const files = newConversationInputsRef.current[variable];
          if(Array.isArray(files)) fileIsUploading = files.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId);
          else fileIsUploading = files.transferMethod === TransferMethod.local_file && !files.uploadedId;
        }
      });
    }

    if(hasEmptyInput) {
      message.warning(`${hasEmptyInput}不能为空`);
      return false;
    }

    if(fileIsUploading) {
      message.warning('请等待文件上传完成');
      return false;
    }

    return true;
  }, [inputsForms]);

  // conversation list
  const [originConversationList, setOriginConversationList] = useState<ConversationItem[]>([]);
  const [showNewConversationItemInList, setShowNewConversationItemInList] = useState(false);

  const conversationList = useMemo(() => {
    const data = originConversationList.slice();
    if(showNewConversationItemInList && data[0]?.id !== '') {
      data.unshift({
        id: '',
        name: '新的对话',
        inputs: newConversationInputsRef.current,
        introduction: ''
      });
    }
    return data;
  }, [originConversationList, showNewConversationItemInList]);

  useEffect(() => {
    if(conversationData?.data) setOriginConversationList(conversationData?.data);
  }, [conversationData]);

  const setConversationName = useCallback((conversationId: string, newName: string) => {
    setOriginConversationList(produce((draft) => {
      const index = originConversationList.findIndex(item => item.id === conversationId);
      const item = draft[index];

      draft[index] = {
        ...item,
        name: newName
      };
    }));
  }, [originConversationList, setOriginConversationList]);

  const handleStartChat = useCallback(() => {
    if(checkInputsRequired()) {
      setShowConfigPanelBeforeChat(false);
      setShowNewConversationItemInList(true);
      setChatList([]);
      setChatTree([]);
      setTargetMessageId('');
    }
  }, [setShowConfigPanelBeforeChat, setShowNewConversationItemInList, checkInputsRequired]);

  /*
  * chat info. chat is under conversation.
  */
  const [chatList, setChatList, getChatList] = useGetState<ChatItemInTree[]>([]);
  const [chatTree, setChatTree] = useState<ChatItemInTree[]>([]);
  const chatTreeRef = useRef<ChatItemInTree[]>(chatTree);
  const [targetMessageId, setTargetMessageId] = useState<string>('');
  const threadMessages = useMemo(() => getThreadMessages(chatTree, targetMessageId), [chatTree, targetMessageId]);

  const getIntroduction = useCallback((str: string) => {
    const inputs = currentConversationId ? currentConversationItem?.inputs : newConversationInputs;
    return processOpeningStatement(str, inputs || {}, inputsForms || []);
  }, [currentConversationId, newConversationInputs, inputsForms]);

  useEffect(() => {
    const ret = [...(threadMessages || [])];

    if(appParams?.opening_statement) {
      const index = threadMessages.findIndex(item => item.isOpeningStatement);

      if(index > -1) {
        ret[index] = {
          ...ret[index],
          content: getIntroduction(appParams.opening_statement),
          suggestedQuestions: appParams.suggested_questions
        };
      } else {
        ret.unshift({
          id: `${Date.now()}`,
          content: getIntroduction(appParams.opening_statement),
          isAnswer: true,
          isOpeningStatement: true,
          suggestedQuestions: appParams.suggested_questions
        });
      }
    }

    setChatList(ret);
  }, [threadMessages, appParams]);

  useEffect(() => {
    if(currentConversationId && appChatListData?.data.length && currentConversationId !== newConversationId) {
      const tree = buildChatItemTree(getFormattedChatList(appChatListData.data)) || [];
      setChatTree(tree);
      chatTreeRef.current = tree;
    }
  }, [appChatListData, currentConversationId, newConversationId]);

  const handleChangeConversation = useCallback((conversationId: string) => {
    if(isResponding) {
      message.warning('正在回复中，请稍后再试');
      return;
    }

    const conversation = conversationList.find(item => item.id === conversationId) || { inputs: {}};
    handleNewConversationInputsChange(conversation?.inputs || {});

    setSuggestQuestions([]);
    setChatTree([]);
    setTargetMessageId('');
    setNewConversationId('');
    handleConversationIdInfoChange(conversationId);
    if(conversationId === '' && checkInputsRequired(true)) setShowConfigPanelBeforeChat(true);
    else setShowConfigPanelBeforeChat(false);
  }, [isResponding, setChatList, setTargetMessageId, handleConversationIdInfoChange, setShowConfigPanelBeforeChat, checkInputsRequired]);

  const handleNewConversation = useCallback(() => {
    if(isResponding) {
      message.warning('正在生成回复，请稍后');
      return;
    }

    setNewConversationId('');
    if(showNewConversationItemInList) {
      handleChangeConversation('');
    } else if(currentConversationId || conversationList.length === 0) {
      handleChangeConversation('');
      setShowConfigPanelBeforeChat(true);
      setShowNewConversationItemInList(true);
      handleNewConversationInputsChange({});
    }
  }, [showNewConversationItemInList, isResponding, conversationList, currentConversationId, handleChangeConversation, handleConversationIdInfoChange, setShowConfigPanelBeforeChat, handleNewConversationInputsChange]);

  const handleNewConversationCompleted = useCallback((newConversationId: string) => {
    setNewConversationId(newConversationId);
    handleConversationIdInfoChange(newConversationId);
    setShowNewConversationItemInList(false);
  }, [handleConversationIdInfoChange, setShowNewConversationItemInList, setNewConversationId]);

  const handleDelete = (conversationId: string) => {
    if(conversationId === currentConversationId) handleNewConversation();

    handleUpdateConversationList();
  };

  const handleUpdateConversationList = useCallback(() => {
    runFetchConversations();
  }, [runFetchConversations]);

  const fetchConversationAndName = useCallback(async (flag: boolean = false) => {
    if(!currentConversationId || currentConversationId === '-1') {
      const { data: allConversations }: any = await fetchConversations({ apiKey, user: DEFAULT_USER_ID });
      const newItem: any = await generationConversationName({ id: allConversations[0].id, params: { user: DEFAULT_USER_ID, apiKey }});
      setOriginConversationList(allConversations);
      setConversationName(newItem.id, newItem.name);

      flag && handleNewConversationCompleted(allConversations[0].id);
    }
  }, [currentConversationId, setOriginConversationList, setConversationName, handleNewConversationCompleted]);

  /**
   * send message to sse server
   */
  const hasStopResponded = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const messageTaskId = useRef('');

  const handleSend = async (msg: string, options?: SendOptions) => {
    setSuggestQuestions([]);

    if(isResponding) {
      message.warning('请等待上条信息响应完成');
      return;
    }

    const { parentChat, files } = options || {};
    const data: Record<string, any> = {
      inputs: currentConversationId ? currentConversationItem?.inputs : newConversationInputsRef.current,
      query: msg,
      conversation_id: currentConversationId || '',
      apiKey,
      user: DEFAULT_USER_ID,
      files: getProcessedFiles(files || []),
      parent_message_id: (parentChat?.id ? parentChat.id : getLastAnswer(chatList)?.id) || ''
    };

    const parentMessage = chatList.find(item => item.id === data.parent_message_id);

    // question
    const questionId = `question-${Date.now()}`;
    const questionItem = {
      id: questionId,
      content: msg,
      isAnswer: false,
      message_files: [],
      parentMessageId: data.parent_message_id
    };

    const placeholderAnswerId = `answer-placeholder-${Date.now()}`;
    const placeholderAnswerItem = {
      id: placeholderAnswerId,
      content: '',
      isAnswer: true,
      parentMessageId: questionItem.id,
      siblingIndex: parentMessage?.children?.length ?? chatTree.length
    };

    // setTargetMessageId(parentMessage?.id);  // 暂时注释
    const newList = [...getChatList(), questionItem, placeholderAnswerItem];
    setChatList(newList);

    // updateCurrentQAOnTree({
    //   parentId: data.parent_message_id,
    //   responseItem: placeholderAnswerItem,
    //   placeholderQuestionId: questionId,
    //   questionItem
    // });

    // answer
    const responseItem: Chat.ChatItem = {
      id: `${Date.now()}`,
      content: '',
      agent_thoughts: [],
      message_files: [],
      isAnswer: true,
      parentMessageId: questionItem.id,
      siblingIndex: parentMessage?.children?.length ?? chatTree.length
    };
    const isAgentMode = false;
    let hasSetResponseId = false,
      tempNewConversationId = '';

    setRespondingTrue();
    hasStopResponded.current = false;
    sendChatMessage(data, {
      getAbortController: (ab) => {
        abortController.current = ab;
      },
      onData: (message: string, isFirstMessage: boolean, { conversationId: newConversationId, messageId, taskId }: any) => {
        if(!isAgentMode) {
          responseItem.content = responseItem.content + message;
        } else {
          const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1];
          if(lastThought) lastThought.thought = lastThought.thought + message; // need immer setAutoFreeze
        }

        if(messageId && !hasSetResponseId) {
          // questionItem.id = `question-${messageId}`;
          responseItem.id = messageId;
          responseItem.parentMessageId = questionItem.id;
          hasSetResponseId = true;
        }

        if(isFirstMessage && newConversationId) tempNewConversationId = newConversationId;
        messageTaskId.current = taskId;

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem
        });
      },
      async onCompleted(hasError?: boolean) {
        if(hasError) return;

        await fetchConversationAndName();

        handleNewConversationCompleted(tempNewConversationId);
        !hasStopResponded.current && handleSuggestQuestions(responseItem.id);
        messageTaskId.current = '';

        setRespondingFalse();
      },
      onFile(file) {
        const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1];
        if(lastThought) lastThought.message_files = [...(lastThought as any).message_files, { ...file }];

        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem
        });
      },
      onMessageEnd: (messageEnd) => {
        if(messageEnd.metadata?.annotation_reply) {
          responseItem.id = messageEnd.id;
          responseItem.annotation = ({
            id: messageEnd.metadata.annotation_reply.id,
            authorName: messageEnd.metadata.annotation_reply.account.name
          } as Annotation);
          updateCurrentQA({
            responseItem,
            questionId,
            placeholderAnswerId,
            questionItem
          });
          return;
        }

        // support show citation
        responseItem.citation = messageEnd.metadata?.retriever_resources || [];
        const processedFilesFromResponse = getProcessedFilesFromResponse(messageEnd.files || []);
        responseItem.allFiles = uniqBy([...(responseItem.allFiles || []), ...(processedFilesFromResponse || [])], 'id');
        updateCurrentQA({
          responseItem,
          questionId,
          placeholderAnswerId,
          questionItem
        });
      },
      onMessageReplace: (messageReplace) => {
        setChatList(produce(
          getChatList(),
          (draft) => {
            const current = draft.find(item => item.id === messageReplace.id);

            if(current) current.content = messageReplace.answer;
          }
        ));
      },
      onError() {
        setRespondingFalse();
        // role back placeholder answer
        setChatList(produce(getChatList(), (draft) => {
          draft.splice(draft.findIndex(item => item.id === placeholderAnswerId), 1);
        }));
        messageTaskId.current = '';
      }
    });
  };

  const currentConversationItem = useMemo(() => {
    const conversationItem = conversationList.find(item => item.id === currentConversationId);
    handleNewConversationInputsChange(conversationItem?.inputs || newConversationInputsRef.current);

    return conversationItem;
  }, [conversationList, currentConversationId]);

  const [suggestedQuestions, setSuggestQuestions] = useState<string[]>([]);

  const handleSuggestQuestions = useCallback(async (msgId: string) => {
    if(appParams?.suggested_questions_after_answer.enabled) {
      try {
        const res = await fetchSuggsted(msgId, { apiKey, user: DEFAULT_USER_ID });
        setSuggestQuestions(res.data);
      } catch(error) {
        setSuggestQuestions([]);
        console.log('error:>> ', error);
      }
    }
  }, [appParams]);

  /** Find the target node by bfs and then operate on it */
  const produceChatTreeNode = useCallback((targetId: string, operation: (node: ChatItemInTree) => void) => {
    return produce(chatTreeRef.current, (draft) => {
      const queue: ChatItemInTree[] = [...draft];
      while(queue.length > 0) {
        const current = queue.shift()!;
        if(current.id === targetId) {
          operation(current);
          break;
        }
        if(current.children) queue.push(...current.children);
      }
    });
  }, []);

  const updateCurrentQAOnTree = useCallback(({
    parentId,
    responseItem,
    placeholderQuestionId,
    questionItem
  }: {
      parentId?: string
      responseItem: Chat.ChatItem
      placeholderQuestionId: string
      questionItem: Chat.ChatItem
    }) => {
    let nextState: ChatItemInTree[];
    const currentQA = { ...questionItem, children: [{ ...responseItem, children: [] }] };
    if(!parentId && !chatTree.some(item => [placeholderQuestionId, questionItem.id].includes(item.id))) {
      // QA whose parent is not provided is considered as a first message of the conversation,
      // and it should be a root node of the chat tree
      nextState = produce(chatTree, (draft) => {
        draft.push(currentQA);
      });
    } else {
      // find the target QA in the tree and update it; if not found, insert it to its parent node
      nextState = produceChatTreeNode(parentId!, (parentNode) => {
        const questionNodeIndex = parentNode.children!.findIndex(item => [placeholderQuestionId, questionItem.id].includes(item.id));
        if(questionNodeIndex === -1) parentNode.children!.push(currentQA);
        else parentNode.children![questionNodeIndex] = currentQA;
      });
    }
    setChatTree(nextState);
    chatTreeRef.current = nextState;
  }, [chatTree, produceChatTreeNode]);

  const updateCurrentQAOnItem = useCallback(({ responseItem }: { responseItem: ChatItemInTree }) => {
    setChatList(produce(getChatList(), (draft) => {
      const currentIndex = draft.findIndex(item => item.id === responseItem.id);
      draft[currentIndex] = {
        ...draft[currentIndex],
        ...responseItem
      };
    }));
  }, [getChatList]);

  const updateCurrentQA = ({
    responseItem,
    questionId,
    placeholderAnswerId,
    questionItem
  }: {
        responseItem: Chat.ChatItem
        questionId: string
        placeholderAnswerId: string
        questionItem: Chat.ChatItem
      }) => {
    // closesure new list is outdated.
    const newListWithAnswer = produce(
      getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
      (draft) => {
        if(!draft.find(item => item.id === questionId)) draft.push({ ...questionItem });

        draft.push({ ...responseItem });
      }
    );
    setChatList(newListWithAnswer);
  };

  const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
    await updateFeedback(messageId, { rating: feedback.rating, apiKey, user: DEFAULT_USER_ID });
    // const newChatList = chatList.map((item) => {
    //   if(item.id === messageId) {
    //     return {
    //       ...item,
    //       feedback
    //     };
    //   }
    //   return item;
    // });
    // setChatList(newChatList);
    updateCurrentQAOnItem({ responseItem: { id: messageId, feedback } as ChatItemInTree });
    message.success('成功');
  };

  const handleStop = useCallback(async () => {
    hasStopResponded.current = true;
    setRespondingFalse();

    try {
      messageTaskId.current && await stopChat(messageTaskId.current, { apiKey, user: DEFAULT_USER_ID });
      messageTaskId.current = '';
      if(abortController.current) abortController.current.abort();
      await fetchConversationAndName(true);
    } catch(error) {
      console.log('stopChat error:>> ', error);
    }
  }, [setRespondingFalse, fetchConversationAndName]);

  const handleRegenerate = useCallback((chatItem: ChatItemInTree) => {
    const question = chatList.find(item => item.id === chatItem.parentMessageId)!;
    const parentAnswer = chatList.find(item => item.id === question?.parentMessageId);
    console.log('question:>> ', question, ' parentAnswer:>> ', parentAnswer);

    handleSend(question.content, { parentChat: isValidGeneratedAnswer(parentAnswer) ? parentAnswer : void 0 });

  }, [chatList]);

  return <ChatContext.Provider
    value={{
      appId,
      apiKey,
      pathname,
      loading,
      loadingChatList,
      isResponding,
      newConversationId,
      currentConversationId,
      newConversationInputsRef,
      newConversationInputs,
      showConfigPanelBeforeChat,
      inputsForms,
      appParams,
      appInfo,
      appMate,
      conversationList,
      chatList,
      chatTree,
      targetMessageId,
      messageTaskId,
      suggestedQuestions,
      currentConversationItem,

      handleNewConversationInputsChange,
      checkInputsRequired,
      setConversationName,
      handleStartChat,
      handleChangeConversation,
      handleNewConversation,
      handleNewConversationCompleted,
      handleDelete,
      fetchConversationAndName,
      handleSend,
      updateCurrentQAOnTree,
      handleFeedback,
      handleStop,
      handleRegenerate,
      setTargetMessageId
    }}
  >
    {children}
  </ChatContext.Provider>;
}

export const useChatContext = () => useContext(ChatContext);

export default ChatContext;
