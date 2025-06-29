import React, { useState, useCallback, useRef, useEffect } from 'react';
import SidebarItem from './SidebarItem';
import {
  CubeTransparentIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  UsersIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  // UserCircleIcon,
} from './icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../shared/firebase-config';

export interface IconProps {
  className?: string;
  strokeWidth?: string | number;
  fill?: string;
}

export interface SidebarItemInfo {
  id: string;
  label: string;
  icon: React.ElementType<IconProps>;
  action?: () => void;
}

interface SidebarProps {
  activeItemId: string;
  onItemClick: (id: string) => void;
  menuItems?: { id: string; label: string; icon?: React.ElementType<IconProps> }[];
}

const defaultMenu: SidebarItemInfo[] = [
  { id: 'dashboard', label: 'Dashboard tổng quan', icon: Squares2X2Icon },
  { id: 'manage-courses', label: 'Quản lý khóa học', icon: BookOpenIcon },
  { id: 'manage-parts', label: 'Quản lý phần học', icon: PuzzlePieceIcon },
  { id: 'manage-questions', label: 'Quản lý câu hỏi', icon: QuestionMarkCircleIcon },
  { id: 'manage-tests', label: 'Quản lý bài thi', icon: ClipboardDocumentListIcon },
  { id: 'manage-users', label: 'Quản lý người dùng', icon: UsersIcon },
  { id: 'test-results', label: 'Kết quả thi', icon: ClipboardDocumentListIcon },
  { id: 'report', label: 'Báo cáo & Thống kê', icon: Squares2X2Icon },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItemId, onItemClick, menuItems }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const menu: SidebarItemInfo[] = (menuItems && menuItems.length > 0)
    ? menuItems.map(item => ({ ...item, icon: item.icon || Squares2X2Icon }))
    : defaultMenu;

  const handleItemClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  // Dummy user info, bạn có thể lấy từ context hoặc props nếu có
  const user = {
    name: 'Admin',
    email: 'admin@example.com',
    avatar: 'https://i.pravatar.cc/40?img=1',
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const handleProfileClick = () => {
    onItemClick('profile');
  };

  return (
    <aside className={`sidebar-transition bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl overflow-y-hidden ${isExpanded ? 'w-64 p-4' : 'w-20 md:w-24 p-3 items-center'}`}>
      {/* Header: Logo, Title (if expanded), Toggle Button */}
      <div className={`flex items-center w-full mb-5 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        <div
          className={`flex items-center ${!isExpanded ? 'cursor-pointer relative group' : ''}`}
          onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
          role={!isExpanded ? "button" : undefined}
          aria-label={!isExpanded ? "Expand Sidebar" : "ADMIN Company Logo"}
          tabIndex={!isExpanded ? 0 : undefined}
          onKeyDown={!isExpanded ? (e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(true) : undefined}
        >
          <CubeTransparentIcon className={`text-sky-400 flex-shrink-0 ${isExpanded ? 'w-7 h-7' : 'w-7 h-7 md:w-8 md:h-8'}`} />
          {isExpanded && <span className="ml-3 text-xl font-bold text-slate-100">ADMIN MANAGER</span>}
          {!isExpanded && (
            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 absolute right-[-10px] md:right-[-12px] top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-sky-400 transition-colors duration-150" />
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            aria-label="Collapse Sidebar"
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700/70 hover:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      {/* Main Navigation Items */}
      <nav className={`flex-grow space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 ${isExpanded ? 'pr-0 -mr-0.5' : 'pr-1 -mr-1'}`}>
        {isExpanded && <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</h3>}
        {menu.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            isExpanded={isExpanded}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
      </nav>
      {/* User Info / Logout Button */}
      <div className={`mt-auto pt-3 border-t w-full ${isExpanded ? 'border-slate-700/60' : 'border-slate-700 flex flex-col items-center'}`}>
        <div 
          onClick={handleProfileClick}
          className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-800 rounded-md transition-colors"
        >
          <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-slate-600" />
          {isExpanded && (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-100 text-sm">{user.name}</span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 justify-center"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;