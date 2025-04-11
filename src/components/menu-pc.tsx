/*
 * @Author: ming
 * @Date: 2025-03-14 17:47:52
 * @LastEditors: ming
 * @LastEditTime: 2025-03-17 16:29:09
 * @description: menus
 */
import { useLocation, useNavigate } from "react-router-dom";
import classnames from "classnames";
import { padQuery } from "turboutils";

import chatgptIcon from "../assets/icons/chatgpt.svg";
import copyIcon from "../assets/icons/copy.svg";
import MessageDotsCircle from "./base/icon/MessageDotsCircle";
import { message } from "antd";
import { useAppsContext } from "@/context/apps-context";

export const menuPCList = [
  {
    title: "首页",
    icon: chatgptIcon,
    activeIcon: copyIcon,
    path: "/app",
    apiKey: "",
  },
  {
    title: "聊天助手",
    icon: chatgptIcon,
    activeIcon: copyIcon,
    path: "/app/8386e20a-2ea0-4dba-b58a-3dbf5310e837/chat",
    apiKey: "app-vR7283ltO7gBdwdqv7JLekz6",
  },
  {
    title: "agent",
    icon: chatgptIcon,
    activeIcon: copyIcon,
    path: "/app/89981103-a033-4910-bc39-6b79ea0a05ec/agent",
    apiKey: "app-nLN6WvG2kVNJWvGnlgq7KDgL",
  },
  {
    title: "chat-flow",
    icon: chatgptIcon,
    activeIcon: copyIcon,
    path: "/app/d4668e85-784a-4828-aa5e-7e7619bc77bc/chat-flow",
    apiKey: "app-FgRhEC19HzZ2dOSd7SgsyEOB",
  },
  {
    title: "文本生成",
    icon: chatgptIcon,
    activeIcon: copyIcon,
    // path: '/app/77001c4d-edca-44d4-a250-41547c58f9fa/text',
    // apiKey: 'app-llEO2Pa2BTgnNfQDVHpRumPO'
    path: "/app/d6ac2011-138f-401d-ba17-5ebf1da9d1f3/text", // dify
    apiKey: "app-KodF6Ci3l0srpGIv5x5PGjSr",
  },
  {
    title: "工作流",
    icon: chatgptIcon,
    activeIcon: copyIcon,
    // path: '/app/f3cf0809-fbcf-424d-b8c5-c6dd0e8a2f30/workflow',
    // apiKey: 'app-FdKGvTsiVr8zOaLd7rn9NqMU'
    // apiKey: 'app-sCswcuvf3ufqUyVaN9n1WPfi'
    // apiKey: 'app-4X60RckhBm6agDyEKLcd0VOp'
    // apiKey: 'app-1xU6NJY2uGX5xx0tCvEHvE1v'
    path: "/app/3dedc72e-a6e3-4ef9-92c4-976b8a124c9d/workflow", // dify
    apiKey: "app-Lojxjd2NLFg2BbESIHO0cbwF",
  },
];

export default function MenuPC() {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const { chatIsResponding } = useAppsContext();

  const menuHandle = (item: (typeof menuPCList)[number]) => {
    if (chatIsResponding) {
      message.warning("正在回复中，请稍后再试");
      return;
    }
    navigate(padQuery(item.path, { APIKEY: item.apiKey }));
  };

  return (
    <nav className="flex flex-col justify-between items-center border-r border-r-[rgba(0,0,0,0.1)] w-[120px] pb-5 bg-[#fff] shrink-0 h-full">
      {/* <img className="cursor-pointer" src="/images/left_logo.svg" width={60} height={60} alt="" onClick={() => navigate('/')} /> */}
      <ul className="flex-auto w-full px-2.5 py-5 flex flex-col items-center">
        {menuPCList.map((item) => (
          <li
            key={item.title}
            className={classnames(
              "group flex items-center pl-2 hover:bg-[#edf2fe] rounded cursor-pointer mb-[12px] w-[100px] h-[32px] hover:text-[#285be3]",
              {
                "bg-[#edf2fe]": pathname === item.path,
                "text-[#285be3]": pathname === item.path,
              }
            )}
            onClick={() => menuHandle(item)}
          >
            {pathname === item.path ? (
              // <img
              //   src={item.activeIcon}
              //   width={26}
              //   height={26}
              //   alt=""
              //   className={classnames('group-hover:block', {
              //     hidden: pathname !== item.path
              //   })}
              // />
              <MessageDotsCircle
                className={`shrink-0 mr-1 w-[20px] h-[20px] text-gray-400 ${pathname === item.path && "!text-[#285be3]"}`}
              />
            ) : (
              // <img src={item.icon} width={26} height={26} alt="" className="group-hover:hidden" />
              <MessageDotsCircle
                className={`shrink-0 mr-1 w-[20px] h-[20px] text-gray-400 group-hover:hidden`}
              />
            )}
            {pathname !== item.path && (
              // <img src={item.activeIcon} width={26} height={26} alt="" className="hidden group-hover:block" />
              <MessageDotsCircle
                className={`shrink-0 mr-1 w-[20px] h-[20px] text-[#285be3] hidden group-hover:block`}
              />
            )}
            <p className="text-xs/[15px]">{item.title}</p>
          </li>
        ))}
      </ul>
      {/* <div>user</div> */}
    </nav>
  );
}
