import { useState, useEffect } from 'react';
import { ShieldAlert, Settings, Plus } from 'lucide-react';
import { apiClient } from '../api/client';
import { format } from 'date-fns';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [triggered, setTriggered] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rulesRes, trigRes] = await Promise.all([
                    apiClient.get('/api/alerts'),
                    apiClient.get('/api/alerts/triggered')
                ]);
                setAlerts(rulesRes.data);
                setTriggered(trigRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Alert Center</h1>
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow shadow-indigo-200">
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Rule
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Triggered Alerts */}
                <div className="bg-white shadow-sm rounded-xl border border-red-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-red-50/50 flex items-center">
                        <ShieldAlert className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Recent Triggered Alerts</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {triggered.length === 0 && <div className="p-6 text-center text-gray-500">No recent alerts.</div>}
                        {triggered.map((trig: any) => (
                            <div key={trig.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-sm font-medium text-red-600">{trig.AlertRule?.name}</h4>
                                        <p className="text-xs text-gray-500 mt-1">Matched {Array.isArray(trig.matched_logs) ? trig.matched_logs.length : 'multiple'} condition events</p>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(trig.created_at), 'MMM dd, HH:mm')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active Rules */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center">
                        <Settings className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Configured Rules</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {alerts.length === 0 && <div className="p-6 text-center text-gray-500">No alert rules configured.</div>}
                        {alerts.map((rule: any) => (
                            <div key={rule.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 capitalize">{rule.condition?.event_type || 'Custom Condition'}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rule.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {rule.active ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
