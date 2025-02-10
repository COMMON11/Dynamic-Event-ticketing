import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from "axios";
// import path from 'path';
import GetUser from '../Auth/GetUser';
import defaultLogo from '../../../web/Images/Default Event Logo.png'
import defaultBanner from '../../../web/Images/Default Event banner.jpg';

export default function CreateEvent() {
    const [userJSON, setUserJSON] = useState(null);
    const navigate = useNavigate();
    const userId = Cookies.get("id");
    const [userLoading, setUserLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [previewLogo, setPreviewLogo] = useState(null);
    const [previewBanner, setPreviewBanner] = useState(null);
    const textareaRef = useRef(null);
    const [messageStyle, setMessageStyle] = useState(null);

    useEffect(() => {
        try {
            setPreviewLogo(defaultLogo);
            setPreviewBanner(defaultBanner);
        } catch (error) {
            console.error('Error loading default logo:', error);
        }
    }, []);

    useEffect(() => {
        // Redirect to login if userId is not set
        if (!userId) {
            window.localStorage.clear();
            navigate("/login");
        } else {
            // Fetch user details from the server
            async function getUser() {
                const user = await GetUser(userId);
                setUserJSON(user);
                setUserLoading(true);
            }
            getUser();
        }
    }, [userId, navigate]);

    const [eventData, setEventData] = useState({
        created_by_uid: "",
        event_name: "",
        description: "",
        creation_date: "",
        due_date: "",
        logo: "",
        logoType: "",
        banner: "",
        bannerType: "",
        availSlots: "",
        maxBookings: "",
        price: "",
    });

    const [message, setMessage] = useState("");

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (value < 0) return;
        setEventData({ ...eventData, [name]: value });
    };

      // Convert logo image to Base64
    const handleLogoImageUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
            // Extract only Base64 data
        reader.onload = () => {
            const base64String = reader.result.split(",")[1]; 
            setEventData({ ...eventData, logo: base64String, logoType: file.type });
            // setProfilePic(base64String);
        };

        reader.onerror = (error) => {
            console.error("Error converting image to Base64:", error);
        };
        }
    };

    // Convert banner image to Base64
    const handleBannerImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
        // Extract only Base64 data
    reader.onload = () => {
        const base64String = reader.result.split(",")[1]; 
        setEventData({ ...eventData, banner: base64String, bannerType: file.type });
        console.log(eventData);
    };

    reader.onerror = (error) => {
        console.error("Error converting image to Base64:", error);
    };
    }
};

  // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        eventData.created_by_uid = userId; 
        setSubmitLoading(true);
        try {
        const response = await axios.post("/api/createEvent", eventData, {
            headers: { "Content-Type": "application/json" },
        });
        setSubmitLoading(false);

        if (response.data.success) {
            setMessage(response.data.message);
            setMessageStyle("text-green-500")
            setSubmitLoading(true);
            setEventData({ created_by_uid: "", event_name: "", description: "", creation_date: "", due_date: "", availSlots:"", maxBookings: "",price: "",});
            setTimeout(() => {
                navigate("/EventList");
            },2000)
        } else {
            setMessageStyle("text-red-500")
            setMessage(response.data.message);
        }
        } catch (error) {
        console.error("Error creating event:", error);
        setMessageStyle("text-red-500")
        setMessage("An error occurred while creating the event.", error);
        }
    };

    const handleLogoImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewLogo(reader.result);
            };
        }
    };

    const handleBannerImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewBanner(reader.result);
            };
        }
    };

    const handleTextareaChange = (e) => {
        handleChange(e);
        // Reset height to auto to get the correct scrollHeight
        textareaRef.current.style.height = 'auto';
        // Set the height to scrollHeight to fit the content
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 4}px`;
    };

    if (!userLoading) return <div>User details loading</div>

    
    return (
        <div className='h-screen w-full bg-redishpink-100 font-display flex flex-col items-center'>
        <h2 className='text-center font-bold text-6xl'>Create Event</h2>
        <form onSubmit={handleSubmit} className='w-[70%] bg-gray-100 border-4 border-gray-400 rounded-2xl'>

            <div className="relative">
                <div className="group relative w-full h-72 border-2 border-dashed border-gray-300 rounded-2xl hover:border-gray-400 transition-colors duration-300">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {handleBannerImageChange(e); handleBannerImageUpload(e)}}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {previewBanner &&
                        <img
                            src={previewBanner}
                            alt="PreviewLogo"
                            className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:opacity-30 z-0"
                        />
                    }
                        <div className="flex flex-col items-center justify-center h-full opacity-0 transition-all duration-300 group-hover:opacity-100 -translate-y-72">
                        <i className="fa-solid fa-pencil text-black text-4xl"></i>
                        <span className="mt-2 text-sm text-black">Upload Image</span>
                    </div>

                </div>
            </div>

            <div className="relative">
            <div className="group relative w-40 h-40 border-2 -translate-y-20 translate-x-12 border-dashed border-gray-300 rounded-full hover:border-gray-400 transition-colors duration-300 bg-white">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {handleLogoImageChange(e); handleLogoImageUpload(e);}}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                />
                {previewLogo  && 
                    <img
                        src={previewLogo}
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

            <div>
                <input type="text" name="event_name" value={eventData.event_name} placeholder={"Enter Event Name"}onChange={handleChange} required className='text-4xl p-2 ml-12 -translate-y-16 h-14 border-2 border-dashed rounded-2xl border-gray-300 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none' />
            </div>

            <div className='ml-12 -translate-y-12 mr-12 w-auto'>
                <label className='text-3xl '>About this event:</label><br/>
                <textarea ref={textareaRef} name="description" value={eventData.description} placeholder='Enter Event Description...'  onChange={(e) => {handleChange(e); handleTextareaChange(e)} } required className='resize-none border-2 w-full min-h-64 text-xl p-2 rounded-2xl border-dashed border-gray-300 hover:bg-gray-200 focus:bg-gray-200 focus:outline-none' />
            </div>

            <div className='ml-12 -translate-y-4 space-y-6 flex flex-col justify-center'>
                <div className='flex justify-between w-[90%]'>
                    <div>
                        <label className='text-xl block mb-2'>Due Date:</label>
                        <input 
                            type="date" 
                            name="due_date" 
                            value={eventData.due_date} 
                            onChange={handleChange} 
                            required 
                            className='text-xl p-2 rounded-2xl border-2 border-dashed border-gray-300 
                                    hover:bg-gray-200 hover:border-gray-400
                                    focus:bg-gray-200 focus:border-gray-400 focus:outline-none
                                    transition-all duration-200'
                        />
                    </div>


                    <div>
                        <label className='text-xl block mb-2'>Number of Available Tickets:</label>
                        <input 
                            type="number" 
                            name="availSlots" 
                            value={eventData.availSlots} 
                            onChange={handleChange} 
                            placeholder='Enter Available Tickets'
                            required 
                            className='text-xl p-2 rounded-2xl border-2 border-dashed border-gray-300 
                                    hover:bg-gray-200 hover:border-gray-400
                                    focus:bg-gray-200 focus:border-gray-400 focus:outline-none
                                    transition-all duration-200'
                        />
                    </div>
                </div>

                <div className='flex justify-between w-[90%]'>
                
                    <div>
                        <label className='text-xl block mb-2'>Maximum Number of Bookings per User:</label>
                        <input 
                            type="number" 
                            name="maxBookings" 
                            value={eventData.maxBookings} 
                            onChange={handleChange} 
                            placeholder='Enter Max Bookings'
                            required 
                            className='text-xl p-2 rounded-2xl border-2 border-dashed border-gray-300 
                                    hover:bg-gray-200 hover:border-gray-400
                                    focus:bg-gray-200 focus:border-gray-400 focus:outline-none
                                    transition-all duration-200'
                        />
                    </div>
                    
                    <div>
                        <label className='text-xl block mb-2'>Price per Ticket:</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={eventData.price} 
                            onChange={handleChange} 
                            required 
                            placeholder='Enter Price'
                            className='text-xl p-2 -translate-x-2 rounded-2xl border-2 border-dashed border-gray-300 
                                    hover:bg-gray-200 hover:border-gray-400
                                    focus:bg-gray-200 focus:border-gray-400 focus:outline-none
                                    transition-all duration-200'
                        />
                    </div>
                </div>
            </div>

            {message && <p className={`${messageStyle} font-bold text-lg text-center mt-8`}>{message}</p>}

            <div className="flex justify-center mt-4 -ml-12 mb-4">
                <div className="relative">  
                    <button 
                        type="submit" 
                        disabled={submitLoading} 
                        className="bg-redishpink-100 w-28 h-12 relative z-10 transition duration-75 ease-in-out border-2 border-red-500 text-white active:translate-x-2 active:translate-y-2 hover:border-4 hover:border-red-600 disabled:bg-gray-500 disabled:border-gray-800"
                    >
                        Create Event
                    </button>
                    <div className='w-28 h-12 bg-black absolute top-2 left-2 z-0'></div>
                </div>
            </div>
        </form>
        </div>
    );
}
