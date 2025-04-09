/*
 * @Author: dushuai
 * @Date: 2024-04-07 10:25:43
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 17:44:57
 * @description: BasicsLayout
 */
import { Outlet } from 'react-router-dom';
import { AppContextProvider } from '@/context/app-context';
import { EventEmitterContextProvider } from '@/context/event-emitter';
import { ModalContextProvider } from '@/context/modal-context';

export default function BasicsLayout() {

  return (
    <EventEmitterContextProvider>
      <AppContextProvider>
        <ModalContextProvider>
          <Outlet />
        </ModalContextProvider>
      </AppContextProvider>
    </EventEmitterContextProvider>
  );
}
