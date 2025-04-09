
import { useContextSelector } from 'use-context-selector';
export function useSelector<T>(selector: (value: AppContextValue) => T): T {
  return useContextSelector(AppContext, selector);
}