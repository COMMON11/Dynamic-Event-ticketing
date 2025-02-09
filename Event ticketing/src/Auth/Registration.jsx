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
    <div>
      <Link to={"/"}><input type="button" value={"Home"} /></Link>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        
          <label>Username:</label>
          <input
            type="text"
            name="uname"
            value={formData.uname}
            onChange={handleChange}
            required
          />
        
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        <button type="submit" disabled={submitLoading}>Register</button>
      </form>
      {message && <p>{message}</p>}
      <p>Already have an account? <Link to={"/login"}>Login</Link></p>
    </div>
  );
};

export default Registration;
