/*
 * @Author: ming
 * @Date: 2025-03-14 17:47:52
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 19:07:08
 * @description: menus
 */
import { useLocation, useNavigate } from "react-router-dom";
import classnames from "classnames";
import { padQuery } from "turboutils";
import { message } from "antd";

import { useAppsContext } from "@/context/apps-context";
// import MessageDotsCircle from './base/icon/MessageDotsCircle';
import { RiMessage3Line, RiDatabase2Line } from "@remixicon/react";

import s from "./index.module.css";

export const menuList = [
  // dify
  // {
  //   title: '资金答疑',
  //   icon: <RiMessage3Line className="w-[18px] h-[18px] mr-1" />,
  //   path: '/apps/48230dab-e558-4a8d-ae54-6af5e8a2e499/chat',
  //   apiKey: 'app-pXxFEhzpJkSExyy1Z1ikPErv'
  // }

  // 188
  // {
  //   title: '资金答疑',
  //   icon: <RiMessage3Line className="w-[18px] h-[18px] mr-1" />,
  //   path: '/apps/1eba75ef-552a-4fb8-94ab-d08a4824370e/chat',
  //   apiKey: 'app-y5NGa9QclpKG9oezSa6ly9Ww'
  // },
  // {
  //   title: '制度规范',
  //   icon: <RiRobot3Line className="w-[18px] h-[18px] mr-1" />,
  //   path: '/apps/5cd3c9fc-2bea-4044-b2fe-457457413393/chat',
  //   apiKey: 'app-D6KsJIlbj5CynPDABCItEnWG'
  // }

  {
    title: "智能问答",
    icon: <RiMessage3Line className="w-[18px] h-[18px] mr-1" />,
    path: "/apps/1eba75ef-552a-4fb8-94ab-d08a4824370e/chat",
    apiKey: "app-111",
  },
  {
    title: "知识库查询",
    icon: <RiDatabase2Line className="w-[18px] h-[18px] mr-1" />,
    path: "/apps/1eba75ef-552a-4fb8-94ab-d08a4824370e/search",
    apiKey: "app-222",
  },

  // 生产
  // {
  //   title: '资金答疑',
  //   icon: <RiMessage3Line className="w-[18px] h-[18px] mr-1" />,
  //   path: '/apps/799cb146-6766-4779-afcf-6d25e8490371/chat',
  //   apiKey: 'app-aGkNJLdhAXMy5eO2Aa9WjlO2'
  // },
  // {
  //   title: '制度规范',
  //   icon: <RiRobot3Line className="w-[18px] h-[18px] mr-1" />,
  //   path: '/apps/acbf6c91-487e-49ea-9446-aced65c30e00/chat',
  //   apiKey: 'app-VEJBcZMwO3HACMOPYt3XdGSJ'
  // }
];

export default function Menu() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const { chatIsResponding } = useAppsContext();

  const menuHandle = (item: (typeof menuList)[number]) => {
    console.log("item", item);
    if (chatIsResponding && item.title === "智能问答") {
      message.warning("正在回复中，请稍后再试");
      return;
    }
    navigate(padQuery(item.path, { APIKEY: item.apiKey }));
  };

  return (
    <nav className="flex flex-col justify-between items-center border-r border-r-[rgba(0,0,0,0.1)] w-[120px] pb-2 bg-[#fff] shrink-0 h-full">
      <ul className="flex-auto w-full px-2.5 py-5 flex flex-col items-center">
        {menuList.map((item) => (
          <li
            key={item.title}
            className={classnames(
              "group flex items-center pl-2 hover:bg-[#edf2fe] rounded cursor-pointer mb-[12px] w-[100px] h-[32px] hover:text-[#285be3]",
              { "bg-[#edf2fe] text-[#285be3]": pathname === item.path }
            )}
            onClick={() => menuHandle(item)}
          >
            {item.icon}
            {/* {pathname === item.path ? (
              <MessageDotsCircle className={`shrink-0 mr-1 w-[20px] h-[20px] text-gray-400 ${pathname === item.path && '!text-[#285be3]'}`} />
            ) : (
              <MessageDotsCircle className={`shrink-0 mr-1 w-[20px] h-[20px] text-gray-400 group-hover:hidden`} />
            )}
            {pathname !== item.path &&
              <MessageDotsCircle className={`shrink-0 mr-1 w-[20px] h-[20px] text-[#285be3] hidden group-hover:block`} />
            } */}
            <p className="text-xs/[15px]">{item.title}</p>
          </li>
        ))}
      </ul>
      <div className="text-center text-xs font-normal text-gray-600 select-none flex flex-col items-center">
        <div className={s.logo} />
        Version 1.0.0
      </div>
    </nav>
  );
}
