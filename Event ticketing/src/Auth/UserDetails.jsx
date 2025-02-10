import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GetUser from './GetUser';
import bcrypt from "bcryptjs";

const UserDetails = () => {
    const navigate = useNavigate();
    const [userJSON, setUserJSON] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [userLoading, setUserLoading] = useState(false);
    const [userEvents, setUserEvents] = useState(null);
    const [userBookings, setUserBookings] = useState(null);
    const [userArchived, setUserArchived] = useState(null);
    const [userEventsLoading, setUserEventsLoading] = useState(false);
    const [userBookingsLoading, setUserBookingsLoading] = useState(false);
    const [userArchivedLoading, setUserArchivedLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const userId = Cookies.get("id");
    // Check user login
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
    
    // fetch events, bookings, archives
    useEffect(() => {
      try {
        async function fetchUserEvents() {
        const response = await axios.get(`/api/getUserEvents?user_id=${userId}`)
          setUserEvents(response.data);
          setUserEventsLoading(true);
      }
      fetchUserEvents();
      } catch (e) {
        console.log(e)
      }
      try {
        async function fetchUserBookings() {
        const response = await axios.get(`/api/getUserBookings?user_id=${userId}`)
          setUserBookings(response.data);
          setUserBookingsLoading(true);
        }
        fetchUserBookings();
      } catch (e) {
        console.log(e);
      }
      try {
        async function fetchUserArchived() {
        const response = await axios.get(`/api/getUserArchived?user_id=${userId}`)
          setUserArchived(response.data);
          setUserArchivedLoading(true);
          console.log(response.data);
        }
        fetchUserArchived();
      } catch (e) {
        console.log(e);
      }
    },[userId])

    // Handle input for user details
    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserJSON({ ...userJSON, [name]: value });
    };

  // Convert image to Base64
    const handleImageUpload = (event) => {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
          // Extract only Base64 data
        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; 
          setUserJSON({ ...userJSON, pic: base64String, picType: file.type });
          // setProfilePic(base64String);
        };

        reader.onerror = (error) => {
          console.error("Error converting image to Base64:", error);
        };
      }
    };

    // Update user data
    const handleUpdate = async (e) => {
      setSubmitLoading(true);
      e.preventDefault();
      try {
          const response = await axios.put(`/api/userUpdate`, {
              id: userId,
              ...userJSON,
          });
          setSubmitLoading(false)
  
          if (response.data.success) {
              alert("Account updated successfully!");
              setSubmitLoading(true)
              setTimeout(() => {
                  navigate("/");
              },2000);
          } else {
              console.log(response.data );
              alert("Failed to update account.");
          }
      } catch (error) {
          console.error("Error updating account:", error);
          alert("An error occurred while updating the account.");
      } finally {
          // Clear password fields
          setUserJSON((prevState) => ({
              ...prevState,
              password: "",
              confirm_password: "",
          }));
      }
  };
    
    // delete user
    const handleDelete = async () => {
      setSubmitLoading(true);
        if (window.confirm("Are you sure you want to delete your account?")) {
        try {
            const response = await axios.post(`/api/deleteUser`, { id: userId });
          setSubmitLoading(false)
        if (response.data.success) {
            alert("Account deleted successfully!");
            setSubmitLoading(true);
            // Clear cookies and localStorage
            Cookies.remove("id");
            setTimeout(() => {  
            navigate("/"); // Redirect to home or login page
            }, 2000);
            } else {
            alert("Failed to delete account.");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting the account.");
        }
      }
    };
    
    // delete event
    const handleDeleteEvent = async (id) => {
      const response = await axios.post(`/api/deleteEvent`, {id: id});
      if (response.data.success) {
        alert("Event deleted successfully")
        setTimeout(() => {
          window.location.reload();
        }, 2000)
        
      }
    }


    if (!userLoading) return <div>Loading user details</div>
    if (!userEventsLoading || !userBookingsLoading || !userArchivedLoading) return <div>Loading events and bookings</div>
  return (
    <div className="border-8 border-gray-500 bg-gray-200 rounded-2xl w-[80%] h-fit flex-col flex items-center font-display">
      <h2 className="text-6xl text-bold">User Details</h2>
      <div className="relative">
            <div className="group relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-full hover:border-gray-400 transition-colors duration-300 bg-white">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                />
                {userJSON &&
                    <img
                        src={`data:${userJSON.picType};base64,${userJSON.pic}`}
                        alt="PreviewLogo"
                        className="w-full h-full object-cover rounded-full z-10 transition duration-300 group-hover:opacity-10"
                    />
                  }
                    <div className="flex flex-col items-center justify-center h-full opacity-0 transition-all duration-300 group-hover:opacity-100 z-20 -translate-y-40">
                    <i className="fa-solid fa-pencil text-black text-4xl"></i>
                    <span className="mt-2 text-sm text-black">Upload Image</span>
                    </div>
                </div>
            </div>
      {/* <img src={`data:${userJSON.picType};base64,${userJSON.pic}`} alt="Profile Pic" className=""/> */}
      <form onSubmit={handleUpdate}>
        <div>
          <label>Username:</label>
          <input type="text" value={userJSON.uname} disabled />
        </div>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={userJSON.name}
            onChange={handleInputChange}
            required
            disabled={!editMode}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={userJSON.email}
            onChange={handleInputChange}
            required
            disabled={!editMode}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            onChange={handleInputChange}
            required
            disabled={!editMode}
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            name="confirm_password"
            onChange={handleInputChange}
            required
            disabled={!editMode}
          />
        </div>
        <button type="submit" disabled={!editMode || submitLoading}>Update</button>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </form>
      <button onClick={() => setEditMode(!editMode)} style={{ marginTop: "1rem" }}>Edit details</button>
      <button onClick={handleDelete} style={{ marginTop: "1rem", color: "red" }} disabled={submitLoading}>
        Delete Account
      </button>

      <div>Hosted events:</div>
      <ul>
        {userEvents && userEvents.map(event => (
          <li key={event.event_id}>
            <input type="button" value="Delete Event" onClick={() => handleDeleteEvent(event.event_id)} />
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

      <div>Booked Events:</div>
      <ul>
        {userBookings && userBookings.map(booking => (
          <li key={booking.event_id}>
            <Link to={`/event/${booking.event_id}`}>{booking.event_id}</Link>
            <strong>{booking.event_name}</strong>
            <p>Quantity: </p> {booking.qty}
            <p>Cost: </p> {booking.cost}
            <p>Logo:</p>
            <img src={`data:${booking.logoType};base64,${booking.logo}`} alt={event.event_name} />
            <p>Banner:</p>
            <img src={`data:${booking.bannerType};base64,${booking.banner}`} alt={event.event_name} />
          </li>
        ))}
      </ul>
      <div>Archived Events:</div>
      <ul>
        {userArchived && userArchived.map(event => (
          <li key={event.event_id}>
            {/* <input type="button" value="Delete Event" onClick={() => handleDeleteEvent(event.event_id)} /> */}
            <Link to={`/event/${event.event_id}`}>{event.event_id}</Link>
            <strong>{event.event_name}</strong> (Created by {event.created_by_uid})  
            <p>{event.description}</p>
            <small>Created: {event.creation_date}, Due: {event.due_date}</small>
            <p>Total Quantity: {event.total_qty}</p>
            <p>Total Cost: {event.total_cost}</p>
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

export default UserDetails;
