import {
  memo,
  useRef,
  FC
} from 'react';
import { useHover } from 'ahooks';
import { ConversationItem } from '@/typings/app';
import ItemOperation from './item-operation';

type ItemProps = {
  isPin?: boolean
  item: ConversationItem
  onOperate?: (type: string, item: ConversationItem) => void
  onChangeConversation?: (conversationId: string) => void
  currentConversationId?: string
}
const Item: FC<ItemProps> = ({
  item,
  onOperate,
  onChangeConversation,
  currentConversationId
}) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);

  return (
    <div
      ref={ref}
      key={item.id}
      className={`flex mb-0.5 last-of-type:mb-0 py-1.5 pl-3 pr-1.5 text-sm font-medium text-gray-700 rounded-lg cursor-pointer
        hover:bg-[#dfe5ed] group ${currentConversationId === item.id && '!text-[#155eef] !bg-[#eff4ff]'}
      `}
      onClick={() => onChangeConversation && onChangeConversation(item.id)}
    >
      <div className="grow py-0.5 break-all text-ellipsis whitespace-nowrap overflow-hidden" title={item.name}>{item.name}</div>
      {/* <Icon name="weui:more-filled" className={`shrink-0 mt-1 mr-2 w-4 h-4 text-gray-700 ${currentConversationId === item.id && 'text-[#155eef]'}`} /> */}
      {
        item.id !== '' &&
        <div className="shrink-0 h-6" onClick={e => e.stopPropagation()}>
          <ItemOperation
            isItemHovering={isHovering}
            // togglePin={() => onOperate && onOperate(isPin ? 'unpin' : 'pin', item)}
            onRenameConversation={() => onOperate && onOperate('rename', item)}
            onDelete={() => onOperate && onOperate('delete', item)}
          />
        </div>
      }
    </div>
  );
};

export default memo(Item);
