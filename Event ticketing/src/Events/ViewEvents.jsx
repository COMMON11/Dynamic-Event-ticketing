import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import GetUser from '../Auth/GetUser';
export default function ViewEvents() {
  const [events, setEvents] = useState([]);
  const userDetails = localStorage.getItem("userDetails");
  const [userJSON, setUserJSON] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
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
                setUserLoading(true);
            }
          }
          getUser();
      }
  }, [userId, navigate]);

  useEffect(() => {
    axios.get("/api/getAllEvents")
      .then(response => {
        setEvents(response.data);
        setEventLoading(true);
      })
      .catch(error => {
        console.error("Error fetching events:", error);
      });
  }, []);

  if (!eventLoading) return <div>Loading events...</div>
  if (!userLoading) return <div>Loading user...</div>

  return (
    <div>
      <h2>All Events</h2>
      <ul>
        {events && events.map(event => (
          <li key={event.event_id}>
            <Link to={`/event/${event.event_id}`}>{event.event_id}</Link>
            <strong>{event.event_name}</strong> (Created by {event.created_by_uid})  
            <p>{event.description}</p>
            <small>Created: {event.creation_date}, Due: {event.due_date}</small>
            <p>Logo:</p>
            <img src={`data:${event.logoType};base64,${event.logo}`} alt={event.event_name} />
            <p>Banner:</p>
            <img src={`data:${event.bannerType};base64,${event.banner}`} alt={event.event_name} />
          </li>
        ))}
      </ul>
    </div>
  );
};


