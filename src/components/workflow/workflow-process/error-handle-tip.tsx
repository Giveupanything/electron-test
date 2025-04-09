import { useMemo } from 'react';
import { RiAlertFill } from '@remixicon/react';
import { ErrorHandleTypeEnum } from '@/types/app';

type ErrorHandleTipProps = {
  type?: ErrorHandleTypeEnum
}
const ErrorHandleTip = ({
  type
}: ErrorHandleTipProps) => {

  const text = useMemo(() => {
    if(type === ErrorHandleTypeEnum.failBranch) return '节点异常，将自动执行失败分支。节点输出将返回错误类型和错误信息，并传递给下游。';

    if(type === ErrorHandleTypeEnum.defaultValue) return '节点异常，根据默认值输出。';
  }, []);

  if(!type) return null;

  return (
    <div
      className="relative flex p-2 pr-[52px] rounded-lg border-[0.5px] border-components-panel-border bg-components-panel-bg-blur shadow-xs"
    >
      <div
        className="absolute inset-0 opacity-40 rounded-lg"
        style={{
          background: 'linear-gradient(92deg, rgba(247, 144, 9, 0.25) 0%, rgba(255, 255, 255, 0.00) 100%)'
        }}
      />
      <RiAlertFill className="shrink-0 mr-1 w-4 h-4 text-text-warning-secondary" />
      <div className="grow system-xs-medium text-text-primary">
        {text}
      </div>
    </div>
  );
};

export default ErrorHandleTip;
