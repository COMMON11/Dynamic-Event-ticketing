import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

const UserDetails = () => {
    const [profilePic, setProfilePic] = useState(null);
    const navigate = useNavigate();
    const userDetails = localStorage.getItem("userDetails");
    const [userJSON, setUserJSON] = useState(JSON.parse(userDetails));
    const [editMode, setEditMode] = useState(false);


    useEffect(() => {
      setProfilePic(userJSON.pic);
    },[profilePic])

    const userId = Cookies.get("id");

    useEffect(() => {
      if (!userId) {
        navigate("/login"); // Redirect to login if not authenticated
      }
    }, [userId]);

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserJSON({ ...userJSON, [name]: value });
    };

    const handleUpdate = async (e) => {
      e.preventDefault();
      try {
          const response = await axios.put(`/api/userUpdate`, {
              id: userId,
              ...userJSON,
          });
  
          if (response.data.success) {
              alert("Account updated successfully!");
              // Optionally update localStorage with the new details
              localStorage.setItem("userDetails", JSON.stringify(userJSON));
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
    

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete your account?")) {
        try {
            const response = await axios.post(`/api/deleteUser`, { id: userId });

        if (response.data.success) {
            alert("Account deleted successfully!");
            // Clear cookies and localStorage
            Cookies.remove("id");
            localStorage.clear();
            navigate("/"); // Redirect to home or login page
            } else {
            alert("Failed to delete account.");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting the account.");
        }
    }
};

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "1rem" }}>
      <h2>User Details</h2>
      {profilePic && <img src={`data:image/jpeg;base64,${profilePic}`} alt="Profile Pic" style={{ width: "150px", height: "150px", borderRadius: "50%" }} />}
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
        <button type="submit" disabled={!editMode}>Update</button>
      </form>
      <button onClick={() => setEditMode(!editMode)} style={{ marginTop: "1rem" }}>Edit details</button>
      <button onClick={handleDelete} style={{ marginTop: "1rem", color: "red" }}>
        Delete Account
      </button>
    </div>
  );
};

export default UserDetails;
