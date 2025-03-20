
 // Ensure this matches your Render URL

 import { useEffect, useState } from 'react';
 import { motion } from 'framer-motion';
 import axios from 'axios';
 import { useAuth } from '../context/AuthContext';
 
const API_BASE_URL = 'https://task-manager-api-lqtm.onrender.com'; // Ensure this matches your Render URL
 
 interface Task {
   _id: string;
   title: string;
   description: string;
   status: 'pending' | 'in-progress' | 'completed';
   created_at: string;
   updatedAt: string;
 }
 
 const Dashboard = () => {
   const { token, logout } = useAuth();
   const [tasks, setTasks] = useState<Task[]>([]);
   const [newTask, setNewTask] = useState({ title: '', description: '' });
   const [editTask, setEditTask] = useState<Task | null>(null);
   const [showModal, setShowModal] = useState(false);
   const [error, setError] = useState<string>('');
 
   useEffect(() => {
     fetchTasks();
   }, []);
 
   const fetchTasks = async () => {
     try {
       const res = await axios.get(`${API_BASE_URL}/tasks`, {
         headers: { Authorization: `Bearer ${token}` },
       });
       setTasks(res.data);
       setError('');
     } catch (err: any) {
       console.error('Fetch Tasks Error:', err.response?.data || err.message);
       setError('Failed to load tasks');
     }
   };
 
   const createTask = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       await axios.post(
         `${API_BASE_URL}/tasks`,
         { ...newTask, status: 'pending' },
         { headers: { Authorization: `Bearer ${token}` } }
       );
       setNewTask({ title: '', description: '' });
       setShowModal(false);
       fetchTasks();
     } catch (err: any) {
       console.error('Create Task Error:', err.response?.data || err.message);
       setError('Failed to create task');
     }
   };
 
   const updateTask = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!editTask) return;
     try {
       await axios.patch(
         `${API_BASE_URL}/tasks/${editTask._id}`,
         {
           title: editTask.title,
           description: editTask.description,
           status: editTask.status,
         },
         { headers: { Authorization: `Bearer ${token}` } }
       );
       setEditTask(null);
       fetchTasks();
     } catch (err: any) {
       console.error('Update Task Error:', err.response?.data || err.message);
       setError('Failed to update task');
     }
   };
 
   const deleteTask = async (id: string) => {
     if (confirm('Are you sure you want to delete this task?')) {
       try {
         await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
           headers: { Authorization: `Bearer ${token}` },
         });
         fetchTasks();
       } catch (err: any) {
         console.error('Delete Task Error:', err.response?.data || err.message);
         setError('Failed to delete task');
       }
     }
   };
 
   // Get status color
   const getStatusColor = (status: Task['status']) => {
     switch(status) {
       case 'pending': return 'bg-amber-100 border-amber-200';
       case 'in-progress': return 'bg-blue-100 border-blue-200';
       case 'completed': return 'bg-green-100 border-green-200';
       default: return 'bg-gray-100 border-gray-200';
     }
   };
 
   // Get status icon
   const getStatusIcon = (status: Task['status']) => {
     switch(status) {
       case 'pending': return '⏳';
       case 'in-progress': return '⚙️';
       case 'completed': return '✅';
       default: return '📝';
     }
   };
   
   const columns = {
     pending: tasks.filter((task) => task.status === 'pending'),
     'in-progress': tasks.filter((task) => task.status === 'in-progress'),
     completed: tasks.filter((task) => task.status === 'completed'),
   };
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
       {/* Header */}
       <header className="flex justify-between items-center mb-8">
         <h1 className="text-4xl font-extrabold text-gray-800">Task Manager</h1>
         <button
           onClick={logout}
           className="text-red-600 hover:text-red-800 font-semibold transition"
         >
           Logout
         </button>
       </header>
 
       {/* Add Task Button */}
       <motion.button
         whileHover={{ scale: 1.05 }}
         onClick={() => setShowModal(true)}
         className="mb-8 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition"
       >
         + New Task
       </motion.button>
 
       {error && <p className="text-red-500 mb-6 text-center">{error}</p>}
 
       {/* Kanban Columns */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {(['pending', 'in-progress', 'completed'] as const).map((status) => (
           <div key={status} className="bg-white rounded-xl shadow-md p-4 border-t-4 border-indigo-500">
             <h2 className="text-xl font-semibold text-gray-700 mb-4 capitalize flex items-center">
               {getStatusIcon(status)} <span className="ml-2">{status.replace('-', ' ')}</span>
               <span className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded-full">{columns[status].length}</span>
             </h2>
             <div className="space-y-4">
               {columns[status].length === 0 ? (
                 <p className="text-gray-500 text-center">No tasks</p>
               ) : (
                 columns[status].map((task) => (
                   <motion.div
                     key={task._id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     whileHover={{ y: -5 }}
                     transition={{ duration: 0.2 }}
                     className={`${getStatusColor(task.status)} p-4 rounded-lg border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-300`}
                   >
                     <div className="flex justify-between">
                       <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                       <div className="flex space-x-1">
                         <motion.button
                           whileHover={{ scale: 1.1 }}
                           onClick={() => setEditTask(task)}
                           className="text-blue-600 p-1 rounded-full hover:bg-blue-100"
                         >
                           ✏️
                         </motion.button>
                         <motion.button
                           whileHover={{ scale: 1.1 }}
                           onClick={() => deleteTask(task._id)}
                           className="text-red-600 p-1 rounded-full hover:bg-red-100"
                         >
                           🗑️
                         </motion.button>
                       </div>
                     </div>
                     
                     {task.description && (
                       <div className="mt-2 bg-white bg-opacity-60 p-2 rounded">
                         <p className="text-gray-600 text-sm">{task.description}</p>
                       </div>
                     )}
                     
                     <div className="mt-3 flex flex-wrap justify-between items-end">
                       <div className="w-full md:w-auto mt-2 md:mt-0">
                         <select
                           value={task.status}
                           onChange={(e) =>
                             setEditTask({ ...task, status: e.target.value as Task['status'] })
                           }
                           className="text-sm border rounded-full py-1 px-3 bg-white shadow-sm transition-colors"
                         >
                           <option value="pending">Pending</option>
                           <option value="in-progress">In Progress</option>
                           <option value="completed">Completed</option>
                         </select>
                       </div>
                       
                       <div className="text-right mt-2">
                         <p className="text-xs text-gray-500 italic">
                           Created: {new Date(task.created_at).toLocaleDateString()}
                         </p>
                         <p className="text-xs text-gray-500 italic">
                           Updated: {new Date(task.updatedAt).toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                   </motion.div>
                 ))
               )}
             </div>
           </div>
         ))}
       </div>
 
       {/* Create Task Modal */}
       {showModal && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
         >
           <div className="bg-white p-6 rounded-lg w-full max-w-md">
             <h2 className="text-2xl font-bold mb-4">New Task</h2>
             <form onSubmit={createTask} className="space-y-4">
               <input
                 type="text"
                 placeholder="Title"
                 value={newTask.title}
                 onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 required
               />
               <textarea
                 placeholder="Description (optional)"
                 value={newTask.description}
                 onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
               <div className="flex justify-end gap-2">
                 <button
                   type="button"
                   onClick={() => setShowModal(false)}
                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                 >
                   Create
                 </button>
               </div>
             </form>
           </div>
         </motion.div>
       )}
 
       {/* Edit Task Modal */}
       {editTask && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
         >
           <div className="bg-white p-6 rounded-lg w-full max-w-md">
             <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
             <form onSubmit={updateTask} className="space-y-4">
               <input
                 type="text"
                 value={editTask.title}
                 onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 required
               />
               <textarea
                 value={editTask.description}
                 onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
               />
               <select
                 value={editTask.status}
                 onChange={(e) =>
                   setEditTask({ ...editTask, status: e.target.value as Task['status'] })
                 }
                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                 <option value="pending">Pending</option>
                 <option value="in-progress">In Progress</option>
                 <option value="completed">Completed</option>
               </select>
               <div className="flex justify-end gap-2">
                 <button
                   type="button"
                   onClick={() => setEditTask(null)}
                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                 >
                   Save
                 </button>
               </div>
             </form>
           </div>
         </motion.div>
       )}
     </div>
   );
 };
 
 export default Dashboard;