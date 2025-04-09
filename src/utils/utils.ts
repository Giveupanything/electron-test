import { IChatItem } from '@/axios/type';
import { InputVarType, TransferMethod } from '@/typings/app';

export type ChatItemInTree = {
  children?: ChatItemInTree[]
} & Chat.ChatItem

export const UUID_NIL = '00000000-0000-0000-0000-000000000000';

async function decodeBase64AndDecompress(base64String: string) {
  const binaryString = atob(base64String);
  const compressedUint8Array = Uint8Array.from(binaryString, char => char.charCodeAt(0));
  const decompressedStream = new Response(compressedUint8Array).body?.pipeThrough(new DecompressionStream('gzip'));
  const decompressedArrayBuffer = await new Response(decompressedStream).arrayBuffer();
  return new TextDecoder().decode(decompressedArrayBuffer);
}

function getProcessedInputsFromUrlParams(): Record<string, any> {
  const urlParams = new URLSearchParams(window.location.search);
  const inputs: Record<string, any> = {};
  urlParams.forEach(async (value, key) => {
    inputs[key] = await decodeBase64AndDecompress(decodeURIComponent(value));
  });
  return inputs;
}

function isValidGeneratedAnswer(item?: Chat.ChatItem | ChatItemInTree): boolean {
  return !!item && item.isAnswer && !item.id.startsWith('answer-placeholder-') && !item.isOpeningStatement;
}

function getLastAnswer<T extends Chat.ChatItem | ChatItemInTree>(chatList: T[]): T | null {
  for(let i = chatList.length - 1; i >= 0; i--) {
    const item = chatList[i];
    if(isValidGeneratedAnswer(item)) return item;
  }
  return null;
}

/**
 * Build a chat item tree from a chat list
 * @param allMessages - The chat list, sorted from oldest to newest
 * @returns The chat item tree
 */
function buildChatItemTree(allMessages: IChatItem[]): ChatItemInTree[] {
  const map: Record<string, ChatItemInTree> = {};
  const rootNodes: ChatItemInTree[] = [];
  const childrenCount: Record<string, number> = {};

  let lastAppendedLegacyAnswer: ChatItemInTree | null = null;
  for(let i = 0; i < allMessages.length; i += 2) {
    const question = allMessages[i]!;
    const answer = allMessages[i + 1]!;

    const isLegacy = question.parentMessageId === UUID_NIL;
    const parentMessageId = isLegacy
      ? (lastAppendedLegacyAnswer?.id || '')
      : (question.parentMessageId || '');

    // Process question
    childrenCount[parentMessageId] = (childrenCount[parentMessageId] || 0) + 1;
    const questionNode: ChatItemInTree = {
      ...question,
      children: []
    };
    map[question.id] = questionNode;

    // Process answer
    childrenCount[question.id] = 1;
    const answerNode: ChatItemInTree = {
      ...answer,
      children: [],
      siblingIndex: isLegacy ? 0 : childrenCount[parentMessageId] - 1
    };
    map[answer.id] = answerNode;

    // Connect question and answer
    questionNode.children!.push(answerNode);

    // Append to parent or add to root
    if(isLegacy) {
      if(!lastAppendedLegacyAnswer) rootNodes.push(questionNode);
      else lastAppendedLegacyAnswer.children!.push(questionNode);

      lastAppendedLegacyAnswer = answerNode;

    } else {
      if(
        !parentMessageId
        || !allMessages.some(item => item.id === parentMessageId) // parent message might not be fetched yet, in this case we will append the question to the root nodes
      ) rootNodes.push(questionNode);
      else map[parentMessageId]?.children!.push(questionNode);
    }
  }

  return rootNodes;
}

function getThreadMessages(tree: ChatItemInTree[], targetMessageId?: string, isReverse = true): ChatItemInTree[] {
  let ret: ChatItemInTree[] = [];
  let targetNode: ChatItemInTree | undefined;

  // find path to the target message
  const stack = tree.slice().reverse().map(rootNode => ({
    node: rootNode,
    path: [rootNode]
  }));

  while(stack.length > 0) {
    const { node, path } = stack.pop()!;
    if(
      node.id === targetMessageId
      || (!targetMessageId && !node.children?.length && !stack.length) // if targetMessageId is not provided, we use the last message in the tree as the target
    ) {
      targetNode = node;
      ret = path.map((item, index) => {
        if(!item.isAnswer) return item;

        const parentAnswer = path[index - 2];
        const siblingCount = !parentAnswer ? tree.length : parentAnswer.children!.length;
        const prevSibling = !parentAnswer ? tree[item.siblingIndex! - 1]?.children?.[0]?.id : parentAnswer.children![item.siblingIndex! - 1]?.children?.[0].id;
        const nextSibling = !parentAnswer ? tree[item.siblingIndex! + 1]?.children?.[0]?.id : parentAnswer.children![item.siblingIndex! + 1]?.children?.[0].id;

        return { ...item, siblingCount, prevSibling, nextSibling };
      });
      break;
    }
    if(node.children) {
      for(let i = node.children.length - 1; i >= 0; i--) {
        stack.push({
          node: node.children[i],
          path: [...path, node.children[i]]
        });
      }
    }
  }

  // append all descendant messages to the path
  if(targetNode) {
    const stack = [targetNode];
    while(stack.length > 0) {
      const node = stack.pop()!;
      if(node !== targetNode) ret.push(node);
      if(node.children?.length) {
        const lastChild = node.children.at(-1)!;

        if(!lastChild.isAnswer) {
          stack.push(lastChild);
          continue;
        }

        const parentAnswer = ret.at(-2);
        const siblingCount = parentAnswer?.children?.length;
        const prevSibling = parentAnswer?.children?.at(-2)?.children?.[0]?.id;

        stack.push({ ...lastChild, siblingCount, prevSibling });
      }
    }
  }

  return isReverse ? reversePairs(ret) : ret;
  // return ret;
}

