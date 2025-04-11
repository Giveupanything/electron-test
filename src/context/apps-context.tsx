/*
 * @Author: dushuai
 * @Date: 2025-03-12 17:07:52
 * @LastEditors: dushuai
 * @LastEditTime: 2025-03-17 13:56:29
 * @description: AppContextProvider
 */
import { useSetState } from "ahooks";
import { createContext, useContext } from "use-context-selector";

type AppsContextValue = {
  chatIsResponding: boolean;
  changeChatResponding: (status: boolean) => void;
};

const AppsContext = createContext<AppsContextValue>({
  chatIsResponding: false,
  changeChatResponding: () => {},
});

export function AppsContextProvider({ children }: Common.Children) {
  const [state, setState] = useSetState({
    chatIsResponding: false,
  });
  const { chatIsResponding } = state;

  function changeChatResponding(status: boolean) {
    setState({ chatIsResponding: status });
  }

  return (
    <AppsContext.Provider
      value={{
        chatIsResponding,
        changeChatResponding,
      }}
    >
      {children}
    </AppsContext.Provider>
  );
}

export const useAppsContext = () => useContext(AppsContext);

export default AppsContext;
