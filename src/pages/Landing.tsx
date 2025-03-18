import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://task-manager-api-lqtm.onrender.com';

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.time('Auth Request'); // Start timing
    try {
      const url = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/users/register`;
      console.log('Sending request to:', url, 'with data:', formData);
      const res = await axios.post(url, isLogin ? { email: formData.email, password: formData.password } : formData);
      console.log('Response:', res.data);

      if (isLogin) {
        const token = res.data.access_token;
        localStorage.setItem('token', token);
        console.log('Token set:', token);
        console.timeEnd('Auth Request'); // End timing
        navigate('/dashboard', { replace: true }); // Replace history to prevent back navigation
      } else {
        setIsLogin(true); // Switch to login after registration
        setFormData({ name: '', email: formData.email, password: formData.password });
      }
    } catch (err: any) {
      console.error('Auth Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Something went wrong');
      console.timeEnd('Auth Request');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? 'Welcome Back' : 'Join Us'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </motion.button>
        </form>
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Landing;