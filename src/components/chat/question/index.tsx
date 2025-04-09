/*
 * @Author: dushuai
 * @Date: 2025-03-19 16:49:36
 * @LastEditors: qilin
 * @LastEditTime: 2025-03-31 17:53:43
 * @description: 心平气和
 */
import React, { FC, useState, useRef } from 'react';
import { Markdown } from '@/components/base/markdown';
import { IChatItem } from '@/axios/type';

import Tooltip from '@/components/base/tooltip';
import { randomString } from '@/utils';
import { debounce } from 'lodash-es';
import copy from 'copy-to-clipboard';

import s from '../answer/style.module.css';
import ImageGallery from '@/components/base/image-gallery';
type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
  imgSrcs?: string[]
}

const OperationBtn = ({ innerContent, onClick, className }: { innerContent: React.ReactNode; onClick?: () => void; className?: string }) => (
  <div
    className={`relative box-border flex items-center justify-center h-7 w-7 p-0.5 rounded-lg bg-white cursor-pointer text-gray-500 hover:text-gray-800 ${className ?? ''}`}
    style={{ boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)' }}
    onClick={onClick && onClick}
  >
    {innerContent}
  </div>
);

const IconWrapper: FC<{ children: React.ReactNode | string }> = ({ children }) => {
  return <div className={'rounded-lg h-6 w-6 flex items-center justify-center hover:bg-gray-100'}>
    {children}
  </div>;
};

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar, imgSrcs }) => {
  const userName = '';

  const [isCopied, setIsCopied] = useState(false);
  const tooltipSelector = useRef(`user-feedback-${randomString(16)}`).current;

  const onCopy = debounce(() => {
    copy(content);
    setIsCopied(true);
  }, 100);

  const onMouseLeave = debounce(() => {
    setIsCopied(false);
  }, 100);

  const defaultOperation = () => {

    const userOperation = () => (
      <>
        <Tooltip selector={tooltipSelector} content={isCopied ? '已复制' : '复制'}>
          {OperationBtn({
            innerContent: <IconWrapper>
              <div onMouseLeave={onMouseLeave} className={`w-6 h-6 ${s.copyIcon} ${isCopied ? s.copied : ''}`} />
            </IconWrapper>, onClick: onCopy
          })}
        </Tooltip>
      </>
    );

    return <div className={`${s.itemOperation} flex gap-2`}>
      {userOperation()}
    </div>;
  };

  return (
    <div className={`${s.answerWrap} flex items-start justify-end mb-[24px]`} key={id}>
      <div className="relative">
        <div className="absolute z-10 top-[-14px] left-[-14px] flex flex-row justify-end gap-1">
          {defaultOperation()}
        </div>
        <div className={`${s.question} relative text-sm text-gray-900`}>
          <div
            className={'mr-2 py-3 px-4 bg-[#dfecfc] rounded-tl-2xl rounded-b-2xl'}
          >
            {imgSrcs && imgSrcs.length > 0 && (
              <ImageGallery srcs={imgSrcs} />
            )}
            <Markdown content={content} />
          </div>
        </div>
      </div>
      {useCurrentUserAvatar
        ? (
          <div className="w-10 h-10 shrink-0 leading-10 text-center mr-2 rounded-full bg-primary-600 text-white">
            {userName?.[0]?.toLocaleUpperCase()}
          </div>
        )
        : (
          <div className={`${s.questionIcon} w-10 h-10 shrink-0 `} />
        )}
    </div>
  );
};

export default React.memo(Question);
