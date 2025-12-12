import React from 'react';
import {
    LayoutDashboard,
    Inbox,
    Users,
    Layers,
    FileText,
    Radio,
    GitBranch,
    Bot,
    Activity,
    Settings,
    HelpCircle
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard' },
        { icon: Inbox, label: 'Inbox', active: true },
        { icon: Users, label: 'Contacts' },
        { icon: Layers, label: 'Team Queues' },
        { icon: FileText, label: 'Templates' },
        { icon: Radio, label: 'Broadcast' },
        { icon: GitBranch, label: 'Flows' },
        { icon: Bot, label: 'AI Assistant' },
        { icon: Activity, label: 'Activity Log' },
        { icon: Settings, label: 'Settings' },
        { icon: HelpCircle, label: 'Get Help' },
    ];

    return (
        <div className="w-[60px] md:w-[240px] h-screen bg-[#0f172a] border-r border-slate-800 flex flex-col flex-shrink-0 transition-all duration-300">
            <div className="p-4 flex items-center justify-center md:justify-start border-b border-slate-800 h-16">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    P
                </div>
                <span className="ml-3 font-semibold text-white hidden md:block">Pabbly</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`w-full flex items-center px-3 py-2.5 mx-2 rounded-lg transition-colors group relative md:static ${item.active
                                ? 'bg-green-600/10 text-green-500'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            } max-w-[calc(100%-16px)]`}
                    >
                        <item.icon size={20} className="min-w-[20px]" />
                        <span className="ml-3 text-sm font-medium hidden md:block truncate">
                            {item.label}
                        </span>

                        {/* Tooltip for mobile/collapsed state */}
                        <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 md:hidden pointer-events-none z-50 whitespace-nowrap">
                            {item.label}
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                        SS
                    </div>
                    <div className="ml-3 hidden md:block">
                        <p className="text-sm font-medium text-white">Simran S.</p>
                        <p className="text-xs text-slate-500">simran@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
