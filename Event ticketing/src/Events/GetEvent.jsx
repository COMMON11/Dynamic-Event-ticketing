import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get(`/api/getEventById?event_id=${id}`)
        .then(response => {
            if (response.data.success) {
            setEvent(response.data);
            console.log(response.data);
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
            </div>
        ) : (
            <p>Loading event...</p>
        )}
        </div>
    );
};

export default EventDetails;
