/*
 * @Author: dushuai
 * @Date: 2025-03-19 16:49:36
 * @LastEditors: dushuai
 * @LastEditTime: 2025-03-19 17:19:32
 * @description: 心平气和
 */
import React, { FC } from 'react';
import { Markdown } from '@/components/base/markdown';
import { IChatItem } from '@/axios/type';
import { FileList } from '../file-list';

import s from '../answer/style.module.css';
import { FileEntity } from '../../types';

type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
  apiKey: string
  messageFiles?: FileEntity[]
}

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar, messageFiles, apiKey }) => {
  const userName = '';
  return (
    <div className="flex items-start justify-end mb-[24px]" key={id}>
      <div>
        <div className={`${s.question} relative text-sm text-gray-900`}>
          <div
            className={'mr-2 py-3 px-4 bg-[#dfecfc] rounded-tl-2xl rounded-b-2xl'}
          >
            {
              !!messageFiles?.length && (
                <FileList
                  apiKey={apiKey}
                  files={messageFiles}
                  showDeleteAction={false}
                  showDownloadAction={true}
                />
              )
            }
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
