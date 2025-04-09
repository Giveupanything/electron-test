/*
 * @Author: dushuai
 * @Date: 2025-03-12 17:07:52
 * @LastEditors: dushuai
 * @LastEditTime: 2025-03-17 13:56:29
 * @description: AppContextProvider
 */
import { menuList } from '@/components/menu';
import { menuPCList } from '@/components/menu-pc';
import { APP_BULID_TYPE } from '@/config';
import { useSetState } from 'ahooks';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { padQuery } from 'turboutils';
import { createContext, useContext } from 'use-context-selector';

type AppsContextValue = {
  chatIsResponding: boolean
  changeChatResponding: (status: boolean) => void
}

const AppsContext = createContext<AppsContextValue>({
  chatIsResponding: false,
  changeChatResponding: () => {}
});

export function AppsContextProvider({ children }: Common.Children) {

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const [state, setState] = useSetState({
    chatIsResponding: false
  });
  const { chatIsResponding } = state;

  useEffect(() => {
    console.log('AppsContextProvider pathname:>> ', pathname, APP_BULID_TYPE);

    if(['/apps'].includes(pathname)) {
      const firstMenu = APP_BULID_TYPE === 'desktop' ? menuList[0] : menuPCList[0];

      navigate(padQuery(firstMenu.path, { APIKEY: firstMenu.apiKey }));
    }
  }, [pathname, menuList, menuPCList]);

  function changeChatResponding(status: boolean) {
    setState({ chatIsResponding: status });
  }

  return (
    <AppsContext.Provider
      value={{
        chatIsResponding,
        changeChatResponding
      }}
    >
      {children}
    </AppsContext.Provider>
  );
}

export const useAppsContext = () => useContext(AppsContext);

export default AppsContext;
