import org.springframework.security.crypto.bcrypt.BCrypt;
import java.io.BufferedReader;
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

@WebServlet("/updateUser")
public class UserUpdateServlet extends HttpServlet {

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        JsonObject jsonResponse = new JsonObject();

        Connection conn = null;
        PreparedStatement stmt = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            // Parse the JSON request body
            BufferedReader reader = request.getReader();
            JsonObject requestBody = JsonParser.parseReader(reader).getAsJsonObject();

            int userId = requestBody.get("id").getAsInt();
            String name = requestBody.get("name").getAsString();
            String email = requestBody.get("email").getAsString();
            String password = requestBody.get("password").getAsString();
            String confPassword = requestBody.get("confirm_password").getAsString();

            conn = DatabaseConnection.getConnection();

            // Retrieve stored password
            String sql = "SELECT password FROM users WHERE id = ?";
            preparedStatement = conn.prepareStatement(sql);
            preparedStatement.setInt(1, userId);
            resultSet = preparedStatement.executeQuery();

            if (resultSet.next()) {
                String storedHashedPassword = resultSet.getString("password");

                // Validate passwords (retains your original logic without fixes)
                String hashedConfPassword = BCrypt.hashpw(confPassword, BCrypt.gensalt(10));
                boolean isPasswordMatch = BCrypt.checkpw(hashedConfPassword, storedHashedPassword);

                if (isPasswordMatch) {
                    jsonResponse.addProperty("success", false);
                    jsonResponse.addProperty("message", "Incorred password.");
                    response.getWriter().write(jsonResponse.toString());
                    return;
                }

                // Hash the new password and update user
                String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(10));
                sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?";
                stmt = conn.prepareStatement(sql);
                stmt.setString(1, name);
                stmt.setString(2, email);
                stmt.setString(3, hashedPassword);
                stmt.setInt(4, userId);

                int rowsUpdated = stmt.executeUpdate();
                if (rowsUpdated > 0) {
                    jsonResponse.addProperty("success", true);
                    jsonResponse.addProperty("message", "User updated successfully.");
                } else {
                    jsonResponse.addProperty("success", false);
                    jsonResponse.addProperty("message", "User not found.");
                }
            } else {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "User not found.");
            }

            response.getWriter().write(jsonResponse.toString());

        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "An error occurred.");
            response.getWriter().write(jsonResponse.toString());
        } finally {
            try {
                if (resultSet != null) resultSet.close();
                if (preparedStatement != null) preparedStatement.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
