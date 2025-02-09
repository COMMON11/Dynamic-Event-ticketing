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
        <div>
            <div>
                <h1>Welcome, {userId ? `User ID: ${userId}` : "Guest"}!</h1>
                <h1>Welcome, {userJSON && userJSON.name ? `User Name: ${userJSON.name}` : "Guest"}!</h1>
                {userJSON.pic  && <img src={`data:${userJSON.pic_type};base64,${userJSON.pic}`} alt="Profile" width={"300px"} />}
            </div>
            <h1>Event Ticketing</h1>
            <p>Welcome to Event Ticketing. Please log in or register.</p>
            <Link to="/login">Login</Link>
            <Link to="/user">User details</Link>
            <a href="#" onClick={Logout}>Logout</a>
        </div>
    );
}
