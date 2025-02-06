import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.util.Base64;

@WebServlet("/getUserDetails")
public class GetUserDetailsSevlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?")) {
            
//            int userId = requestBody.get("id").getAsInt();
            int userId = Integer.parseInt(request.getParameter("id"));

            // Set the user ID parameter
            stmt.setInt(1, userId);

            try (ResultSet resultSet = stmt.executeQuery()) {
                JsonObject jsonResponse = new JsonObject();

                if (resultSet.next()) {
                    int userID = resultSet.getInt("id");
                    String userUName = resultSet.getString("uname");
                    String userName = resultSet.getString("name");
                    String userEmail = resultSet.getString("email");
                    byte[] picBytes = resultSet.getBytes("pic");
                    String picBase64 = Base64.getEncoder().encodeToString(picBytes);
                    String picType = resultSet.getString("pic_type");

                    jsonResponse.addProperty("success", true);
                    jsonResponse.addProperty("message", "Login Successful!");
                    jsonResponse.addProperty("id", userID);
                    jsonResponse.addProperty("name", userName);
                    jsonResponse.addProperty("uname", userUName);
                    jsonResponse.addProperty("email", userEmail);
                    jsonResponse.addProperty("pic", picBase64);
                    jsonResponse.addProperty("pic_type", picType);
                } else {
                    jsonResponse.addProperty("success", false);
                    jsonResponse.addProperty("message", "User not found.");
                }

                response.getWriter().write(jsonResponse.toString());
            }
        } catch (NumberFormatException e) {
            response.getWriter().write("{\"success\": false, \"message\": \"Invalid User ID format.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while fetching the user.\"}");
        }
    }
}