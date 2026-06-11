import { Search, Bell, User, ChevronDown, Menu, Home, UserCircle, Lightbulb, Crown, ShoppingCart, FileText, Wallet, Award, Clock, LogOut, ChevronRight, Video, Package } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-[60px] bg-white border-b border-[#eeeeee] flex items-center px-6 gap-6 flex-shrink-0">
      {/* 中间搜索区域 */}
      <div className="flex-1 flex items-center justify-center gap-3">
        {/* 搜索框 */}
        <div className="relative w-full max-w-[500px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
          <input
            type="text"
            placeholder="c语言文本与实训代码"
            className="w-full h-10 pl-10 pr-4 bg-[#f5f5f5] rounded-full text-sm text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#5260f0]/20"
          />
        </div>

        {/* 搜索按钮 */}
        <button className="px-5 py-2 bg-[#5260f0] text-white rounded-full hover:bg-[#4150de] transition-colors flex items-center gap-1 flex-shrink-0">
          <Search className="w-4 h-4" />
          <span className="text-sm">搜索</span>
        </button>

        {/* AI 提问按钮 */}
        <button className="px-5 py-2 bg-[#5260f0] text-white rounded-full hover:bg-[#4150de] transition-colors flex items-center gap-1 flex-shrink-0">
          <span className="text-sm">AI 提问</span>
        </button>
      </div>

      {/* 右侧按钮组 */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* 用户头像 */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-9 h-9 rounded-full bg-[#f0f0f0] overflow-hidden hover:ring-2 hover:ring-[#5260f0]/30 transition-all"
          >
            <div className="w-full h-full flex items-center justify-center text-[#666666]">
              <User className="w-5 h-5" />
            </div>
          </button>

          {/* 用户下拉菜单 */}
          {showUserMenu && (
            <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-[#eeeeee] overflow-hidden z-50">
              {/* 用户信息头部 */}
              <div className="p-4 border-b border-[#eeeeee]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                    <User className="w-6 h-6 text-[#666666]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#333333]">Jason Lau24</div>
                    <div className="text-xs text-[#999999]">LV.5</div>
                  </div>
                  <button className="text-xs text-[#5260f0] hover:underline">会员中心</button>
                </div>
                
                {/* VIP 信息 */}
                <div className="flex items-center gap-2 bg-[#eef0ff] px-3 py-2 rounded">
                  <Crown className="w-4 h-4 text-[#5260f0]" />
                  <span className="text-xs text-[#333333]">VIP赠100天下载</span>
                  <button className="ml-auto px-3 py-1 bg-[#5260f0] text-white text-xs rounded-full">领取礼</button>
                </div>

                {/* 统计数据 */}
                <div className="flex items-center justify-around mt-3 pt-3 border-t border-[#eeeeee]">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[#333333]">--</div>
                    <div className="text-xs text-[#999999]">粉丝</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[#333333]">48</div>
                    <div className="text-xs text-[#999999]">关注</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-[#333333]">--</div>
                    <div className="text-xs text-[#999999]">获赞</div>
                  </div>
                </div>
              </div>

              {/* 菜单项列表 */}
              <div className="py-2">
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Home className="w-4 h-4" />
                  <span className="text-sm">我的主页</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <UserCircle className="w-4 h-4" />
                  <span className="text-sm">个人中心</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Video className="w-4 h-4" />
                  <span className="text-sm">我的会议</span>
                </button>
                <button 
                  onClick={() => {
                    onNavigate?.('myOrders');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]"
                >
                  <Package className="w-4 h-4" />
                  <span className="text-sm">我的订单</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm">内容管理</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm">会员中心</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm">已购内容</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">我的订单</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">我的钱包</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">我的等级</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">浏览历史</span>
                </button>
                <button className="w-full px-4 py-2.5 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">退出</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 会员中心 */}
        <button className="px-3 py-2 text-[#333333] hover:text-[#5260f0] transition-colors">
          <span className="text-sm">会员中心</span>
        </button>

        {/* 消息 */}
        <button className="px-3 py-2 text-[#333333] hover:text-[#5260f0] transition-colors relative">
          <span className="text-sm">消息</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#5260f0] rounded-full"></span>
        </button>

        {/* 创作按钮（带下拉） */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-6 py-2 bg-[#5260f0] text-white rounded-full hover:bg-[#4150de] transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span className="text-sm">创作</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#eeeeee] overflow-hidden z-50">
              <button className="w-full px-4 py-3 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                <Menu className="w-4 h-4" />
                <span className="text-sm">写文章</span>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                <Menu className="w-4 h-4" />
                <span className="text-sm">发布视频</span>
              </button>
              <button className="w-full px-4 py-3 text-left hover:bg-[#f5f5f5] flex items-center gap-3 text-[#333333]">
                <Menu className="w-4 h-4" />
                <span className="text-sm">创建专栏</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}