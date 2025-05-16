import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import {
    ArrowLeft,
    ArrowUp,
    Briefcase,
    Calendar,
    MoreHorizontal,
    Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDataModelFromQueryService } from '@/services/dataModelService';

const TaskPage = () => {
    const { userData } = useAuth();

    // Filter state
    const [tasks, setTasks] = useState([]);
    const [location, setLocation] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');
    const [dateRange] = useState('01.01.2023 - 31.12.2023');
    const [activeTab, setActiveTab] = useState(0);

    // Stats for Total Tasks
    const total = 190000;
    const completed = 173372;
    const percent = Math.min(100, Math.round((completed / total) * 100));
    const delta = 2.6;
    const deltaLabel = 'since last year';

    // Chart data
    const doughnutData = [
        { name: 'Management', value: 23 },
        { name: 'Service', value: 19 },
        { name: 'Küche', value: 30 },
        { name: 'Housekeeping', value: 28 },
    ];
    const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#A855F7'];

    const barData = [
        { month: 'Jan', Management: 4000, Service: 2000, Küche: 1000, Housekeeping: 1500 },
        { month: 'Feb', Management: 3000, Service: 1800, Küche: 1200, Housekeeping: 1300 },
        { month: 'Mar', Management: 3500, Service: 2200, Küche: 1400, Housekeeping: 1600 },
        { month: 'Apr', Management: 3800, Service: 2400, Küche: 1600, Housekeeping: 1800 },
        { month: 'May', Management: 4200, Service: 2600, Küche: 1800, Housekeeping: 2000 },
        { month: 'Jun', Management: 4500, Service: 2800, Küche: 2000, Housekeeping: 2200 },
    ];

    // Task list
    // const tasks = [
    //     { datetime: 'Mon, 25.09.2023 17:00', name: 'Task Name', desc: 'Task Description', employee: 'Floyd Miles', role: 'Plumber, 80%', type: 'Personal', status: 'Completed' },
    //     { datetime: 'Tue, 26.09.2023 10:30', name: 'Task Name', desc: 'Task Description', employee: 'Jenny Wilson', role: 'Chef, 80%', type: 'Shift', status: 'Pending' },
    //     { datetime: 'Wed, 27.09.2023 14:15', name: 'Task Name', desc: 'Task Description', employee: 'Esther Howard', role: 'Housekeeper, 100%', type: 'Shift', status: 'Pending' },
    // ];

    const tabLabels = ['All Tasks', 'Completed', 'Pending'];
    const filteredTasks = tasks.filter((t) => {
        if (activeTab === 1) return t.status === 'Completed';
        if (activeTab === 2) return t.status !== 'Completed';
        return true;
    });

    useEffect(() => {
        fetchTasksList();
    }, []);

    const fetchTasksList = async () => {
        try {
            const query = {
                SQLQuery: `SELECT * FROM TASK_LIST`,
            };


            const response = await getDataModelFromQueryService(query, userData.currentUserLogin, userData.clientURL);

            setTasks(response);

        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end flex-wrap gap-2">
                    <select
                        className="select select-bordered select-sm w-full md:w-40"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <option value="">All Locations</option>
                        <option>Location A</option>
                        <option>Location B</option>
                    </select>

                    <select
                        className="select select-bordered select-sm w-full md:w-40"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        <option>Dept 1</option>
                    </select>

                    <select
                        className="select select-bordered select-sm w-full md:w-40"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <option value="">Year</option>
                        <option>2023</option>
                        <option>2024</option>
                    </select>
                </div>
            </div>


            {/* Cards and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-4">
                    {/* Total Tasks Card */}
                    <div className="cust-card-group flex gap-4 items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Briefcase className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase">Total Tasks</h2>
                            <div className="mt-1 flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">{completed.toLocaleString()}</span>
                                <span className="text-sm text-gray-400">/ {total.toLocaleString()}</span>
                            </div>
                            <div className="mt-2 flex items-center space-x-2 text-xs">
                                <div className="badge badge-success flex items-center">
                                    <ArrowUp className="h-4 w-4" />
                                    <span className="ml-1">+{delta}%</span>
                                </div>
                                <span className="text-gray-500">{deltaLabel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Task Distribution Card */}
                    <div className="cust-card-group">
                        <h2 className="text-sm text-gray-500 mb-2">Task Distribution</h2>
                        <div className="flex items-center space-x-4">
                            <ResponsiveContainer width="50%" height={160}>
                                <PieChart>
                                    <Pie data={doughnutData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60}>
                                        {doughnutData.map((entry, idx) => (
                                            <Cell key={idx} fill={COLORS[idx]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-1/2 text-xs space-y-2">
                                {doughnutData.map((d, i) => (
                                    <div key={d.name} className="flex items-center space-x-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span>{d.name}: {d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bar Chart Card */}
                <div className="cust-card-group col-span-2">
                    <h2 className="text-sm text-gray-500 mb-2">Tasks Completed</h2>
                    <div className="w-full h-56">
                        <ResponsiveContainer>
                            <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                {['Management', 'Service', 'Küche', 'Housekeeping'].map((key, idx) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={COLORS[idx]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Tabs and Table */}
            <div className="cust-card-group no-hover">
                <div className="tabs tabs-boxed mb-4">
                    {tabLabels.map((label, idx) => (
                        <button
                            key={idx}
                            className={`tab ${activeTab === idx ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(idx)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Task</th>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.datetime}</td>
                                    <td>
                                        <div className="font-semibold">{r.name}</div>
                                        <div className="text-xs text-gray-500">{r.desc}</div>
                                    </td>
                                    <td>
                                        <div className="font-semibold">{r.employee}</div>
                                        <div className="badge badge-outline badge-sm mt-1">{r.role}</div>
                                    </td>
                                    <td>{r.type}</td>
                                    <td>
                                        <span className={`badge badge-${r.status === 'Completed' ? 'success' : 'warning'} badge-sm`}>{r.status}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm btn-circle">
                                            <Trash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TaskPage;
