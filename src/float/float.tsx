/*
 * @Author: qilin
 * @Date: 2025-04-08 14:51:19
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 09:49:38
 * @description: 乘风破浪
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
// import '../index.css'

export const FloatApp = () => {
  const handleClickFloatIcon = () => {
    console.log('点击了浮动图标');
    // 添加打开浮动窗口的逻辑
  };

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/float"
          element={
            <div
              // className="w-12 h-12 bg-red-400 rounded-full cursor-pointer"
              style={
                {
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#FF0000',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  ['WebkitAppRegion']: 'drag', // 添加拖动区域
                } as React.CSSProperties
              }
              onClick={handleClickFloatIcon}
            ></div>
          }
        />
      </Routes>
    </HashRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FloatApp />
  </React.StrictMode>
);
