/*
 * @Author: dushuai
 * @Date: 2024-04-07 10:25:43
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 17:54:56
 * @description: BasicsLayout
 */
import { Outlet } from "react-router-dom";

import Menu from "@/components/menu";
import MenuPC from "@/components/menu-pc";
import { APP_BULID_TYPE } from "@/config";
import { AppsContextProvider } from "@/context/apps-context";

export default function AppsLayout() {
  return (
    <AppsContextProvider>
      <main className="flex w-screen h-screen">
        {APP_BULID_TYPE === "desktop" ? <Menu /> : <MenuPC />}
        <div className="flex-1 relative">
          <Outlet />
        </div>
      </main>
    </AppsContextProvider>
  );
}
