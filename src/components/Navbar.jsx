import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className='bg-slate-800 text-white'>
            <div className="mycontainer flex justify-between px-4 py-5 items-center h-14">
                <Link to="/" className="logo font-bold text-2xl">
                    <span className='text-green-600'>&lt;</span>
                    <span>Pass</span>
                    <span className='text-green-600'>OP <img className='pr-[2px] w-6 inline-block' src="/favicon.png" alt="" />
                        &gt;</span>
                </Link>
                
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-green-400">Hi, {user.username}</span>
                            <button 
                                onClick={handleLogout}
                                className='text-white rounded-2xl px-3 py-1 flex justify-between items-center bg-red-600 hover:bg-red-700'
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <Link 
                                to="/login"
                                className='text-white rounded-2xl px-3 py-1 flex justify-between items-center bg-green-700 hover:bg-green-600'
                            >
                                Login
                            </Link>
                            <Link 
                                to="/register"
                                className='text-white rounded-2xl px-3 py-1 flex justify-between items-center bg-green-700 hover:bg-green-600'
                            >
                                Register
                            </Link>
                        </div>
                    )}
                    
                    <a href="https://github.com/yourusername/password-manager" target="_blank" rel="noopener noreferrer" className='text-white rounded-2xl flex justify-between items-center bg-green-700 ring-[#96baa3] ring-1'>
                        <img className='invert w-10 p-1' src="/icons/github.svg" alt="" />
                        <span className='font-bold px-2'>GitHub</span>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;