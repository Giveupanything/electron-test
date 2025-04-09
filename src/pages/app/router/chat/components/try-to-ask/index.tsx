import type { FC } from 'react';
import { memo } from 'react';
import { Star04 } from '@/components/base/icon/shapes';

type TryToAskProps = {
  suggestedQuestions: string[]
  onSend: (msg: string) => void
}
const TryToAsk: FC<TryToAskProps> = ({
  suggestedQuestions,
  onSend
}) => {

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2.5 py-2">
        <div
          className="grow h-[1px] rotate-180"
          style={{
            backgroundImage: 'linear-gradient(to right,#10182814, #ffffff00)'
          }}
        />
        <div className="shrink-0 flex items-center px-3 text-gray-500">
          <Star04 className="mr-1 w-2.5 h-2.5" />
          <span className="text-xs text-gray-500 font-medium">试着问问</span>
        </div>
        <div
          className="grow h-[1px]"
          style={{
            backgroundImage: 'linear-gradient(to right,#10182814, #ffffff00)'
          }}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-[6px]">
        {
          suggestedQuestions.map((suggestQuestion, index) => (
            <div
              key={index}
              className="py-[4px] px-[8px] rounded-md bg-white text-xs border border-[#10182824] text-[#155aef] font-medium cursor-pointer hover:bg-[#f9fafb]"
              style={{
                boxShadow: '0 0 #0000, 0 0 #0000, 0px 1px 2px 0px rgba(16,24,40,0.05)'
              }}
              onClick={() => onSend(suggestQuestion)}
            >
              {suggestQuestion}
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default memo(TryToAsk);
