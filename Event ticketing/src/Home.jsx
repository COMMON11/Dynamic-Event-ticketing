import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import GetUser from './Auth/GetUser';

export default function Home() {
    const navigate = useNavigate();
    const userId = Cookies.get("id");
    const userDetails = localStorage.getItem("userDetails");
    const [userJSON, setUserJSON] = useState(JSON.parse(userDetails)); 
    const [userLoading, setUserLoading] = useState(false);

    // const userDetails = localStorage.getItem("userDetails");
    // const userJSON = userDetails ? JSON.parse(userDetails) : null;

    useEffect(() => {
        // Redirect to login if userId is not set
        if (!userId) {
            window.localStorage.clear();
            navigate("/login");
        } else {
            // Fetch user details from the server
            async function getUser() {
                const user = await GetUser(userId);
                if (user) {
                    setUserJSON(user);
                    setUserLoading(true);
                }
            }
            getUser();
        }
    }, [userId, navigate]);

    function Logout() {
        window.localStorage.clear();
        Cookies.remove("id");
        navigate("/login");
    }

    if (!userLoading) { return <div>Loading user details</div>}  

    return (
        <>
            <div className='min-h-screen bg-redishpink-100 pt-4 px-2'>
                <nav className='flex flex-row-reverse pt-1 items-center pr-2 rounded-2xl mt-4 mr-2 ml-2 bg-gray-300 h-16 shadow-black shadow-2xl'>
                    <button onClick={Logout} className='ml-4 bg-red-500 w-20 h-12 rounded-2xl text-white font-display border-2 border-red-300 transition-colors duration-500 ease-in-out hover:bg-gray-300 hover:text-red-500 hover:border-red-500 active:scale-80'>Logout</button>
                    <Link to="/user">
                        <button className='flex items-center gap-2 rounded-2xl bg-gray-400 w-52 h-12 p-2 border-2 border-gray-500  transition-colors duration-300 ease-in-out hover:bg-gray-300 hover:border-gray-800 active:scale-80'>
                            {userJSON.pic && <img src={`data:${userJSON.pic_type};base64,${userJSON.pic}`} alt="Profile" width={"30px"} className='rounded-full size-10'/>}
                            {userJSON && userJSON.name? <p className='font-display'>{userJSON.name} </p> : null}
                        </button>
                    </Link>
                </nav>
                <div className='flex justify-between items-center  mx-64 mt-44'>
                    <div className='relative'>
                    <Link to="/createEvent"><button className='h-[30rem] w-[30rem] font-display font-bold text-6xl bg-white relative z-10 transition-all duration-300 ease-in-out border-4 border-gray-300 hover:border-8 hover:border-gray-500 active:translate-x-12 active:translate-y-12'>Create Event</button></Link>
                    <div className='h-[30rem] w-[30rem] bg-black absolute top-12 left-12 z-0'></div>
                    </div>
                    <div className='relative'>
                        <Link to="/EventList"><button className='h-[30rem] w-[30rem] font-display font-bold text-6xl bg-white relative z-10 transition-all duration-300 ease-in-out border-4 border-gray-300 hover:border-8 hover:border-gray-500 active:translate-x-12 active:translate-y-12'>View Events</button></Link>
                        <div className='h-[30rem] w-[30rem] bg-black absolute top-12 left-12 z-0'></div>
                    </div>
                </div>
            </div>
        </>
    );
}
