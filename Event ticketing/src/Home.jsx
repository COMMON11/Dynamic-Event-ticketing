import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
export default function Home() {
    const [profilePic, setProfilePic] = useState(null);
    const navigate = useNavigate();
    const userId = Cookies.get("id");
    const userDetails = localStorage.getItem("userDetails");
    const userJSON = JSON.parse(userDetails);
    if (userId == undefined) {
        (window.localStorage.clear());
        useEffect(() => {
            navigate("/login");
        },[]);
    }
    useEffect(() => {
        if (userJSON) {
            setProfilePic(userJSON.pic);
        }
    }, [profilePic])

    function Logout() {
        window.localStorage.clear();
        Cookies.remove("id");
        navigate("/login");
    }
    
    return (
        <div>
            <div>
                <h1>Welcome, {userId ? `User ID: ${userId}` : "Guest"}!</h1>
                <h1>Welcome, {userId ? `User Name: ${userJSON.name}` : "Guest"}!</h1>
                {profilePic && <img src={`data:image/jpeg;base64,${profilePic}`} alt="Profile" width={"300px"} />}
            </div>
            <h1>Event Ticketing</h1>
            <p>Welcome to Event Ticketing. Please log in or register.</p>
            <Link to="/login">Login</Link>
            <Link to="/user">User details</Link>
            <a href="#" onClick={Logout}>Logout</a>
        </div>
    );
}