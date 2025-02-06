import axios from 'axios';

export default async function GetUser(userID) {
    try {
        const response = await axios.get(`/api/getUserDetails?id=${userID}`);

        if (response.data.success) {
            const user = {
                uname: response.data.uname,
                name: response.data.name,
                email: response.data.email,
                pic: response.data.pic,
                picType: response.data.pic_type,
            };
            return user; // Ensure the function returns the user data
        } else {
            console.log(response.data.message);
            return null; // Explicitly return null in case of failure
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null; // Return null in case of an error
    }
}
