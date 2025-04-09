import type { FC } from 'react';
import React, { useState } from 'react';
import Modal from '@/components/base/modal';
import { Button } from 'antd';

export type IRenameModalProps = {
  isShow: boolean
  saveLoading: boolean
  name: string
  onClose: () => void
  onSave: (name: string) => void
}

const RenameModal: FC<IRenameModalProps> = ({
  isShow,
  saveLoading,
  name,
  onClose,
  onSave
}) => {
  const [tempName, setTempName] = useState(name);

  return (
    <Modal
      title="重命名会话"
      isShow={isShow}
      onClose={onClose}
    >
      <div className={'mt-6 font-medium text-sm leading-[21px] text-gray-900'}>会话名称</div>
      <input
        className={'mt-2 w-full rounded-lg h-10 box-border px-3 text-sm leading-10 bg-gray-100'}
        maxLength={20}
        value={tempName}
        onChange={e => setTempName(e.target.value)}
        placeholder="请输入会话名称"
      />

      <div className="mt-10 flex justify-end">
        <Button className="mr-2 flex-shrink-0" onClick={onClose}>取消</Button>
        <Button color="primary" variant="solid" className="flex-shrink-0" onClick={() => onSave(tempName)} loading={saveLoading}>保存</Button>
      </div>
    </Modal>
  );
};
export default React.memo(RenameModal);
