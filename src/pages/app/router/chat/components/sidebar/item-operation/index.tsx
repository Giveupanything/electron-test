import cn from '@/utils/classnames';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import s from './style.module.css';

type Props = {
  isItemHovering: boolean;
  onRenameConversation?: () => void;
  onDelete: () => void
}

export default function ItemOperation({
  isItemHovering,
  onRenameConversation,
  onDelete
}: Props) {
  return (
    <Popover
      content={<div className="cursor-pointer">
        <div className="w-[100px] p-[6px] hover:bg-gray-200 mb-1 rounded-md" onClick={onRenameConversation}>
          <EditOutlined className="mr-1" />
          重命名
        </div>
        <div className="w-[100px] p-[6px] hover:bg-gray-200 rounded-md" onClick={onDelete}>
          <DeleteOutlined className="mr-1" />
          删除
        </div>
      </div>}
      trigger="click"
      placement="bottom"
    >
      {/* <Icon icon="weui:more-filled" className={cn('text-xl bg-[#eff4ff] p-[2px] rounded-md hidden', { 'block': isItemHovering })} /> */}
      <div className={cn(s.btn, 'h-6 w-6 rounded-md border-none py-1', isItemHovering && `${s.open} !bg-gray-100 !shadow-none`)} />
    </Popover>
  );
}
