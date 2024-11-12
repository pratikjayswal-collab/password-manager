import React from 'react'

const Footer = () => {
    return (
        <div className='bg-slate-800 text-white flex flex-col justify-center items-center w-full'>
            <div className="logo font-bold text-2xl ">
                    <span className='text-green-600'>&lt;</span>
                    <span>Pass</span>
                    <span className='text-green-600 '>OP <img className='pr-[2px] w-6 inline-block' src="favicon.png" alt="" />
                        &gt;</span></div>
            <div className='flex items-center justify-center'>
                Created with <img className='w-7 mx-2' src="icons/heart.png" alt="" /> by pratik
            </div>
        </div>
    )
}

export default Footer
