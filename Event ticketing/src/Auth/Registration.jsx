import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import bcrypt from "bcryptjs";
const Registration = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    uname: "",
    name: "",
    password: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      formData.password = bcrypt.hashSync(formData.password, 10);
      const response = await axios.post("/api/register", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setSubmitLoading(false);
      if (response.data.sucess) {
        setMessage(response.data.message);
        setSubmitLoading(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("An error occurred during registration.");
    }
  };

  return (
    <div className="flex flex-row w-screen h-screen items-center justify-center bg-redishpink-100">
      <div className="bg-gray-100 h-[60 rem] w-[30rem] border-8 border-gray-300 rounded-2xl">
      <h2 className="font-display font-bold text-5xl text-center mt-6">Register</h2>
      <form onSubmit={handleSubmit} className="ml-12 mt-12 font-display text-xl">
        
          <label>Username:</label><br/>
          <input
            type="text"
            name="uname"
            value={formData.uname}
            onChange={handleChange}
            placeholder="Enter username"
            className="bg-gray-300 my-4 p-2 rounded-[0.5rem] w-[90%] transition duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-200"
            required
          /><br/>
        
          <label>Name:</label><br/>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Name"
            className="bg-gray-300 my-4 p-2 rounded-[0.5rem] w-[90%] transition duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-200"
            required
          /><br/>
          <label>Email:</label> <br/>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            className="bg-gray-300 my-4 p-2 rounded-[0.5rem] w-[90%] transition duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-200"
            required
          /><br/>
          <label>Password:</label> <br/>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter Password"
            className="bg-gray-300 my-4 p-2 rounded-[0.5rem] w-[90%] transition duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-200"
            required
          /> <br/>
            <div className="flex justify-center mt-4 -ml-12">
                <div className="relative">  
                    <button 
                        type="submit" 
                        disabled={submitLoading} 
                        className="bg-gray-300 w-28 h-12 relative z-10 transition duration-75 ease-in-out border-2 border-gray-400 active:translate-x-2 active:translate-y-2 hover:border-4 hover:border-gray-500"
                    >
                        Register
                    </button>
                    <div className='w-28 h-12 bg-black absolute top-2 left-2 z-0'></div>
                </div>
            </div>
      </form>
      {message && <p>{message}</p>}
      <p className="text-center mt-12 font-bold font-display text-lg mb-2">Already have an account? <Link to={"/login"} className="text-blue-400 underline">Login</Link></p>
    </div>
    </div>
  );
};

export default Registration;
