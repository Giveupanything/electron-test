/*
 * @Author: dushuai
 * @Date: 2024-04-07 10:25:43
 * @LastEditors: dushuai
 * @LastEditTime: 2024-08-19 21:47:32
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
