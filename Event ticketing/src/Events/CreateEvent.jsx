import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import GetUser from '../Auth/GetUser';

export default function CreateEvent() {
    const [userJSON, setUserJSON] = useState(null);
    const navigate = useNavigate();
    const userId = Cookies.get("id");
    const [userLoading, setUserLoading] = useState(false);

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
                setUserLoading(true);
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
        logo: "",
        logoType: "",
        banner: "",
        bannerType: "",
        availSlots: "",
        maxBookings: "",
        price: "",
    });

    const [message, setMessage] = useState("");

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

      // Convert logo image to Base64
    const handleLogoImageUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
            // Extract only Base64 data
        reader.onload = () => {
            const base64String = reader.result.split(",")[1]; 
            setEventData({ ...eventData, logo: base64String, logoType: file.type });
            // setProfilePic(base64String);
        };

        reader.onerror = (error) => {
            console.error("Error converting image to Base64:", error);
        };
        }
    };

    // Convert banner image to Base64
    const handleBannerImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
        // Extract only Base64 data
    reader.onload = () => {
        const base64String = reader.result.split(",")[1]; 
        setEventData({ ...eventData, banner: base64String, bannerType: file.type });
        console.log(eventData);
    };

    reader.onerror = (error) => {
        console.error("Error converting image to Base64:", error);
    };
    }
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

    if (!userLoading) return <div>User details loading</div>
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

            <div>
                <label>Number of Available Tickets:</label>
                <input type="number" name="availSlots" value={eventData.availSlots} onChange={handleChange} required />
            </div>
            
            <div>
                <label>Maximum Number of Bookings per User:</label>
                <input type="number" name="maxBookings" value={eventData.maxBookings} onChange={handleChange} required />
            </div>
            
            <div>
                <label>Price per Ticket:</label>
                <input type="number" name="price" value={eventData.price} onChange={handleChange} required />
            </div>
            <p>Logo:</p>
            <input type="file" accept="image/*" onChange={handleLogoImageUpload} />
            <p>Banner:</p>
            <input type="file" accept="image/*" onChange={handleBannerImageUpload} />
            <button type="submit">Create Event</button>
        </form>
        </div>
    );
}
