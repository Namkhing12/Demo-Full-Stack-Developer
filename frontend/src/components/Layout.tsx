import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Bell, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

export default function Layout() {
    const { user, logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Log Search', href: '/search', icon: Search },
        { name: 'Alerts', href: '/alerts', icon: Bell },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
                <div className="flex items-center h-16 shrink-0 px-6 bg-slate-950">
                    <Shield className="h-6 w-6 text-indigo-400" />
                    <span className="ml-3 text-lg font-bold text-white tracking-wide">LogVault</span>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    clsx(
                                        'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                                        isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    )
                                }
                            >
                                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950">
                    <div className="flex items-center">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.role} • {user?.tenant}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="ml-2 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="md:hidden flex items-center h-16 shrink-0 px-4 bg-slate-900 border-b border-slate-800">
                    <Shield className="h-6 w-6 text-indigo-400" />
                    <span className="ml-3 text-lg font-bold text-white tracking-wide">LogVault</span>
                </header>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 md:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
