import { fetchAppInfo, fetchAppMeta, fetchAppParams, fetchChatList, fetchConversations, generationConversationName, sendChatMessage, stopChat, updateFeedback } from '@/api/chat';
import { Annotation, FeedbackFunc } from '@/axios/type';
import { DEFAULT_USER_ID } from '@/config';
import { AppConversationData, AppInfo, ConversationItem, Feedbacktype, WorkflowRunningStatus } from '@/typings/app';
import { buildChatItemTree, ChatItemInTree, getFormattedChatList, getLastAnswer, getProcessedFilesFromResponse, getThreadMessages, isValidGeneratedAnswer } from '@/utils/utils';
import { useBoolean, useGetState, useLocalStorageState, useRequest } from 'ahooks';
import { message } from 'antd';
import produce from 'immer';
import { uniqBy } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { createContext, useContext } from 'use-context-selector';
import { useAppsContext } from './apps-context';

export const CONVERSATION_ID_INFO = 'conversationIdInfo';

type ChatContextValue = {
    appId: string,
    apiKey: string,
    pathname: string,
    conversationData: AppConversationData,
    appParams: any,
    appInfo: AppInfo,
    appMate: any,
    loading: boolean
    currentConversationId: string
    newConversationInputsRef: React.MutableRefObject<any>
    newConversationInputs: Record<string, any>
    handleNewConversationInputsChange: (newInputs: Record<string, any>) => void
    conversationList: ConversationItem[]
    setConversationName: (conversationId: string, name: string) => void
    checkInputsRequired: (flag?: boolean) => boolean
    showConfigPanelBeforeChat: boolean
    handleStartChat: () => void
    handleChangeConversation: (conversationId: string) => void
    handleNewConversation: () => void
    newConversationId: string
    loadingChatList: boolean
    chatTree: any,
    handleNewConversationCompleted: (conversationId: string) => void
    inputsForms: any[]
    chatList: Chat.ChatItem[]
    isResponding: boolean
    handleSend: (msg: string, options?: Record<string, any>) => void
    abortController: AbortController | null
    messageTaskId: string
    handleFeedback: FeedbackFunc
    handleStop: () => Promise<void>
    handleDelete: (conversationId: string) => void
    handleStopChange: () => void
    handleRegenerate: (item: Chat.ChatItem) => void
    setTargetMessageId: (id: string) => void
}

const ChatContext = createContext<ChatContextValue>({
  appId: '',
  apiKey: '',
  pathname: '',
  conversationData: {} as AppConversationData,
  appParams: {},
  appInfo: {} as AppInfo,
  appMate: {},
  loading: false,
  currentConversationId: '',
  newConversationInputsRef: {
    current: undefined
  },
  newConversationInputs: {},
  handleNewConversationInputsChange: () => {},
  conversationList: [],
  setConversationName: () => {},
  checkInputsRequired: () => false,
  showConfigPanelBeforeChat: false,
  handleStartChat: () => {},
  handleChangeConversation: () => {},
  handleNewConversation: () => {},
  newConversationId: '',
  loadingChatList: false,
  chatTree: [],
  handleNewConversationCompleted: () => {},
  inputsForms: [],
  chatList: [],
  isResponding: false,
  handleSend: () => {},
  abortController: null,
  messageTaskId: '',
  handleFeedback: () => Promise.resolve(),
  handleStop: () => Promise.resolve(),
  handleDelete: () => {},
  handleStopChange: () => {},
  handleRegenerate: () => {},
  setTargetMessageId: () => {}
});

