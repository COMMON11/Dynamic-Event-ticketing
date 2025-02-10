import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import GetUser from './Auth/GetUser';
import Navbar from '../Navbar';

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

    if (!userLoading) { return <div>Loading user details</div>}  

    return (
        <>  
            <div className='min-h-screen bg-redishpink-100 pt-4 px-2'>
            <Navbar userJSON={userJSON}/>
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
