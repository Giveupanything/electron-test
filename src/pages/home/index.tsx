/*
 * @Author: qilin
 * @Date: 2025-04-09 14:11:05
 * @LastEditors: qilin
 * @LastEditTime: 2025-04-09 17:39:27
 * @description: 乘风破浪
 */

import {  useLocation, useNavigate } from 'react-router-dom';
import { padQuery } from 'turboutils';
import { DatabaseOutlined, MessageOutlined } from '@ant-design/icons';
export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const handleGoKnowledgeSearch = () => {
    // 去知识库搜索页面
    navigate('/apps');
  };
  
  const handleGoIntelligentQA = () => {
    // 去智能问答页面
    console.log('handleGoIntelligentQA');
    navigate('/apps');
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-gray-100">
      {/* 知识库查询 */}
      <div
        onClick={handleGoKnowledgeSearch}
        className="w-[40vw] p-6 mb-6 bg-[#215646] text-white rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex justify-center items-center mr-4">
            <DatabaseOutlined style={{ fontSize: '24px', color: '#000' }} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">知识库查询</h2>
            <div className="text-xs">搜索和查看知识库中的文件</div>
          </div>
        </div>
        <p className="text-sm">
          通过文件名搜索知识库中的文件，查看文件内容和详细信息。
        </p>
      </div>

      {/* 智能问答 */}
      <div
        onClick={handleGoIntelligentQA}
        className="w-[40vw] p-6 bg-[#215646] text-white rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex justify-center items-center mr-4">
            <MessageOutlined style={{ fontSize: '24px', color: '#000' }} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">智能问答</h2>
            <div className="text-xs">与智能助手进行对话</div>
          </div>
        </div>
        <p className="text-sm">
          选择不同类别的对话，获取制度规范、操作指导和常见问题的解答。
        </p>
      </div>
    </div>
  );
}
