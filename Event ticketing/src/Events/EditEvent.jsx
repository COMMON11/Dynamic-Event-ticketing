import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import GetUser from '../Auth/GetUser';

export default function EditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = Cookies.get("id");
    const [userJSON, setUserJSON] = useState(null);
    const [userLoading, setUserLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [eventLoading, setEventLoading] = useState(false);

    const [eventData, setEventData] = useState({
        event_name: "",
        description: "",
        due_date: "",
        logo: "",
        logoType: "",
        banner: "",
        bannerType: "",
        availSlots: "",
        maxBookings: "",
        price: "",
    });

    useEffect(() => {
        if (!userId) {
            window.localStorage.clear();
            navigate("/login");
        } else {
            async function getUser() {
                const user = await GetUser(userId);
                setUserJSON(user);
                setUserLoading(true);
            }
            getUser();
            fetchEventData();
        }
    }, [userId, navigate, id]);

    const fetchEventData = async () => {
        try {
            const response = await axios.get(`/api/getEventById?event_id=${id}&user_id=${userId}`);
            if (response.data) { 
                console.log(response.data);
                const event = response.data;
                setEventData({
                    event_id: id,
                    created_by_ui: userId,
                    event_name: event.event_name,
                    description: event.description,
                    due_date: event.due_date,
                    logo: event.logo || "",
                    logoType: event.logoType || "",
                    banner: event.banner || "",
                    bannerType: event.bannerType || "",
                    availSlots: event.availSlots,
                    maxBookings: event.maxBookings,
                    price: event.price
                });
                setEventLoading(true);
            }
        } catch (error) {
            console.error("Error fetching event data:", error);
            setMessage("Error loading event data");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleLogoImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(",")[1];
                setEventData({ ...eventData, logo: base64String, logoType: file.type });
            };
            reader.onerror = (error) => {
                console.error("Error converting image to Base64:", error);
            };
        }
    };

    const handleBannerImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(",")[1];
                setEventData({ ...eventData, banner: base64String, bannerType: file.type });
            };
            reader.onerror = (error) => {
                console.error("Error converting image to Base64:", error);
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/eventUpdate`, eventData, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.success) {
                setMessage("Event updated successfully!");
                navigate(`/event/${id}`);
            } else {
                setMessage(response.data.message || "Event update failed.");
            }
        } catch (error) {
            console.error("Error updating event:", error);
            setMessage("An error occurred while updating the event.");
        }
    };

    if (!userLoading) return <div>Loading...</div>;
    if (!eventLoading) return <div>Loading event data...</div>;

    return (
        <div>
            <h2>Edit Event</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Event Name:</label>
                    <input 
                        type="text" 
                        name="event_name" 
                        value={eventData.event_name} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea 
                        name="description" 
                        value={eventData.description} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label>Due Date:</label>
                    <input 
                        type="date" 
                        name="due_date" 
                        value={eventData.due_date} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label>Number of Available Tickets:</label>
                    <input 
                        type="number" 
                        name="availSlots" 
                        value={eventData.availSlots} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label>Maximum Number of Bookings per User:</label>
                    <input 
                        type="number" 
                        name="maxBookings" 
                        value={eventData.maxBookings} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <label>Price per Ticket:</label>
                    <input 
                        type="number" 
                        name="price" 
                        value={eventData.price} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <div>
                    <p>Logo:</p>
                    {eventData.logo && (
                        <img 
                            src={`data:${eventData.logoType};base64,${eventData.logo}`} 
                            alt="Current logo" 
                            style={{ maxWidth: '200px' }} 
                        />
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoImageUpload} />
                </div>

                <div>
                    <p>Banner:</p>
                    {eventData.banner && (
                        <img 
                            src={`data:${eventData.bannerType};base64,${eventData.banner}`} 
                            alt="Current banner" 
                            style={{ maxWidth: '200px' }} 
                        />
                    )}
                    <input type="file" accept="image/*" onChange={handleBannerImageUpload} />
                </div>

                <button type="submit">Update Event</button>
            </form>
        </div>
    );
}