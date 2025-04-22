import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                // Save token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                toast.success('Login successful!');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
            </div>
            <div className="p-8 md:mycontainer min-h-[85.2vh] flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-center mb-6">
                        <span className="text-green-600">&lt;</span>
                        <span>Login</span>
                        <span className="text-green-600">OP<img className="w-7 pl-1 inline-block" src="favicon.png" alt="" />&gt;</span>
                    </h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-full border border-green-500 px-4 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-full border border-green-500 px-4 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                        
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 bg-green-500 text-white rounded-full px-4 py-2 hover:bg-green-600 border hover:border-2 border-green-800"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-4 text-center">
                        <p>Don't have an account? <a href="/register" className="text-green-600 hover:text-green-500">Register</a></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;