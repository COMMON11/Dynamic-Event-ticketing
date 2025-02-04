import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import bcrypt from "bcryptjs";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a JSON object with user details
    const userDetails = {
      uname: username,
      password: password,
    };

    try {
      
      // Send the JSON object as part of the POST request
      const response = await axios.post("/api/login", userDetails);

      if (response.data.success) {
        setMessage(response.data.message);
        Cookies.set("id", response.data.id, { expires: 30 });
        const user = {
          uname: response.data.uname,
          name: response.data.name,
          email: response.data.email,
          pic: response.data.pic,
          picType: response.data.pic_type,
        }
        localStorage.setItem("userDetails", JSON.stringify(user))
        setTimeout(() => {
          navigate("/");
        }, 2000);
        // Redirect or perform other actions on successful login
      } else {
        setMessage("Invalid credentials, please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div>
      <Link to={"/"}><input type="button" value={"Home"} /></Link>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <p>New here? <Link to={"/register"}>Register</Link></p>
    </div>
  );
};

export default Login;