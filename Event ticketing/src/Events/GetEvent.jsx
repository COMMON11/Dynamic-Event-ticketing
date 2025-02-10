import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
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
    const [enableEdit , setEnableEdit] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [messageStyle, setMessageStyle] = useState(null);
    // const [existingUser, setExistingUser] = useState(false);

    const navigate = useNavigate();

    const userId = Cookies.get("id");
    const [params, setParams] = useState({
        existing: false,
        user_id: userId,
        event_id: id,
        quantity: 1,
        cost: event?.price || 0
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
                        cost: params.quantity * response.data.price,
                        availSlots: response.data.availSlots
                    });
                    if (response.data.Author) {
                        setdisableBooking(true);
                        setMessage("You're the Author");
                        setEnableEdit(true);
                    }
                    if (response.data.availSlots.length <= 0) {
                        setdisableBooking(true);
                        setMessage("Event full!");
                        setMessageStyle("text-red-500")
                    }
                    
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
                            setMessage("Max Bookings Made");
                            setMessageStyle("text-red-500")
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
        setSubmitLoading(true);
        setParams({cost: params.quantity * event.price, ...params})
        console.log(params)
        const response = await axios.post('/api/book', params)
        setSubmitLoading(false);
        if (response.data.success) {
            setMessage("Ticket booked successfully")
            setSubmitLoading(true);
            setMessageStyle("text-green-500");
            setTimeout(() => {
            window.location.reload();
            },2000);
        } else {
            setMessageStyle("text-red-500");
            setMessage(response.data.message);
        }
    };

    // if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!bookingChecked) return <div>Checking booking details...</div>;

    return (
        <>
        <div className="font-display flex flex-col items-center">
            <div className="w-[70%] bg-gray-100 border-4 border-gray-400 rounded-2xl min-h-screen">
                <img src={`data:${event.bannerType};base64,${event.banner}`} alt={event.event_name} className="w-full h-72 rounded-t-xl border-4 border-gray-400"/>
                <img src={`data:${event.logoType};base64,${event.logo}`} alt={event.event_name}  className="inset-0 w-40 h-40 rounded-full border-8 border-gray-400 -translate-y-20 translate-x-12"/>
                <h2 className="text-4xl ml-12 -translate-y-16 h-14 rounded-2xl font-bold">{event.event_name}</h2>
                <div className='ml-12 -translate-y-12 mr-12 w-auto'>
                    <label className='text-3xl '>About this event:</label><br/>
                    <p className="rounded-xl bg-gray-300 p-2">{event.description}</p>
                </div>
                <div className="-translate-y-6 flex w-full justify-between">
                    <p className="ml-12 border-black border-dashed border-2 rounded-xl p-2 w-fit text-2xl">Due: {event.due_date}</p>
                    <p className="text-2xl mr-12 p-2">Created: {event.creation_date} </p>
                </div>
            </div>
        </div>
        <footer className="font-display fixed bottom-0 left-0 right-0 w-full bg-white border-t-8 border-gray-400 flex-col min-h-16 p-2">
            {message && <p className={`${messageStyle} font-bold text-lg text-center mt-2 mb-2`}>{message}</p>}
            <div className="flex items-center justify-center">
            <p className="font-bold mr-4 border-dashed borde-2">Total Price: ₹{params.cost}</p>
            <div className="flex rounded-xl bg-gray-300 text-lg p-2 justify-center items-center text-center mr-4">
                <p className="">Qty:</p>
                <select onChange={handleChange} name="quantity" id="quantity" disabled={disableBooking} className="bg-gray-300 focus:outline-none">
                    {[...Array(maxBookings+1)].map((_, index) => (
                        <option key={index} value={index}>
                        {index}
                        </option>
                    ))}
                </select>
            </div>    
                <div className="flex justify-center">
                    <div className="relative">              
                        <input type="button" value={buttonText} onClick={handleBookTicket} disabled={disableBooking || submitLoading} className="bg-redishpink-100 w-32 h-12 relative z-10 transition duration-75 ease-in-out border-2 border-red-500 text-white active:translate-x-2 active:translate-y-2 hover:border-4 hover:border-red-600 disabled:bg-gray-500 disabled:border-gray-800"/>
                        <div className='w-32 h-12 bg-black absolute top-2 left-2 z-0'></div>
                    </div>
                </div>
            </div>
                <div className="w-full flex justify-center">
                {enableEdit && <Link to={`/event/edit/${event.event_id}`}><input type="button" value="Edit event" className="bg-gray-500 p-2 rounded-lg text-white border-2 border-gray-400 transistion duration-200 ease-in-out hover:border-4 hover:border-gray-700"/></Link>}
                </div>
                </footer>
        </>
    );
};

export default EventDetails;
