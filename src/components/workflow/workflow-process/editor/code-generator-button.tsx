'use client';
import type { FC } from 'react';
import React, { useCallback } from 'react';
import { useBoolean } from 'ahooks';
import cn from 'classnames';
import { AppType, type CodeLanguage, CodeGenRes } from '@/types/app';
import { Generator } from '@/components/icon/communication';
import { ActionButton } from '@/components/base/action-button';
import { GetCodeGeneratorResModal } from './code-generator/get-code-generator-res';

type Props = {
  className?: string
  onGenerated?: (prompt: string) => void
  codeLanguages: CodeLanguage
}

const CodeGenerateBtn: FC<Props> = ({
  className,
  codeLanguages,
  onGenerated
}) => {
  const [showAutomatic, { setTrue: showAutomaticTrue, setFalse: showAutomaticFalse }] = useBoolean(false);
  const handleAutomaticRes = useCallback((res: CodeGenRes) => {
    onGenerated?.(res.code);
    showAutomaticFalse();
  }, [onGenerated, showAutomaticFalse]);
  return (
    <div className={cn(className)}>
      <ActionButton
        className="hover:bg-[#155EFF]/8"
        onClick={showAutomaticTrue}
      >
        <Generator className="w-4 h-4 text-primary-600" />
      </ActionButton>
      {showAutomatic && (
        <GetCodeGeneratorResModal
          mode={AppType.chat}
          isShow={showAutomatic}
          codeLanguages={codeLanguages}
          onClose={showAutomaticFalse}
          onFinished={handleAutomaticRes}
        />
      )}
    </div>
  );
};
export default React.memo(CodeGenerateBtn);
