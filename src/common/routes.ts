/*
 * @Author: dushuai
 * @Date: 2024-04-11 11:10:56
 * @LastEditors: dushuais 1137896420@qq.com
 * @LastEditTime: 2024-08-08 21:29:04
 * @description: 动态路由相关
 */

import { APP_BULID_TYPE } from "@/config";

/**
 * 动态配置路由 ------ 这里是前端自己的动态路由
 *
 * @id 路由id 必填 且唯一
 * @index 是否是首页 index为true时不能配置children
 * @path 路由路径 index为true时可以不填
 * @component 路由组件 值为pages目录下文件夹名称
 *      嵌套路由时，目录结构应为pages\*\router\xx\index.tsx
 *      因为减少性能开销 页面规则只支持两种：pages\xx and pages\*\router\xx
 * @parent 父级路由path 默认为/
 * @handle 路由配置项 自定义
 * @protected 当前路由是否需要权限 默认true
 * @children 子路由
 *
 */

/** 桌面端路由 */
export const desktopRoutes: Route.Route[] = [
  // {
  //   id: 'Apps',
  //   index: true,
  //   component: 'apps',
  //   parent: '/apps',
  //   handle: {
  //     title: '首页'
  //   },
  //   protected: false
  // },
  {
    id: "Chat",
    path: "/:appId/chat",
    parent: "/apps",
    component: "apps/router/chat",
    handle: {
      title: "聊天助手",
    },
    protected: false,
  },
  {
    id: "Search",
    path: "/:appId/search",
    parent: "/apps",
    component: "apps/router/search",
    handle: {
      title: "知识库查询",
    },
    protected: false,
  },
];

/** pc端路由 */
export const pcRoutes: Route.Route[] = [
  {
    id: "App",
    index: true,
    parent: "/app",
    component: "app",
    handle: {
      title: "首页",
    },
    protected: false,
  },
  {
    id: "Chat",
    path: "/:appId/chat",
    parent: "/app",
    component: "app/router/chat",
    handle: {
      title: "聊天助手",
    },
    protected: false,
  },
  {
    id: "Agent",
    path: "/:appId/agent",
    parent: "/app",
    component: "app/router/agent",
    handle: {
      title: "Agent",
    },
    protected: false,
  },
  {
    id: "ChatFlow",
    path: "/:appId/chat-flow",
    parent: "/app",
    component: "app/router/chat-flow",
    handle: {
      title: "chat-flow",
    },
    protected: false,
  },
  {
    id: "Text",
    path: "/:appId/text",
    component: "app/router/text",
    parent: "/app",
    handle: {
      title: "文本生成",
    },
    protected: false,
  },
  {
    id: "Workflow",
    path: "/:appId/workflow",
    component: "app/router/workflow",
    parent: "/app",
    handle: {
      title: "工作流",
    },
    protected: false,
  },
];

export const dynamicRoutes: Route.Route[] = [
  // {
  //   id: 'Home',
  //   index: true,
  //   component: 'home',
  //   handle: {
  //     title: '首页',
  //     roles: ['admin', 'other']
  //   }
  // },
];

if (APP_BULID_TYPE === "desktop") {
  dynamicRoutes.push(...desktopRoutes);
} else {
  dynamicRoutes.push(...pcRoutes);
}
