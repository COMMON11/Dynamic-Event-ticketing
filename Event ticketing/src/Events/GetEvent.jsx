import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
import GetUser from '../Auth/GetUser';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [maxBookings, setMaxBookings] = useState(null);
    const [error, setError] = useState("");
    const userDetails = localStorage.getItem("userDetails");
    const [userJSON, setUserJSON] = useState(null);
    const [message, setMessage] = useState("")
    const [disableBooking, setdisableBooking] = useState(false);
    const [bookingChecked, setBookingChecked] = useState(false);
    const [buttonText, setButtonText] = useState("Book ticket(s)")
    // const [existingUser, setExistingUser] = useState(false);

    const navigate = useNavigate();

    const userId = Cookies.get("id");
    const [params, setParams] = useState({
        existing: false,
        user_id: userId,
        event_id: id,
        quantity: 1,
    });
    
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
        const quantity = parseInt(e.target.value);
        setParams({
            ...params,
            quantity: quantity,
            cost: quantity * (event?.price || 0)
        });
    };

    //fetch event
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await axios.get(`/api/getEventById?event_id=${id}&user_id=${userId}`);
                if (response.data.success) {
                    setEvent(response.data);
                    setParams({
                        ...params,
                        cost: response.data.cost,
                        availSlots: response.data.availSlots
                    });
                    
                    // After getting event details, check user booking
                    const bookingResponse = await axios.get(
                        `/api/checkUserBooking?user_id=${userId}&maxBookings=${response.data.maxBookings}&event_id=${id}`
                    );
                    
                    if (bookingResponse.data.success) {
                        setMaxBookings(bookingResponse.data.maxBookings);
                        if (bookingResponse.data.maxBookings > params.availSlots) setMaxBookings(response.data.availSlots)
                        setParams({...params, existing: bookingResponse.data.Booked});
                        if (bookingResponse.data.maxBookings <= 0) {
                            setdisableBooking(true);
                            setMaxBookings(1);
                            setButtonText("Max Bookings Made");
                        }

                    } else {
                        setError(bookingResponse.data.message);
                    }
                    setBookingChecked(true);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError("An error occurred while fetching the event details.");
                console.log(error)
            }
        };

        fetchEventDetails();
    }, [id, userId]);

    //Book tickets
    const handleBookTicket = async () => {
        setParams({cost: params.quantity * event.price, ...params})
        console.log(params)
        const response = await axios.post('/api/book', params)

        if (response.data.success) {
            setMessage("Ticket booked successfully")
            setTimeout(() => {
            window.location.reload();
            },2000);
        } else {
            alert(response.data.message);
        }
    };

    // if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!bookingChecked) return <div>Checking booking details...</div>;

    return (
        <div>
        {error ? (
            <p>{error}</p>
        ) : event ? (
            <div>
                {message && <p>{message}</p>}
                <select onChange={handleChange} name="quantity" id="quantity" disabled={disableBooking}>
                    {[...Array(maxBookings)].map((_, index) => (
                        <option key={index + 1} value={index + 1}>
                        {index + 1}
                        </option>
                    ))}
                </select>    
                <p>Cost: {params?.cost}</p>            
                <input type="button" value={buttonText} onClick={handleBookTicket} disabled={disableBooking} />
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
