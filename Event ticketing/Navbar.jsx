import React from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({userJSON}) {
    function Logout() {
        window.localStorage.clear();
        Cookies.remove("id");
        navigate("/login");
    }
    return (
        <nav className='font-display flex justify-between items-center pt-1 pr-2 rounded-2xl mt-4 mr-2 ml-2 bg-gray-300 h-16 shadow-black shadow-2xl'>
            {/* Left side */}
            <div className="px-4 ml-2">
                <Link to="/">
                    <button className='text-lg text-center items-center gap-2 rounded-2xl bg-gray-400 w-28 h-12 p-2 border-2 border-gray-500 transition-colors duration-300 ease-in-out hover:bg-gray-300 hover:border-gray-800 active:scale-80'>
                        Home
                    </button>
                </Link>
            </div>

            {/* Right side */}
            <div className='flex items-center gap-4'>
                <Link to="/user">
                    <button className='flex items-center gap-2 rounded-2xl bg-gray-400 w-52 h-12 p-2 border-2 border-gray-500  transition-colors duration-300 ease-in-out hover:bg-gray-300 hover:border-gray-800 active:scale-80'>
                        {userJSON.pic && <img src={`data:${userJSON.pic_type};base64,${userJSON.pic}`} alt="Profile" width={"30px"} className='rounded-full size-10'/>}
                        {userJSON && userJSON.name? <p className='font-display'>{userJSON.name} </p> : null}
                    </button>
                </Link>
                <button onClick={Logout} className='bg-red-500 w-20 h-12 rounded-2xl text-white font-display border-2 border-red-300 transition-colors duration-500 ease-in-out hover:bg-gray-300 hover:text-red-500 hover:border-red-500 active:scale-80'>
                    Logout
                </button>
            </div>
        </nav>
    )
}