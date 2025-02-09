import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@WebServlet("/deleteUser")
public class DeleteUserSevlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");

        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            // Parse the JSON request body
            BufferedReader reader = request.getReader();
            JsonObject requestBody = JsonParser.parseReader(reader).getAsJsonObject();
            System.out.println("Request Body: " + requestBody);
            
            int userId = requestBody.get("id").getAsInt(); // Extract the user ID

            // Establish database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to delete the user
            String sql = "DELETE FROM users WHERE id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);

            int rowsDeleted = stmt.executeUpdate();

            // Prepare the JSON response
            JsonObject jsonResponse = new JsonObject();
            if (rowsDeleted > 0) {
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("message", "User deleted successfully.");
                // Delete all user events
                sql = "DELETE FROM events WHERE created_by_uid = ?";
                stmt = conn.prepareStatement(sql);
                stmt.setInt(1, userId);
                stmt.executeUpdate();
            } else {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "User not found.");
            }
            response.getWriter().write(jsonResponse.toString());

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject errorResponse = new JsonObject();
            errorResponse.addProperty("success", false);
            errorResponse.addProperty("message", "An error occurred while deleting the user.");
            errorResponse.addProperty("error", "An error occurred while deleting the user.");
            response.getWriter().write(errorResponse.toString());
        } finally {
            try {
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
