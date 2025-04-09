import AppIcon from '@/components/base/app-icon';
import { useState } from 'react';
import Form from '../form/form';
import { Button } from 'antd';
import { useChatContext } from '@/context/chat-context';

export default function ConfigPanel() {

  const { appInfo, appMate, showConfigPanelBeforeChat, handleStartChat } = useChatContext();

  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex flex-col max-h-[80%] w-full max-w-[720px]">
      <div
        className={`
          grow rounded-xl overflow-y-auto bg-white
          ${showConfigPanelBeforeChat && 'border-[0.5px] border-gray-100 shadow-lg'}
          ${!showConfigPanelBeforeChat && collapsed && 'border border-indigo-100'}
          ${!showConfigPanelBeforeChat && !collapsed && 'border-[0.5px] border-gray-100 shadow-lg'}
        `}
      >
        <div
          className={`
            flex flex-wrap px-6 py-4 rounded-t-xl bg-[#f4f7fe]
          `}
        >
          {
            showConfigPanelBeforeChat && (
              <>
                <div className="flex items-center h-8 text-2xl font-semibold text-gray-800">
                  <AppIcon
                    icon={appMate?.tool_icons?.icon}
                    background="transparent"
                    imageUrl={appMate?.tool_icons?.icon_url}
                    size="small"
                    className="mr-2"
                  />
                  {appInfo?.name}
                </div>
                {
                  appInfo?.description && (
                    <div className="mt-2 w-full text-sm text-gray-500">
                      {appInfo?.description}
                    </div>
                  )
                }
              </>
            )
          }

          {
            !showConfigPanelBeforeChat && collapsed && (
              <>
                {/* <Star06 className='mr-1 mt-1 w-4 h-4 text-indigo-600' /> */}
                <div className="grow py-[3px] text-[13px] text-indigo-600 leading-[18px] font-medium">
                    开始前，您可以修改对话设置
                </div>
                <Button
                  color="primary"
                  variant="solid"
                  size="small"
                  className="shrink-0"
                  onClick={() => setCollapsed(false)}
                >
                  {/* <Edit02 className='mr-1 w-3 h-3' /> */}
                  编辑
                </Button>
              </>
            )
          }

          {
            !showConfigPanelBeforeChat && !collapsed && (
              <>
                {/* <Star06 className='mr-1 mt-1 w-4 h-4 text-indigo-600' /> */}
                <div className="grow py-[3px] text-[13px] text-indigo-600 leading-[18px] font-medium">
                对话设置
                </div>
              </>
            )
          }
        </div>

        {
          !collapsed && !showConfigPanelBeforeChat && (
            <div className="p-6 rounded-b-xl">
              <Form />
              <div className={`pl-[136px] flex items-center`}>
                <Button
                  color="primary"
                  variant="solid"
                  className="mr-2"
                  onClick={() => {
                    setCollapsed(true);
                    handleStartChat();
                  }}
                >
                  保存
                </Button>
                <Button
                  onClick={() => setCollapsed(true)}
                >
                  取消
                </Button>
              </div>
            </div>
          )
        }

        {
          showConfigPanelBeforeChat && (
            <div className="p-6 rounded-b-xl w-full">
              <Form />
              <Button
                color="primary"
                variant="solid"
                size="large"
                onClick={handleStartChat}
              >
                  开始对话
              </Button>
            </div>
          )
        }
      </div>
    </div>
    // </div>
  );
}
