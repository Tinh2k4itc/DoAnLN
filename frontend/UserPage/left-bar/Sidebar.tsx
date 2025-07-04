import React, { useState, useCallback, useRef, useEffect } from 'react';
import SidebarItem from './SidebarItem';

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

export interface SidebarProps {
  activeItemId?: string;
  onItemClick?: (id: string) => void;
}

import {
  CubeTransparentIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon, // My Courses
  DocumentTextIcon, // My Assignments
  ChartBarIcon, // My Grades
  UserCircleIcon, // Profile
  Cog6ToothIcon, // Settings
  BellIcon, // Notifications
  ArrowRightOnRectangleIcon, // Logout
  ClipboardDocumentListIcon, // Tests
} from './icons'; // Adjusted path

const mainNavItems: SidebarItemInfo[] = [
  { id: 'dashboard', label: 'Dashboard', icon: AcademicCapIcon },
  { id: 'courses', label: 'Khóa học', icon: AcademicCapIcon },
  { id: 'tests', label: 'Bài thi', icon: ClipboardDocumentListIcon },
  { id: 'my-assignments', label: 'Bài tập của tôi', icon: DocumentTextIcon },
  { id: 'my-grades', label: 'Điểm số của tôi', icon: ChartBarIcon },
];

const accountNavItems: SidebarItemInfo[] = [
  { id: 'profile', label: 'Hồ sơ', icon: UserCircleIcon },
  { id: 'settings', label: 'Cài đặt', icon: Cog6ToothIcon },
  { id: 'notifications', label: 'Thông báo', icon: BellIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItemId = 'dashboard', onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleItemClick = useCallback((id: string) => {
    if (onItemClick) {
      onItemClick(id);
    }
    console.log(`Student sidebar item clicked: ${id}`);
  }, [onItemClick]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  const [focusSearchOnExpand, setFocusSearchOnExpand] = useState(false);
  useEffect(() => {
    if (isExpanded && focusSearchOnExpand && searchInputRef.current) {
      searchInputRef.current.focus();
      setFocusSearchOnExpand(false);
    }
  }, [isExpanded, focusSearchOnExpand]);

  return (
    <aside className={`sidebar-transition bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl overflow-y-hidden ${isExpanded ? 'w-64 p-4' : 'w-20 md:w-24 p-3 items-center'}`}>
      {/* Header */}
      <div className={`flex items-center w-full mb-5 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        <div
          className={`flex items-center ${!isExpanded ? 'cursor-pointer relative group' : ''}`}
          onClick={!isExpanded ? toggleExpand : undefined}
          role={!isExpanded ? "button" : undefined}
          aria-label={!isExpanded ? "Expand Sidebar" : "Student Portal Logo"}
          tabIndex={!isExpanded ? 0 : undefined}
          onKeyDown={!isExpanded ? (e) => (e.key === 'Enter' || e.key === ' ') && toggleExpand() : undefined}
        >
          <CubeTransparentIcon className={`text-sky-400 flex-shrink-0 ${isExpanded ? 'w-7 h-7' : 'w-7 h-7 md:w-8 md:h-8'}`} />
          {isExpanded && <span className="ml-3 text-xl font-bold text-slate-100">Student Portal</span>}
          {!isExpanded && (
            <>
              <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 absolute right-[-10px] md:right-[-12px] top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-sky-400 transition-colors duration-150" />
              <div
                className="absolute left-full ml-4 px-3 py-2 text-sm font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none transform translate-x-[-8px] group-hover:translate-x-0 z-50"
                role="tooltip"
              >
                Expand
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800/95 transform rotate-45"></div>
              </div>
            </>
          )}
        </div>

        {isExpanded && (
          <button
            onClick={toggleExpand}
            aria-label="Collapse Sidebar"
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-700/70 hover:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-500"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Area */}
      {isExpanded ? (
        <div className="relative mb-5">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Tìm kiếm..."
            aria-label="Search"
            className="w-full bg-slate-800 border border-slate-700/60 text-slate-200 placeholder-slate-500 rounded-lg py-2 pl-10 pr-3 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none text-sm"
          />
        </div>
      ) : (
        <div className="mb-4 md:mb-5 w-full flex justify-center relative group">
          <button
            onClick={() => { 
              setIsExpanded(true);
              setFocusSearchOnExpand(true);
            }}
            aria-label="Open search"
            className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-700 hover:text-sky-400 focus-visible:bg-slate-700 focus-visible:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-opacity-75"
          >
            <MagnifyingGlassIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
           <div className="absolute left-full ml-3 px-3 py-2 text-sm font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none transform translate-x-[-8px] group-hover:translate-x-0 z-50" role="tooltip">
            Tìm kiếm
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800/95 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Main Navigation Items */}
      <nav className={`flex-grow space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 ${isExpanded ? 'pr-0 -mr-0.5' : 'pr-1 -mr-1'}`}>
        {isExpanded && <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</h3>}
        {mainNavItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            isExpanded={isExpanded}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
      </nav>

      {/* Account Navigation Items & Profile */}
      <div className={`mt-auto pt-3 border-t w-full ${isExpanded ? 'border-slate-700/60' : 'border-slate-700 flex flex-col items-center'}`}>
        {isExpanded && <h3 className="px-3 pt-1 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản</h3>}
        {accountNavItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            isExpanded={isExpanded}
            onClick={() => handleItemClick(item.id)}
          />
        ))}
        
        {/* User Info / Logout Button */}
        <div className={`w-full ${isExpanded ? 'mt-2' : 'mt-1 md:mt-2'}`}>
          {isExpanded ? (
            <button 
              className="flex items-center w-full p-2.5 rounded-lg hover:bg-slate-700/60 focus-visible:bg-slate-700/60 focus:outline-none group text-left"
              aria-label="User profile and logout"
              onClick={() => console.log('Logout or profile action')}
            >
              <img
                src="https://picsum.photos/seed/student99/40/40" // Different seed for student
                alt="Student profile picture" 
                className="w-8 h-8 rounded-full border-2 border-slate-600 group-hover:border-sky-500 transition-colors flex-shrink-0"
              />
              <div className="ml-2.5 flex-grow overflow-hidden">
                <p className="text-sm font-semibold text-slate-100 truncate">Học sinh</p>
                <p className="text-xs text-slate-400 truncate">student@example.com</p>
              </div>
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors ml-2 flex-shrink-0" />
            </button>
          ) : (
            <div className="relative group flex justify-center">
              <button 
                aria-label="User Profile"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-full p-0.5"
                onClick={() => console.log('Profile action collapsed')}
              >
                <img
                  src="https://picsum.photos/seed/student99/40/40"
                  alt="Student User Profile"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-slate-600 group-hover:border-sky-500 transition-colors"
                />
              </button>
              <div className="absolute left-full ml-3 px-3 py-2 text-sm font-medium text-white bg-slate-800/95 backdrop-blur-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none transform translate-x-[-8px] group-hover:translate-x-0 z-50" role="tooltip">
                Học sinh
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800/95 transform rotate-45"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;