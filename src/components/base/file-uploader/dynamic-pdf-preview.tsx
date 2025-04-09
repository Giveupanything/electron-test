'use client';

// import dynamic from 'next/dynamic';

// type DynamicPdfPreviewProps = {
//   url: string
//   onCancel: () => void
// }
// const DynamicPdfPreview = dynamic<DynamicPdfPreviewProps>(
//   (() => {
//     if(typeof window !== 'undefined') return import('./pdf-preview');
//   }) as any,
//   { ssr: false } // This will prevent the module from being loaded on the server-side
// );

// export default DynamicPdfPreview;

import React, { lazy, Suspense } from 'react';
import { Loading } from '@/components/icon/communication';

type DynamicPdfPreviewProps = {
  url: string;
  onCancel: () => void;
};

const PdfPreview = lazy(() => {
  if(typeof window !== 'undefined') {
    return import('./pdf-preview');
  }
  // 这里可以返回一个 Promise.reject 来避免服务端渲染出错
  return Promise.reject(new Error('Not available on the server'));
});

const DynamicPdfPreview: React.FC<DynamicPdfPreviewProps> = (props) => {
  return (
    <Suspense fallback={<Loading />}>
      <PdfPreview {...props} />
    </Suspense>
  );
};

export default DynamicPdfPreview;
