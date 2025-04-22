import React from 'react';
import { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
    const ref = useRef();
    const passwordRef = useRef();
    const [form, setform] = useState({ site: "", username: "", password: "" });
    const [passwordArray, setPasswordArray] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Check for authentication
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const getPasswords = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const req = await fetch("https://password-manager-l927.onrender.com/api/passwords", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (req.status === 401 || req.status === 403) {
                // Token expired or invalid
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            if (!req.ok) {
                throw new Error(`Error ${req.status}: ${req.statusText}`);
            }
            
            const passwords = await req.json();
            setPasswordArray(passwords);
        } catch (error) {
            console.error("Error fetching passwords:", error);
            setError(error.message);
            toast.error(`Failed to fetch passwords: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        getPasswords();
    }, []);

    const copyText = (text) => {
        toast.success('Copied to Clipboard!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
        navigator.clipboard.writeText(text);
    };

    const showPassword = () => {
        if (ref.current.src.includes("icons/eyecross.png")) {
            ref.current.src = "icons/eye.png";
            passwordRef.current.type = "password";
        } else {
            passwordRef.current.type = "text";
            ref.current.src = "icons/eyecross.png";
        }
    };

    const savePassword = async () => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                setIsLoading(true);

                // If editing an existing password, delete it first
                if (form.id) {
                    const deleteResponse = await fetch(`https://password-manager-l927.onrender.com/api/passwords/${form.id}`, { 
                        method: "DELETE", 
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    
                    if (!deleteResponse.ok) {
                        const errorData = await deleteResponse.json();
                        throw new Error(errorData.message || "Failed to delete existing password");
                    }
                }

                const newId = form.id || uuidv4();
                
                // Save to backend
                const saveResponse = await fetch("https://password-manager-l927.onrender.com/api/passwords", { 
                    method: "POST", 
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }, 
                    body: JSON.stringify({ ...form, id: newId }) 
                });
                
                if (!saveResponse.ok) {
                    const errorData = await saveResponse.json();
                    throw new Error(errorData.message || "Failed to save password");
                }

                // Add to local state after successful save
                if (!form.id) {
                    setPasswordArray([...passwordArray, { ...form, id: newId }]);
                } else {
                    // For edits, re-fetch passwords to ensure consistency
                    await getPasswords();
                }

                // Clear the form
                setform({ site: "", username: "", password: "" });
                toast.success('Password saved!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } catch (error) {
                console.error("Error saving password:", error);
                toast.error(`Failed to save password: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        } else {
            toast.error('Error: All fields must be at least 4 characters!');
        }
    };

    const deletePassword = async (id) => {
        console.log("Deleting password with id ", id);
        let c = confirm("Do you really want to delete this password?");
        if (c) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                setIsLoading(true);

                // Update UI first for responsiveness
                setPasswordArray(passwordArray.filter(item => item.id !== id));
                
                // Then perform backend operation
                const response = await fetch(`https://password-manager-l927.onrender.com/api/passwords/${id}`, {
                    method: "DELETE", 
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to delete password");
                }
                
                toast.success('Password Deleted!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            } catch (error) {
                console.error("Error deleting password:", error);
                toast.error(`Failed to delete password: ${error.message}`);
                // Refresh the password list in case the deletion failed
                getPasswords();
            } finally {
                setIsLoading(false);
            }
        }
    };

    const editPassword = (id) => {
        console.log("editing password with id " + id);
        const passwordToEdit = passwordArray.find(item => item.id === id);
        if (passwordToEdit) {
            setform({...passwordToEdit});
            // We don't remove from the list until save is successful
        }
    };

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <>
            <ToastContainer />
            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]">
                </div>
            </div>
            <div className='p-8 md:mycontainer min-h-[85.2vh]'>
                <h1 className='text-4xl font-bold text-center'>
                    <span className='text-green-600'>&lt;</span>
                    <span>Pass</span>
                    <span className='text-green-600'>OP<img className='w-9 pl-1 inline-block' src="favicon.png" alt="" />
                        &gt;</span>
                </h1>
                <p className='text-green-900 text-lg text-center'>Your own password manager.</p>
                <div className='flex flex-col p-4 text-black gap-8 items-center'>
                    <input value={form.site} onChange={handleChange} placeholder='Enter website name' className='rounded-full border border-green-500 w-full px-4 py-1' type="text" name='site' id='site'/>
                    <div className='flex flex-col md:flex-row w-full justify-between gap-8'>
                        <input value={form.username} onChange={handleChange} placeholder='Enter Username' className='rounded-full border border-green-500 w-full px-4 py-1' type="text" name='username' id='username'/>
                        <div className="relative">
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder='Enter Password' className='rounded-full border border-green-500 w-full px-4 py-1' type="password" name='password' id='password'/>
                            <span className='absolute right-[3px] top-[3px] cursor-pointer' onClick={showPassword}>
                                <img ref={ref} className='p-1' width={27} src="icons/eye.png" alt="" />
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={savePassword} 
                        disabled={isLoading}
                        className='flex justify-center items-center gap-2 bg-green-500 rounded-full px-4 py-2 w-fit hover:bg-green-600 border hover:border-2 border-green-800 h-[6vh] disabled:opacity-50'
                    >
                        <lord-icon
                            src="https://cdn.lordicon.com/jgnvfzqg.json"
                            trigger="hover">
                        </lord-icon>
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <div className="passwords">
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    
                    {isLoading && <div className="text-center py-4">Loading passwords...</div>}
                    
                    {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}
                    
                    {!isLoading && !error && passwordArray.length === 0 && 
                        <div className="text-center py-4">No Passwords to show</div>
                    }
                    
                    {!isLoading && !error && passwordArray.length > 0 &&
                        <table className="table-auto w-full overflow-hidden rounded-md">
                            <thead className='bg-green-800 text-white'>
                                <tr>
                                    <th className='py-2'>Site</th>
                                    <th className='py-2'>Username</th>
                                    <th className='py-2'>Password</th>
                                    <th className='py-2'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='bg-green-100'>
                                {passwordArray.map((item, index) => {
                                    return <tr key={index}>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center '>
                                                <a href={item.site.startsWith('http') ? item.site : `https://${item.site}`} target='_blank' rel="noopener noreferrer">{item.site}</a>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.site) }}>
                                                    <lord-icon
                                                        style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover" >
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center '>
                                                <span>{item.username}</span>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.username) }}>
                                                    <lord-icon
                                                        style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover" >
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='py-2 border border-white text-center'>
                                            <div className='flex items-center justify-center '>
                                                <span>{"*".repeat(item.password.length)}</span>
                                                <div className='lordiconcopy size-7 cursor-pointer' onClick={() => { copyText(item.password) }}>
                                                    <lord-icon
                                                        style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                        src="https://cdn.lordicon.com/iykgtsbt.json"
                                                        trigger="hover" >
                                                    </lord-icon>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='justify-center py-2 border border-white text-center'>
                                            <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/gwlusjdu.json"
                                                    trigger="hover"
                                                    style={{ "width": "25px", "height": "25px" }}>
                                                </lord-icon>
                                            </span>
                                            <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/skkahier.json"
                                                    trigger="hover"
                                                    style={{ "width": "25px", "height": "25px" }}>
                                                </lord-icon>
                                            </span>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>}
                </div>
            </div>
        </>
    );
};

export default Manager;