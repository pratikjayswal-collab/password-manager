import React from 'react'

const Navbar = () => {
    return (
        <nav className='bg-slate-800 text-white'>
            <div className="mycontainer flex justify-between px-4 py-5 items-center h-14">

                <div className="logo font-bold text-2xl ">
                    <span className='text-green-600'>&lt;</span>
                    <span>Pass</span>
                    <span className='text-green-600 '>OP <img className='pr-[2px] w-6 inline-block' src="favicon.png" alt="" />
                        &gt;</span></div>

                <button className='text-white rounded-2xl my-5 flex justify-between items-center bg-green-700 ring-[#96baa3] ring-1'>
                    <img className='invert w-10 p-1' src="icons/github.svg" alt="" />
                    <span className='font-bold px-2'>GitHub</span>
                </button>
            </div>
        </nav>
    )
}

export default Navbar
