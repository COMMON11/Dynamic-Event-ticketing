import org.springframework.security.crypto.bcrypt.BCrypt;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
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

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
                // Read the request body as a string
        StringBuilder data = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            data.append(line);
        }

        // Parse the JSON data
        JsonObject jsonObject = JsonParser.parseString(data.toString()).getAsJsonObject();
        String uname = jsonObject.get("uname").getAsString();
        String password = jsonObject.get("password").getAsString();
       


        JsonObject jsonResponse = new JsonObject();

        try {
            // Establish connection
            Connection connection = DatabaseConnection.getConnection();

            // Query to validate user
            String sql = "SELECT * FROM users WHERE uname = ?";
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setString(1, uname);
            

            ResultSet resultSet = preparedStatement.executeQuery();

            if (resultSet.next()) {
                // Get the stored hashed password
                String storedHashedPassword = resultSet.getString("password");

                // Compare the input password with the stored hash
                boolean isPasswordMatch = BCrypt.checkpw(password, storedHashedPassword);
                if (isPasswordMatch) {
                    int userID = resultSet.getInt("id");
                    String userUName = resultSet.getString("uname");
                    String userName = resultSet.getString("name");
                    String userEmail = resultSet.getString("email");
                    byte[] picBytes = resultSet.getBytes("pic");
                    String picBase64 = Base64.getEncoder().encodeToString(picBytes);
                    String picType = resultSet.getString("pic_type");

                    jsonResponse.addProperty("success", true);
                    jsonResponse.addProperty("message", "Login Sucessful!");
                    jsonResponse.addProperty("id", userID);
                    jsonResponse.addProperty("name", userName);
                    jsonResponse.addProperty("uname", userUName);
                    jsonResponse.addProperty("email", userEmail);
                    jsonResponse.addProperty("pic", picBase64);
                    jsonResponse.addProperty("pic_type", picType);
                } else {
                    jsonResponse.addProperty("success", false);
                    jsonResponse.addProperty("error", isPasswordMatch);
                }
            }
            // Close connections
            resultSet.close();
            preparedStatement.close();
            connection.close();
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("error", e.getMessage());
        }

        out.print(jsonResponse.toString());
        out.flush();
    }
}
