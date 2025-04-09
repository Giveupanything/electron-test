import { ConversationItem } from '@/typings/app';
import { EditOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import List from './list';
import { useSetState } from 'ahooks';
import Confirm from '@/components/base/confirm';
import { useCallback } from 'react';
import { delConversation, renameConversation } from '@/api/chat';
import RenameModal from './rename-modal';
import { useChatContext } from '@/context/chat-context';
import { DEFAULT_USER_ID } from '@/config';

type Props = {
    apiKey: string
}

export default function Sidebar({ apiKey }: Props) {

  const { currentConversationId, conversationList, handleChangeConversation, handleNewConversation, setConversationName, handleDelete: handleDeleteConversation } = useChatContext();

  const [state, setState] = useSetState({
    showConfirm: null as ConversationItem | null,
    showRename: null as ConversationItem | null,
    loading: false
  });
  const { showConfirm, showRename, loading } = state;

  const handleOperate = useCallback((type: string, item: ConversationItem) => {
    if(type === 'delete') setState({ showConfirm: item });
    if(type === 'rename') setState({ showRename: item });
  }, []);

  const handleDelete = useCallback(async () => {
    if(!showConfirm || loading) return;

    try {
      setState({ loading: true });
      await delConversation(showConfirm?.id || '', { apiKey, user: DEFAULT_USER_ID });
      handleDeleteConversation(showConfirm?.id || '');
      message.success('删除成功');
      setState({ showConfirm: null });
    } catch(error) {
      console.log('error:>> ', error);
      message.error('删除失败');
    } finally {
      setState({ loading: false });
    }

  }, [showConfirm, loading]);

  const handleRename = useCallback(async (name: string) => {
    if(!showRename || loading) return;
    if(!name) return message.error('请先输入名称');

    try {
      setState({ loading: true });
      await renameConversation(showRename?.id || '', { apiKey, name, user: DEFAULT_USER_ID });
      setConversationName(showRename?.id || '', name);
      message.success('操作成功');
      setState({ showRename: null });
    } catch(error) {
      console.log('error:>> ', error);
      message.error('操作失败');
    } finally {
      setState({ loading: false });
    }

  }, [showRename, loading]);

  return (
    <div className="w-1/6 max-w-[200px] bg-white border-r border-r-[rgba(0,0,0,0.1)] min-w-[135px]">
      {/* bg-[#f7f9fb] */}
      <div className="shrink-0 p-4">
        <Button
          className="w-full"
          icon={<EditOutlined />}
          onClick={handleNewConversation}
        >
            开启新对话
        </Button>
      </div>

      <div className="grow px-4 py-2 overflow-y-scroll pb-8 h-[calc(100%-64px)]">
        {
          !!conversationList.length &&
          (
            <List
              list={conversationList}
              onChangeConversation={handleChangeConversation}
              onOperate={handleOperate}
              currentConversationId={currentConversationId}
            />
          )
        }
      </div>

      {!!showConfirm && (
        <Confirm
          title="删除对话"
          content="您确定要删除此对话吗？"
          isShow
          onCancel={() => setState({ showConfirm: null })}
          onConfirm={handleDelete}
        />
      )}

      {showRename && (
        <RenameModal
          isShow
          onClose={() => setState({ showRename: null })}
          saveLoading={loading}
          name={showRename?.name || ''}
          onSave={handleRename}
        />
      )}
    </div>
  );
}

// const a = [
//   {
//     'id': '457461bf-b76e-433a-8301-8e9bb69878a4',
//     'name': '询问我的身份',
//     'inputs': {
//       'select': 'a',
//       'text': '22',
//       'textrea': '33',
//       'num': 3
//     },
//     'status': 'normal',
//     'introduction': '',
//     'created_at': 1742378310,
//     'updated_at': 1742379869
//   }
// ];
