import React, { useEffect, useState, useCallback } from 'react';
import { Offer, UserStat, OfferClick } from '../types';
import { supabase } from '../services/supabaseClient';
import { createOffer, updateOffer, deleteOffer, fetchAllUsersStats, fetchRecentClicks } from '../services/adminService';
import AdminTaskForm from './AdminTaskForm';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'activity'>('tasks');
  const [tasks, setTasks] = useState<Offer[]>([]);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [clicks, setClicks] = useState<OfferClick[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Offer | null>(null);

  // Loaders
  const loadTasks = useCallback(async () => {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
    if (!error && data) setTasks(data);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
        const data = await fetchAllUsersStats();
        setUsers(data);
    } catch (e) { console.error(e); }
  }, []);

  const loadActivity = useCallback(async () => {
    // We need users and tasks to display meaningful info (names/titles) instead of IDs
    await Promise.all([loadTasks(), loadUsers()]); 
    const recentClicks = await fetchRecentClicks();
    setClicks(recentClicks);
  }, [loadTasks, loadUsers]);

  useEffect(() => {
    if (activeTab === 'tasks') loadTasks();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'activity') loadActivity();
  }, [activeTab, loadTasks, loadUsers, loadActivity]);

  // Handlers
  const handleCreateTask = async (data: Omit<Offer, 'id' | 'created_at'>) => {
    await createOffer(data);
    setIsEditing(false);
    loadTasks();
  };

  const handleUpdateTask = async (data: Omit<Offer, 'id' | 'created_at'>) => {
    if (!editingTask) return;
    await updateOffer(editingTask.id, data);
    setEditingTask(null);
    setIsEditing(false);
    loadTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Delete this task?')) {
        await deleteOffer(id);
        loadTasks();
    }
  };

  // Helper to format date
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Helper helpers for activity lookup
  const getUserEmail = (userId: string) => users.find(u => u.id === userId)?.email || 'Unknown User';
  const getTaskInfo = (offerId: string) => tasks.find(t => t.id === offerId) || { title: 'Deleted Task', icon_url: null };

  // Modern Tab Bar
  const TabBar = () => (
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl overflow-hidden mb-6">
          <button 
            onClick={() => { setActiveTab('tasks'); setIsEditing(false); }}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              Tasks
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setIsEditing(false); }}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              Users
          </button>
          <button 
            onClick={() => { setActiveTab('activity'); setIsEditing(false); }}
            className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-colors ${activeTab === 'activity' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
              Activity
          </button>
      </div>
  );

  return (
    <div className="flex flex-col">
      <TabBar />

      <div>
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
            <>
                {isEditing ? (
                    <AdminTaskForm 
                        initialData={editingTask} 
                        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                        onCancel={() => { setIsEditing(false); setEditingTask(null); }}
                    />
                ) : (
                    <div className="space-y-4">
                        <button 
                            onClick={() => { setEditingTask(null); setIsEditing(true); }}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors mb-4"
                        >
                            + Add New Task
                        </button>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {tasks.map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <img className="h-12 w-12 rounded-lg bg-gray-100 object-cover" src={task.icon_url || `https://ui-avatars.com/api/?name=${task.title}`} alt="" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate text-base">{task.title}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${task.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <p className="text-sm text-gray-500 truncate">{task.is_active ? 'Active' : 'Inactive'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => { setEditingTask(task); setIsEditing(true); }} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
             <div className="space-y-3">
                 {users.map((user) => (
                     <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                         <div>
                             <p className="font-bold text-sm text-gray-900 w-full sm:w-auto break-all sm:break-normal">{user.email}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                                <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                             </div>
                         </div>
                         <div className="text-right pl-4">
                             <p className="text-2xl font-bold text-indigo-600">{user.total_clicks}</p>
                             <p className="text-[10px] text-gray-400 font-medium uppercase">Tasks</p>
                         </div>
                     </div>
                 ))}
             </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
            <div className="space-y-3">
                {clicks.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No activity recorded yet.</p>
                    </div>
                ) : (
                    clicks.map((click) => {
                        const task = getTaskInfo(click.offer_id);
                        return (
                            <div key={click.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                {/* Task Icon */}
                                <div className="flex-shrink-0">
                                    <img 
                                        src={task.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.title)}&background=random`} 
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                        alt=""
                                    />
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 break-all">
                                        {getUserEmail(click.user_id)}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                                        Completed <span className="font-medium text-indigo-600">{task.title}</span>
                                    </p>
                                </div>

                                {/* Time */}
                                <div className="text-right flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                                        {formatTime(click.clicked_at)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;