import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;

@WebServlet("/register")
public class RegistrationServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();


        BufferedReader reader = request.getReader();
        JsonObject jsonObject = JsonParser.parseReader(reader).getAsJsonObject();

        try {
            // Parse JSON data
            String name = jsonObject.get("name").getAsString();
            String uname = jsonObject.get("uname").getAsString();
            String password = jsonObject.get("password").getAsString();
            String email = jsonObject.get("email").getAsString();
            

            // Check if the username already exists
            if (isUsernameTaken(uname)) {
                JsonObject responseJson = new JsonObject();
                responseJson.addProperty("success", false);
                responseJson.addProperty("message", "Username already exists. Please choose a different username.");
                out.print(responseJson.toString());
                return;
            }

            // Insert user into the database
            boolean isRegistered = registerUser(name, uname, password, email);

            // Send JSON response
            JsonObject responseJson = new JsonObject();
            if (isRegistered) {
                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "User registered successfully.");
            } else {
                responseJson.addProperty("success", false);
                responseJson.addProperty("message", "User registration failed. Please try again.");
            }
            out.print(responseJson.toString());
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject errorResponse = new JsonObject();
            errorResponse.addProperty("success", false);
            errorResponse.addProperty("error", "Invalid request format.");
            out.print(errorResponse.toString());
        }
    }

    private boolean isUsernameTaken(String uname) {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            
            // Get database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to check if the username exists
            String sql = "SELECT COUNT(*) FROM users WHERE uname = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, uname);

            // Execute query
            rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) > 0; // Return true if count > 0
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // Close resources
            DatabaseConnection.closeConnection(conn);
            try {
                if (stmt != null) stmt.close();
                if (rs != null) rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return false;
    }

    private boolean registerUser(String name, String uname, String password, String email) {
        boolean isRegistered = false;
        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            // Get database connection
            conn = DatabaseConnection.getConnection();
            String filePath = getServletContext().getRealPath("/Images/default-avatar.jpg");
            File file = new File(filePath);
            FileInputStream inputStream = new FileInputStream(file);
            String fileType = "image/jpeg";

            // SQL query to insert a new user
            String sql = "INSERT INTO users (name, uname, password, email, pic, pic_type) VALUES (?, ?, ?, ?, ?, ?)";
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, name);
            stmt.setString(2, uname);
            stmt.setString(3, password);
            stmt.setString(4, email);
            stmt.setBlob(5, inputStream);
            stmt.setString(6, fileType);

            // Execute the update
            int rowsInserted = stmt.executeUpdate();
            if (rowsInserted > 0) {
                isRegistered = true;
            }
        } catch (SQLException | IOException e) {
            e.printStackTrace();
        } finally {
            // Close resources
            DatabaseConnection.closeConnection(conn);
            try {
                if (stmt != null) stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return isRegistered;
    }
}
