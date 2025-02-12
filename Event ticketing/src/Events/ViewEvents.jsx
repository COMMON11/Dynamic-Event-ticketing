import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import GetUser from "../Auth/GetUser";
import Navbar from "../../Navbar";
export default function ViewEvents() {
  const [events, setEvents] = useState([]);
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
        console.log(user);
        if (user) {
          setUserJSON(user);
          setUserLoading(true);
        }
      }
      getUser();
    }
  }, [userId, navigate]);

  function fetchEvents() {
    axios
      .get("/api/getAllEvents")
      .then((response) => {
        const sortedEvents = JSON.parse(response.data.result).sort(
          (a, b) => new Date(b.creation_date) - new Date(a.creation_date)
        );
        setEvents(sortedEvents);
        setEventLoading(true);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }

  useEffect(() => {
    fetchEvents();
    setInterval(() => {
      fetchEvents();
    }, 1000 * 10);
  }, []);

  if (!eventLoading) return <div>Loading events...</div>;
  if (!userLoading) return <div>Loading user...</div>;

  return (
    <>
      <Navbar userJSON={userJSON} />
      <div className="font-display flex-col flex items-center mt-10">
        <div className="w-[68%] bg-gray-300 border-gray-500 border-8 rounded-2xl">
          <h2 className="text-7xl text-bold text-center">All Events</h2>
          <ul className="w-full p-4 flex flex-wrap gap-8">
            {events &&
              events.map((event) => (
                <Link to={`/event/${event.event_id}`}>
                  <li
                    key={event.event_id}
                    className="bg-gray-400 border-gray-500 w-80 h-96 rounded-lg border-8 p-2 shadow-xl shadow-black transition duration-200 ease-in-out hover:scale-105 hover:bg-gray-300 hover:border-gray-400"
                  >
                    <img
                      src={`data:${event.BannerType};base64,${event.Banner}`}
                      alt={event.event_name}
                      className="h-28 rounded-md w-full"
                    />
                    <img
                      src={`data:${event.LogoType};base64,${event.Logo}`}
                      alt={event.event_name}
                      className="h-20 w-20 rounded-full translate-x-28 -translate-y-10"
                    />
                    <div className="flex flex-col items-center text-center space-y-2 -translate-y-8">
                      <strong className="font-bold">{event.event_name}</strong>
                      <span>(Created by {event.created_by_uid})</span>
                      <p className="max-w-prose max-h-40 overflow-hidden text-sm">
                        {event.description.length > 150
                          ? `${event.description.substring(0, 150)}...`
                          : event.description}
                      </p>
                      <small className="text-gray-600">
                        Created: {event.creation_date}, Due: {event.due_date}
                      </small>
                    </div>
                  </li>
                </Link>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
