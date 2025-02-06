import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import GetUser from '../Auth/GetUser';

export default function CreateEvent() {
    const userDetails = localStorage.getItem("userDetails");
    const [userJSON, setUserJSON] = useState(JSON.parse(userDetails));
    const navigate = useNavigate();
    const userId = Cookies.get("id");
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
                setUserJSON(user);
                localStorage.setItem("userDetails", JSON.stringify(user));
            }
            getUser();
        }
    }, [userId, navigate]);

    const [eventData, setEventData] = useState({
        created_by_uid: "",
        event_name: "",
        description: "",
        creation_date: "",
        due_date: "",
    });

    const [message, setMessage] = useState("");

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

  // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        eventData.created_by_uid = userId;
        try {
        const response = await axios.post("/api/createEvent", eventData, {
            headers: { "Content-Type": "application/json" },
        });

        if (response.data.success) {
            setMessage("Event created successfully!");
            setEventData({ created_by_uid: "", event_name: "", description: "", creation_date: "", due_date: "" });
        } else {
            setMessage(response.data.message || "Event creation failed.");
        }
        } catch (error) {
        console.error("Error creating event:", error);
        setMessage("An error occurred while creating the event.", error);
        }
    };

    return (
        <div>
        <h2>Create Event</h2>
        {message && <p>{message}</p>}
        <form onSubmit={handleSubmit}>

            <div>
            <label>Event Name:</label>
            <input type="text" name="event_name" value={eventData.event_name} onChange={handleChange} required />
            </div>

            <div>
            <label>Description:</label>
            <textarea name="description" value={eventData.description} onChange={handleChange} required />
            </div>

            <div>
            <label>Due Date:</label>
            <input type="date" name="due_date" value={eventData.due_date} onChange={handleChange} required />
            </div>

            <button type="submit">Create Event</button>
        </form>
        </div>
    );
}
