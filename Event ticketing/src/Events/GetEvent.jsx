import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import GetUser from '../Auth/GetUser';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");
    const userDetails = localStorage.getItem("userDetails");
    const [userJSON, setUserJSON] = useState(JSON.parse(userDetails));
    const [message, setMessage] = useState("")
    const navigate = useNavigate();

    const userId = Cookies.get("id");
    
    //check user
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
                    localStorage.setItem("userDetails", JSON.stringify(user));
                }
            }
            getUser();
        }
    }, [userId, navigate]);

    //Update after change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvent({...event, [name]: value });
    };

    //fetch event
    useEffect(() => {
        axios.get(`/api/getEventById?event_id=${id}`)
        .then(response => {
            if (response.data.success) {
            setEvent(response.data);
            } else {
            setError(response.data.message);
            }
        })
        .catch(error => {
            setError("An error occurred while fetching the event.");
        });
    }, [id]);

    //check if event already booked

    //Book tickets
    const handleBookTicket = async () => {
        const params = {
            user_id: userId,
            event_id: event.event_id,
            quantity: 5, 
        } 
        const response = await axios.post('/api/book', params)

        if (response.data.success) {
            setMessage("Ticket booked successfully")
            window.location.reload();
        } else {
            alert(response.data.message);
        }
    };

    function getMaxTickets() {
        for(let i = 1; i <= event.maxBookings; i++) {
            return <option value="{i}">${i}</option>
        }
    }

    return (
        <div>
        {error ? (
            <p>{error}</p>
        ) : event ? (
            <div>
                {message && <p>{message}</p>}
                <select onChange={handleChange} name="quantity" id="quantity">
                    {[...Array(event.maxBookings)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                        {index + 1}
                        </option>
                    ))}
                </select>                
                <input type="button" value="Book ticket" onClick={handleBookTicket} />
                <h2>{event.event_name}</h2>
                <p>{event.description}</p>
                <small>Created: {event.creation_date}, Due: {event.due_date}</small>
                <p>Logo:</p>
                <img src={`data:${event.logoType};base64,${event.logo}`} alt={event.event_name} />
                <p>Banner:</p>
                <img src={`data:${event.bannerType};base64,${event.banner}`} alt={event.event_name} />
            </div>
        ) : (
            <p>Loading event...</p>
        )}
        </div>
    );
};

export default EventDetails;