export function ChatContextProvider({ children }: Common.Children) {

  const { changeChatResponding } = useAppsContext();

  const { appId = '' } = useParams<{ appId: string }>(),
    [search] = useSearchParams(),
    pathname = useLocation().pathname;
  const apiKey = search.get('APIKEY') || '';

  // fetch data
  const { data: conversationData, run: runFetchConversations, loading: loadingConversations } = useRequest(() => fetchConversations({ apiKey, user: DEFAULT_USER_ID }), { manual: true });
  const { data: appParams, run: runFetchAppParams, loading: loadingAppParams } = useRequest(() => fetchAppParams({ apiKey }), { manual: true });
  const { data: appInfo, run: runFetchAppInfo, loading: loadingAppInfo } = useRequest(() => fetchAppInfo({ apiKey }), { manual: true });
  const { data: appMate, run: runFetchAppMeta, loading: loadingAppMate } = useRequest(() => fetchAppMeta({ apiKey }), { manual: true });
  const { data: appChatListData, run: runFetchChatList, loading: loadingChatList } = useRequest((conversation_id) => fetchChatList({ apiKey, conversation_id, user: DEFAULT_USER_ID, limit: 50 }), { manual: true });

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
  const [showConfigPanelBeforeChat, setShowConfigPanelBeforeChat] = useState(false); // default false
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
    // let hasEmptyInput = '';
    // let fileIsUploading = false;
    // const requiredVars = inputsForms.filter(({ required }) => required);

    // if(requiredVars.length) {
    //   requiredVars.forEach(({ variable, label, type }) => {
    //     if(hasEmptyInput) return false;

    //     if(fileIsUploading) return false;

    //     if(!newConversationInputsRef.current[variable] && !silent) hasEmptyInput = label as string;

    //     if((type === InputVarType.singleFile || type === InputVarType.multiFiles) && newConversationInputsRef.current[variable] && !silent) {
    //       const files = newConversationInputsRef.current[variable];
    //       if(Array.isArray(files)) fileIsUploading = files.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId);
    //       else fileIsUploading = files.transferMethod === TransferMethod.local_file && !files.uploadedId;
    //     }
    //   });
    // }

    // if(hasEmptyInput) {
    //   message.warning(`${hasEmptyInput}不能为空`);
    //   return false;
    // }

    // if(fileIsUploading) {
    //   message.warning('请等待文件上传完成');
    //   return false;
    // }

    return true;
  }, [inputsForms, newConversationInputs]);

  // conversation list
  const [originConversationList, setOriginConversationList] = useState<ConversationItem[]>([]);
  const [showNewConversationItemInList, setShowNewConversationItemInList] = useState(false);
  const conversationList = useMemo(() => {
    const data = originConversationList.slice();
    if(showNewConversationItemInList && data[0]?.id !== '') {
      data.unshift({
        id: '',
        name: '新的对话',
        inputs: {},
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

  const handleChangeConversation = useCallback((conversationId: string) => {
    if(isResponding) {
      message.warning('正在回复中，请稍后再试');
      return;
    }

    setChatTree([]);
    setTargetMessageId('');
    setNewConversationId('');
    handleConversationIdInfoChange(conversationId);
    if(conversationId === '' && !checkInputsRequired(true)) setShowConfigPanelBeforeChat(true);
    else setShowConfigPanelBeforeChat(false);
  }, [isResponding, handleConversationIdInfoChange, setShowConfigPanelBeforeChat, checkInputsRequired]);

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
      // setShowConfigPanelBeforeChat(true);
      setShowConfigPanelBeforeChat(false);
      setShowNewConversationItemInList(true);
      handleNewConversationInputsChange({});
    }
  }, [handleChangeConversation, currentConversationId, handleConversationIdInfoChange, setShowConfigPanelBeforeChat, handleNewConversationInputsChange, isResponding]);

  useEffect(() => {
    if(apiKey && appId) {
      fetchAll();
    }
  }, [apiKey, appId]);

  useEffect(() => {
    if(currentConversationId !== '' && currentConversationId !== newConversationId) {
      runFetchChatList(currentConversationId);
    }
  }, [currentConversationId, newConversationId]);

  /*
  * chat info. chat is under conversation.
  */
  const [chatList, setChatList, getChatList] = useGetState<Chat.ChatItem[]>([]);

  const [chatTree, setChatTree] = useState<ChatItemInTree[]>([]);
  const chatTreeRef = useRef<ChatItemInTree[]>(chatTree);
  const [targetMessageId, setTargetMessageId] = useState<string>();
  const threadMessages = useMemo(() => getThreadMessages(chatTree, targetMessageId), [chatTree, targetMessageId]);

  useEffect(() => {
    const ret = [...(threadMessages || [])];
    setChatList(ret);
  }, [threadMessages]);

  useEffect(() => {
    if(currentConversationId && appChatListData?.data.length && currentConversationId !== newConversationId) {
      const tree = buildChatItemTree(getFormattedChatList(appChatListData.data)) || [];
      setChatTree(tree);
      chatTreeRef.current = tree;
    }
  }, [appChatListData, currentConversationId, newConversationId]);

  // useEffect(() => {
  // console.log('chatTree:>>------- ', chatTree);
  // }, [chatTree]);

  useEffect(() => {
    setChatTree([]);
    setNewConversationId('');
    setTargetMessageId('');
    chatTreeRef.current = [];
    // setShowConfigPanelBeforeChat(true);
    setShowConfigPanelBeforeChat(false);

    return () => {
      setChatTree([]);
      setNewConversationId('');
      setTargetMessageId('');
      chatTreeRef.current = [];
      // setShowConfigPanelBeforeChat(true);
      setShowConfigPanelBeforeChat(false);
    };
  }, [pathname]);

  const handleNewConversationCompleted = useCallback((newConversationId: string) => {
    setNewConversationId(newConversationId);
    handleConversationIdInfoChange(newConversationId);
    setShowNewConversationItemInList(false);
    // runFetchConversations();
  }, [handleConversationIdInfoChange, runFetchConversations, setShowNewConversationItemInList, setNewConversationId]);

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

  function fetchAll() {
    runFetchConversations();
    runFetchAppParams();
    runFetchAppInfo();
    runFetchAppMeta();
  }

  const hasStopResponded = useRef(false);
  const abortController = useRef<AbortController | null>(null);
  const messageTaskId = useRef('');

  const handleSend = async (msg: string, options?: Record<string, any>) => { //  files?: VisionFile[]
    if(isResponding) {
      message.warning('请等待上条信息响应完成');
      return;
    }

    const { parentChat } = options || {};

    const data: Record<string, any> = {
      inputs: newConversationInputsRef.current,
      query: msg,
      conversation_id: currentConversationId || '',
      apiKey,
      user: DEFAULT_USER_ID,
      parent_message_id: parentChat?.id ? parentChat.id : getLastAnswer(chatList)?.id
    };

    const parentMessage = chatList.find(item => item.id === data.parent_message_id) as ChatItemInTree;

    // question
    const questionId = `question-${Date.now()}`;
    const questionItem = {
      id: questionId,
      content: msg,
      isAnswer: false,
      message_files: [],
      parentMessageId: data.parent_message_id
    } as Chat.ChatItem;

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

    let isAgentMode = false;

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
    let hasSetResponseId = false;

    let tempNewConversationId = '';
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

        messageTaskId.current = '';
        handleNewConversationCompleted(tempNewConversationId);

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
      onThought(thought) {
        isAgentMode = true;
        const response = responseItem as any;
        if(thought.message_id && !hasSetResponseId) {
          response.id = thought.message_id;
          hasSetResponseId = true;
        }
        // responseItem.id = thought.message_id;
        if(response.agent_thoughts.length === 0) {
          response.agent_thoughts.push(thought);
        } else {
          const lastThought = response.agent_thoughts[response.agent_thoughts.length - 1];
          // thought changed but still the same thought, so update.
          if(lastThought.id === thought.id) {
            thought.thought = lastThought.thought;
            thought.message_files = lastThought.message_files;
            responseItem.agent_thoughts![response.agent_thoughts.length - 1] = thought;
          } else {
            responseItem.agent_thoughts!.push(thought);
          }
        }
        // has switched to other conversation
        // if (prevTempNewConversationId !== currentConversationId) {
        //   setIsRespondingConCurrCon(false)
        //   return false
        // }

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
          const newListWithAnswer = produce(
            getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
            (draft) => {
              if(!draft.find(item => item.id === questionId)) draft.push({ ...questionItem });

              draft.push({
                ...responseItem
              });
            }
          );
          setChatList(newListWithAnswer);
          return;
        }

        // support show citation
        responseItem.citation = messageEnd.metadata?.retriever_resources || [];
        const processedFilesFromResponse = getProcessedFilesFromResponse(messageEnd.files || []);
        responseItem.allFiles = uniqBy([...(responseItem.allFiles || []), ...(processedFilesFromResponse || [])], 'id');

        const newListWithAnswer = produce(
          getChatList().filter(item => item.id !== responseItem.id && item.id !== placeholderAnswerId),
          (draft) => {
            if(!draft.find(item => item.id === questionId)) draft.push({ ...questionItem });

            draft.push({ ...responseItem });
          }
        );
        setChatList(newListWithAnswer);
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
      },
      onWorkflowStarted: ({ workflow_run_id, task_id }) => {
        messageTaskId.current = task_id;
        responseItem.workflow_run_id = workflow_run_id;
        responseItem.workflowProcess = {
          status: WorkflowRunningStatus.Running,
          tracing: []
        };
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id);
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem
          };
        }));
      },
      onWorkflowFinished: ({ data }) => {
        responseItem.workflowProcess!.status = data.status as WorkflowRunningStatus;
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id);
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem
          };
        }));
      },
      onNodeStarted: ({ data }) => {
        responseItem.workflowProcess!.tracing!.push(data as any);
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id);
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem
          };
        }));
      },
      onNodeFinished: ({ data }) => {
        const currentIndex = responseItem.workflowProcess!.tracing!.findIndex(item => item.node_id === data.node_id);
        responseItem.workflowProcess!.tracing[currentIndex] = data as any;
        setChatList(produce(getChatList(), (draft) => {
          const currentIndex = draft.findIndex(item => item.id === responseItem.id);
          draft[currentIndex] = {
            ...draft[currentIndex],
            ...responseItem
          };
        }));
      }
    });
  };

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleFeedback = async (messageId: string, feedback: Feedbacktype) => {
    await updateFeedback(messageId, { rating: feedback.rating, apiKey, user: DEFAULT_USER_ID });
    const newChatList = chatList.map((item) => {
      if(item.id === messageId) {
        return {
          ...item,
          feedback
        };
      }
      return item;
    });
    setChatList(newChatList);
    message.success('成功');
  };

  const handleStopChange = useCallback(() => {
    hasStopResponded.current = true;
    setRespondingFalse();
    if(abortController.current) abortController.current.abort();
  }, [setRespondingFalse]);

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

  const handleRegenerate = useCallback((chatItem: Chat.ChatItem) => {
    const question = chatList.find(item => item.id === chatItem.parentMessageId)!;
    const parentAnswer = chatList.find(item => item.id === question?.parentMessageId);
    console.log('question:>> ', question, ' parentAnswer:>> ', parentAnswer);

    handleSend(question.content, { parentChat: isValidGeneratedAnswer(parentAnswer) ? parentAnswer : null });

  }, [chatList]);

  return (
    <ChatContext.Provider
      value={{
        appId,
        apiKey,
        pathname,
        conversationData: conversationData || {} as AppConversationData,
        appParams,
        appInfo: appInfo || {} as AppInfo,
        appMate,
        loading,
        currentConversationId,
        newConversationInputsRef,
        newConversationInputs,
        conversationList,
        showConfigPanelBeforeChat,
        newConversationId,
        loadingChatList,
        chatTree,
        inputsForms,
        chatList,
        isResponding,
        abortController: abortController.current,
        messageTaskId: messageTaskId.current,
        handleNewConversationInputsChange,
        setConversationName,
        checkInputsRequired,
        handleStartChat,
        handleChangeConversation,
        handleNewConversation,
        handleNewConversationCompleted,
        handleSend,
        handleFeedback,
        handleStop,
        handleDelete,
        handleStopChange,
        handleRegenerate,
        setTargetMessageId
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => useContext(ChatContext);

export default ChatContext;
