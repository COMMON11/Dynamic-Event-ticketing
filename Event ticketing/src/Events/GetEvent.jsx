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
    const navigate = useNavigate();

    const userId = Cookies.get("id");

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

    return (
        <div>
        {error ? (
            <p>{error}</p>
        ) : event ? (
            <div>
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
