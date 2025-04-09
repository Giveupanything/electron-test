import type { FC } from 'react';
import { ConversationItem } from '@/typings/app';
import Item from './item';

type ListProps = {
  list: ConversationItem[]
  onOperate?: (type: string, item: ConversationItem) => void
  onChangeConversation?: (conversationId: string) => void
  currentConversationId?: string
}
const List: FC<ListProps> = ({
  list,
  onOperate,
  onChangeConversation,
  currentConversationId
}) => {
  return (
    <div>
      {
        list.map(item => (
          <Item
            key={item.id}
            item={item}
            onOperate={onOperate}
            onChangeConversation={onChangeConversation}
            currentConversationId={currentConversationId}
          />
        ))
      }
    </div>
  );
};

export default List;
