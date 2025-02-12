import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GetUser from "./GetUser";
import Navbar from "../../Navbar";

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
  const [showHosted, setShowHosted] = useState(true);
  const [showBooked, setShowBooked] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
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
        const response = await axios.get(
          `/api/getUserEvents?user_id=${userId}`
        );
        setUserEvents(response.data);
        setUserEventsLoading(true);

        if (response.data.length === 0) {
          setUserEvents(null);
        }
      }
      fetchUserEvents();
    } catch (e) {
      console.log(e);
    }
    try {
      async function fetchUserBookings() {
        const response = await axios.get(
          `/api/getUserBookings?user_id=${userId}`
        );
        setUserBookings(response.data);
        setUserBookingsLoading(true);

        if (response.data.length === 0) {
          setUserBookings(null);
        }
      }
      fetchUserBookings();
    } catch (e) {
      console.log(e);
    }
    try {
      async function fetchUserArchived() {
        const response = await axios.get(
          `/api/getUserArchived?user_id=${userId}`
        );
        setUserArchived(response.data);
        setUserArchivedLoading(true);

        if (response.data.length === 0) {
          setUserArchived(null);
        }
      }
      fetchUserArchived();
    } catch (e) {
      console.log(e);
    }
  }, [userId]);

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
      setSubmitLoading(false);

      if (response.data.success) {
        alert("Account updated successfully!");
        setSubmitLoading(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        console.log(response.data);
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
        setSubmitLoading(false);
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
    const response = await axios.post(`/api/deleteEvent`, { id: id });
    if (response.data.success) {
      alert("Event deleted successfully");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  const handleChooseEvent = (event) => {
    if (event == "hosted") {
      setShowHosted(true);
      setShowBooked(false);
      setShowArchived(false);
    }
    if (event == "booked") {
      setShowHosted(false);
      setShowBooked(true);
      setShowArchived(false);
    }
    if (event == "archived") {
      setShowHosted(false);
      setShowBooked(false);
      setShowArchived(true);
    }
  };

  if (!userLoading) return <div>Loading user details</div>;
  if (!userEventsLoading || !userBookingsLoading || !userArchivedLoading)
    return <div>Loading events and bookings</div>;
  return (
    <>
      <Navbar userJSON={userJSON} />
      <div className="flex flex-col items-center justify-center h-auto mt-8">
        <div className="border-8 border-gray-500 bg-gray-200 rounded-2xl w-[60%] h-fit flex-col flex items-center font-display">
          <h2 className="text-6xl text-bold">User Details</h2>
          <div className="relative">
            <div
              className={`group relative w-40 h-40 border-4 border-dashed border-gray-500 rounded-full transition-colors duration-300 bg-white ${
                !editMode ? "" : "hover:border-gray-400"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 disabled:cursor-default"
                disabled={!editMode}
              />
              {userJSON && (
                <img
                  src={`data:${userJSON.picType};base64,${userJSON.pic}`}
                  alt="PreviewLogo"
                  className={`w-full h-full object-cover rounded-full z-10 transition duration-300 ${
                    !editMode ? "" : "group-hover:opacity-10"
                  }`}
                />
              )}
              <div
                className={`flex flex-col items-center justify-center h-full opacity-0 transition-all duration-300 group-hover:opacity-100 z-20 -translate-y-40 ${
                  !editMode ? "hidden" : ""
                }`}
              >
                <i className="fa-solid fa-pencil text-black text-4xl"></i>
                <span className="mt-2 text-sm text-black">Upload Image</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="flex flex-col mt-4">
            <div className="flex">
              <div className="ml-12 text-2xl mt-2">
                <label>Username:</label>
                <br />
                <input
                  type="text"
                  value={userJSON.uname}
                  disabled
                  className="border-2 p-2 border-dashed border-gray-300 rounded-xl mt-4 disabled:text-neutral-500 transition duration-500 ease-in-out"
                />
              </div>
              <div className="ml-12 text-2xl mt-2">
                <label>Name:</label>
                <br />
                <input
                  type="text"
                  name="name"
                  value={userJSON.name}
                  onChange={handleInputChange}
                  required
                  disabled={!editMode}
                  className="border-2 p-2 border-dashed border-gray-300 rounded-xl mt-4 disabled:text-neutral-500 transition duration-500 ease-in-out"
                />
              </div>
            </div>
            <div className="self-center mt-2 ml-12 text-2xl">
              <label>Email:</label> <br />
              <input
                type="email"
                name="email"
                value={userJSON.email}
                onChange={handleInputChange}
                required
                disabled={!editMode}
                className="border-2 p-2 border-dashed border-gray-300 rounded-xl mt-4 disabled:text-neutral-500 transition duration-500 ease-in-out"
              />
            </div>
            <div className="flex">
              <div className="ml-12 text-2xl mt-2">
                <label>Password:</label>
                <br />
                <input
                  type="password"
                  name="password"
                  onChange={handleInputChange}
                  required
                  disabled={!editMode}
                  className="border-2 p-2 border-dashed border-gray-300 rounded-xl mt-4 disabled:text-neutral-500 transition duration-500 ease-in-out"
                />
              </div>

              <div className="ml-12 text-2xl mt-2">
                <label>Confirm Password:</label> <br />
                <input
                  type="password"
                  name="confirm_password"
                  onChange={handleInputChange}
                  required
                  disabled={!editMode}
                  className="border-2 p-2 border-dashed border-gray-300 rounded-xl mt-4 disabled:text-neutral-500 transition duration-500 ease-in-out"
                />
              </div>
            </div>
            <div className="relative self-center mt-5">
              <button
                type="submit"
                disabled={!editMode || submitLoading}
                className="bg-redishpink-100 w-28 h-12 relative z-10 transition duration-500 ease-in-out border-2 border-red-500 text-white active:translate-x-2 active:translate-y-2 hover:border-4 hover:border-red-600 disabled:bg-gray-500 disabled:border-gray-800"
              >
                Update
              </button>
              <div className="w-28 h-12 bg-black absolute top-2 left-2 z-0"></div>
            </div>
          </form>
          <div className="flex w-full justify-between">
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="self-start m-4 w-32 h-12 bg-neutral-300 rounded-lg border-2 border-gray-400 mt-4 transition duration-200 ease-in-out hover:border-gray-700 hover:bg-neutral-200 active:scale-95"
            >
              Edit details
            </button>
            <button
              onClick={handleDelete}
              disabled={submitLoading}
              className="self-end m-4 w-32 h-12 bg-red-500 rounded-lg text-white border-2 border-red-300 transition-colors duration-500 ease-in-out hover:bg-gray-300 hover:text-red-500 hover:border-red-500 active:scale-80"
            >
              Delete Account
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center w-[68%] min-h-[50vh] h-fit bg-gray-200 mt-2 border-gray-500 border-8 rounded-2xl mb-4">
          <div className="flex items-stretch w-full">
            <button
              className={`flex-1 text-center ${
                showHosted ? "bg-yellow-500" : "bg-yellow-600"
              } text-2xl p-4 hover:bg-yellow-500 rounded-tl-lg`}
              onClick={() => handleChooseEvent("hosted")}
            >
              Hosted events
            </button>
            <button
              className={`flex-1 text-center ${
                showBooked ? "bg-yellow-500" : "bg-yellow-600"
              } text-2xl p-4 hover:bg-yellow-500`}
              onClick={() => handleChooseEvent("booked")}
            >
              Booked events
            </button>
            <button
              className={`flex-1 text-center ${
                showArchived ? "bg-yellow-500" : "bg-yellow-600"
              } text-2xl p-4 hover:bg-yellow-500 rounded-tr-lg`}
              onClick={() => handleChooseEvent("archived")}
            >
              Archived events
            </button>
          </div>
          {showHosted && (
            <ul className="w-full p-4 flex flex-wrap gap-8">
              {userEvents ? (
                userEvents.map((event) => (
                  <Link
                    to={`/event/edit/${event.event_id}`}
                    key={event.event_id}
                  >
                    <li
                      key={event.event_id}
                      className="bg-gray-400 border-gray-500 w-80 h-96 rounded-lg border-8 p-2 shadow-xl shadow-black transition duration-200 ease-in-out hover:scale-105 hover:bg-gray-300 hover:border-gray-400"
                    >
                      <img
                        src={`data:${event.bannerType};base64,${event.banner}`}
                        alt={event.event_name}
                        className="h-28 rounded-md w-full"
                      />
                      <img
                        src={`data:${event.logoType};base64,${event.logo}`}
                        alt={event.event_name}
                        className="h-20 w-20 rounded-full translate-x-28 -translate-y-10"
                      />
                      <div className="flex flex-col items-center text-center space-y-2 -translate-y-8">
                        <strong className="font-bold">
                          {event.event_name}
                        </strong>
                        <span>(Created by {event.created_by_uid})</span>
                        <p className="max-w-prose max-h-40 overflow-hidden text-sm">
                          {event.description.length > 150
                            ? `${event.description.substring(0, 150)}...`
                            : event.description}
                        </p>
                        <small className="text-gray-600">
                          Created: {event.creation_date}, Due: {event.due_date}
                        </small>
                        <input
                          type="button"
                          value="Delete Event"
                          onClick={() => handleDeleteEvent(event.event_id)}
                          className=" text-white bg-red-500 transition duration-200 ease-in-out hover:text-black hover:bg-white border-red-700 border-2 w-fit rounded-md p-2"
                        />
                      </div>
                    </li>
                  </Link>
                ))
              ) : (
                <p className="text-2xl font-bold">No hosted events</p>
              )}
            </ul>
          )}

          {showBooked && (
            <ul className="w-full p-4 flex flex-wrap gap-8">
              {userBookings ? (
                userBookings.map((booking) => (
                  <Link to={`/event/${booking.event_id}`}>
                    <li
                      key={booking.event_id}
                      className="group bg-gray-400 border-gray-500 w-80 h-96 rounded-lg border-8 p-2 shadow-xl shadow-black transition duration-200 ease-in-out hover:scale-105 hover:bg-gray-300 hover:border-gray-400"
                    >
                      <img
                        src={`data:${booking.bannerType};base64,${booking.banner}`}
                        alt={booking.event_name}
                        className="h-28 rounded-md w-full"
                      />
                      <img
                        src={`data:${booking.logoType};base64,${booking.logo}`}
                        alt={booking.event_name}
                        className="h-20 w-20 rounded-full translate-x-28 -translate-y-10"
                      />
                      <div className="flex flex-col items-center text-center space-y-2 -translate-y-8">
                        <strong className="font-bold">
                          {booking.event_name}
                        </strong>
                        <p className="group-hover:bg-neutral-400 bg-neutral-300  p-2 w-fit rounded-md transition duration-200 ease-in-out">
                          Number of tickets: <strong>{booking.qty}</strong>
                        </p>
                        <p className="group-hover:bg-neutral-400 bg-neutral-300  p-2 w-fit rounded-md transition duration-200 ease-in-out">
                          Total price: <strong>₹{booking.cost}</strong>
                        </p>
                      </div>
                    </li>
                  </Link>
                ))
              ) : (
                <p className="text-2xl font-bold">No Events booked</p>
              )}
            </ul>
          )}
          {showArchived && (
            <ul className="w-full p-4 flex flex-wrap gap-8">
              {userArchived ? (
                userArchived.map((event) => (
                  <li
                    key={event.event_id}
                    className="group bg-gray-400 border-gray-500 w-80 h-96 rounded-lg border-8 p-2 shadow-xl shadow-black transition duration-200 ease-in-out hover:scale-105 hover:bg-gray-300 hover:border-gray-400"
                  >
                    <img
                      src={`data:${event.bannerType};base64,${event.banner}`}
                      alt={event.event_name}
                      className="h-28 rounded-md w-full"
                    />
                    <img
                      src={`data:${event.logoType};base64,${event.logo}`}
                      alt={event.event_name}
                      className="h-20 w-20 rounded-full translate-x-28 -translate-y-10"
                    />
                    <div className="flex flex-col items-center text-center space-y-2 -translate-y-8">
                      <strong className="font-bold">{event.event_name}</strong>
                      <p className="group-hover:bg-neutral-400 bg-neutral-300  p-2 w-fit rounded-md transition duration-200 ease-in-out">
                        Total tickets baught: <strong>{event.total_qty}</strong>
                      </p>
                      <p className="group-hover:bg-neutral-400 bg-neutral-300  p-2 w-fit rounded-md transition duration-200 ease-in-out">
                        Total earned: <strong>₹{event.total_cost}</strong>
                      </p>
                      <small className="text-gray-600">
                        Created: {event.creation_date}, Due: {event.due_date}
                      </small>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-2xl font-bold">No Archived Events</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetails;
