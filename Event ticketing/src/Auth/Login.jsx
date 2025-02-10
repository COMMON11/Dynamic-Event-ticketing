import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import bcrypt from "bcryptjs";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [messageStyle, setMessageStyle] = useState(null)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Create a JSON object with user details
    const userDetails = {
      uname: username,
      password: password,
    };

    try {
      
      // Send the JSON object as part of the POST request
      const response = await axios.post("/api/login", userDetails);
      setSubmitLoading(false)
      if (response.data.success) {
        setSubmitLoading(true)
        setMessageStyle("text-green-500")
        setMessage(response.data.message);
        Cookies.set("id", response.data.id, { expires: 30 });
        setTimeout(() => {
          navigate("/");
        }, 2000);
        // Redirect or perform other actions on successful login
      } else {
        setMessageStyle("text-red-500");
        setMessage("Invalid credentials, please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessageStyle("text-red-500");
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-row w-screen h-screen items-center justify-center bg-redishpink-100 font-display">
      <div className="bg-gray-100 h-[36 rem] w-[30rem] border-8 border-gray-300 rounded-2xl">
        <h2 className="font-display font-bold text-5xl text-center mt-6">Login</h2>
        <form onSubmit={handleSubmit} className="ml-12 mt-12 font-display text-xl">
            <label className="">Username:</label><br/>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-gray-300 my-4 p-2 rounded-[0.5rem] w-[90%] transition duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-200"
              required
            /> <br/>
            <label>Password:</label><br/>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-gray-300 my-4 p-2 rounded-[0.5rem] w-[90%] transition duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-200"
              required
            /><br/>
            <div className="flex justify-center mt-4 -ml-12">
            <div className="relative">  
                    <button 
                        type="submit" 
                        disabled={submitLoading} 
                        className="bg-redishpink-100 w-28 h-12 relative z-10 transition duration-75 ease-in-out border-2 border-red-500 text-white active:translate-x-2 active:translate-y-2 hover:border-4 hover:border-red-600 disabled:bg-gray-500 disabled:border-gray-800"
                    >
                        Login
                    </button>
                    <div className='w-28 h-12 bg-black absolute top-2 left-2 z-0'></div>
                </div>
            </div>
        </form>
        {message && <p className={`${messageStyle} font-bold text-lg text-center mt-8`}>{message}</p>}
        <p className="text-center mt-12 font-bold font-display text-lg mb-2">New here? <Link to={"/register"} className="text-blue-400 underline">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;