// 反转数组 每两条两条反转
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reversePairs(arr: any[]) {
  const newArr = [];
  for(let i = 0; i < arr.length; i += 2) {
    if(arr[i + 1]) newArr.unshift(arr[i + 1]);
    newArr.unshift(arr[i]);
  }

  return newArr;
}

export const sortAgentSorts = (list: any[]) => {
  if(!list) return list;
  if(list.some(item => item.position === undefined)) return list;
  const temp = [...list];
  temp.sort((a, b) => a.position - b.position);
  return temp;
};

export const addFileInfos = (list: any[], messageFiles: (any | any)[]) => {
  if(!list || !messageFiles) return list;
  return list.map((item) => {
    if(item.files && item.files?.length > 0) {
      return {
        ...item,
        message_files: item.files.map((fileId: any) => messageFiles.find(file => file.id === fileId)) as any[]
      };
    }
    return item;
  });
};

export type FileResponse = {
  related_id: string
  extension: string
  filename: string
  size: number
  mime_type: string
  transfer_method: TransferMethod
  type: string
  url: string
}

export const getProcessedFilesFromResponse = (files: FileResponse[]) => {
  return files.map((fileItem) => {
    return {
      id: fileItem.related_id,
      name: fileItem.filename,
      size: fileItem.size || 0,
      type: fileItem.mime_type,
      progress: 100,
      transferMethod: fileItem.transfer_method,
      supportFileType: fileItem.type,
      uploadedId: fileItem.related_id,
      url: fileItem.url
    };
  });
};

export function getFormattedChatList(messages: any[]) {
  const newChatList: Chat.ChatItem[] = [];
  messages.forEach((item) => {
    const questionFiles = item.message_files?.filter((file: any) => file.belongs_to === 'user') || [];
    newChatList.push({
      id: `question-${item.id}`,
      content: item.query,
      isAnswer: false,
      message_files: getProcessedFilesFromResponse(questionFiles.map((item: any) => ({ ...item, related_id: item.id }))),
      parentMessageId: item.parent_message_id || undefined
    } as unknown as Chat.ChatItem);
    const answerFiles = item.message_files?.filter((file: any) => file.belongs_to === 'assistant') || [];
    newChatList.push({
      id: item.id,
      content: item.answer,
      agent_thoughts: addFileInfos(item.agent_thoughts ? sortAgentSorts(item.agent_thoughts) : item.agent_thoughts, item.message_files),
      feedback: item.feedback,
      isAnswer: true,
      citation: item.retriever_resources,
      message_files: getProcessedFilesFromResponse(answerFiles.map((item: any) => ({ ...item, related_id: item.id }))),
      parentMessageId: `question-${item.id}`
    } as unknown as Chat.ChatItem);
  });
  return newChatList;
}

export const getProcessedFiles = (files: any[]) => {
  return files.filter(file => file.progress !== -1).map(fileItem => ({
    type: fileItem.supportFileType,
    transfer_method: fileItem.transferMethod,
    url: fileItem.url || '',
    upload_file_id: fileItem.uploadedId || ''
  }));
};

export interface InputForm {
  type: InputVarType
  label: string
  variable: any
  required: boolean
  [key: string]: any
}

export const processOpeningStatement = (openingStatement: string, inputs: Record<string, any>, inputsForm: InputForm[]) => {
  if(!openingStatement) return openingStatement;

  return openingStatement.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const name = inputs[key];
    if(name) { // has set value
      return name;
    }

    const valueObj = inputsForm.find(v => v.variable === key);
    return valueObj ? `{{${valueObj.label}}}` : match;
  });
};

export const getProcessedInputs = (inputs: Record<string, any>, inputsForm: InputForm[]) => {
  const processedInputs = { ...inputs };

  inputsForm.forEach((item) => {
    if(item.type === InputVarType.multiFiles && inputs[item.variable]) processedInputs[item.variable] = getProcessedFiles(inputs[item.variable]);

    if(item.type === InputVarType.singleFile && inputs[item.variable]) processedInputs[item.variable] = getProcessedFiles([inputs[item.variable]])[0];
  });

  return processedInputs;
};

export {
  getProcessedInputsFromUrlParams,
  isValidGeneratedAnswer,
  getLastAnswer,
  buildChatItemTree,
  getThreadMessages
};
