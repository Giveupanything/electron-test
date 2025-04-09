/*
 * @Author: dushuai
 * @Date: 2025-03-12 17:07:52
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 18:31:19
 * @description: AppContextProvider
 */
import { menuList } from '@/components/menu';
import { menuPCList } from '@/components/menu-pc';
import { APP_BULID_TYPE } from '@/config';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { padQuery } from 'turboutils';
import { createContext, useContext } from 'use-context-selector';

const AppContext = createContext({
});

export function AppContextProvider({ children }: Common.Children) {

  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  useEffect(() => {
    console.log('AppContextProvider pathname:>> ', pathname, APP_BULID_TYPE);

    if(['/', '/login'].includes(pathname)) {
      // const firstMenu = APP_BULID_TYPE === 'desktop' ? menuList[0] : menuPCList[0];

      // navigate(padQuery(firstMenu.path, { APIKEY: firstMenu.apiKey }));
      navigate('/home')
    }
  // }, [pathname, menuList, menuPCList]);
  }, [pathname]);

  return (
    <AppContext.Provider
      value={{}}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

export default AppContext;
