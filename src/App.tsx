/*
 * @Author: qilin
 * @Date: 2025-04-07 14:11:43
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 15:03:42
 * @description: 乘风破浪
 */
import { RouterProvider } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';

import r, { generateRouter } from './router';
import { useSelector } from '@turbotools/react';
import { usePermission } from './store/modules/permission';
import Loading from './components/UI/loading';

export default function App() {

  const [router, setRouter] = useState(r);
  const { GenerateRoutes } = usePermission(useSelector(['GenerateRoutes']));

  useEffect(() => {
    GenerateRoutes().then(r => {
      setRouter(generateRouter(r));
    });
  }, []);

  return (
    <Suspense fallback={<Loading type="app" />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}