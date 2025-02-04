import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

export default function ViewEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/getAllEvents")
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("Error fetching events:", error);
      });
  }, []);

  return (
    <div>
      <h2>All Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.event_id}>
            <Link to={`/event/${event.event_id}`}>{event.event_id}</Link>
            <strong>{event.event_name}</strong> (Created by {event.created_by_uid})  
            <p>{event.description}</p>
            <small>Created: {event.creation_date}, Due: {event.due_date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};


