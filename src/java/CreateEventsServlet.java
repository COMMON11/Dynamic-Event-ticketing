import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.time.LocalDate;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@WebServlet("/createEvent")
public class CreateEventsServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");

        try (BufferedReader reader = request.getReader()) {
            JsonObject requestBody = JsonParser.parseReader(reader).getAsJsonObject();

            int created_by_uid = requestBody.get("created_by_uid").getAsInt();
            String event_name = requestBody.get("event_name").getAsString();
            String description = requestBody.get("description").getAsString();
            String due_date = requestBody.get("due_date").getAsString();
            String creation_date = LocalDate.now().toString();

            Connection conn = DatabaseConnection.getConnection();
            String sql = "INSERT INTO events (created_by_uid, event_name, description, creation_date, due_date) VALUES (?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, created_by_uid);
            stmt.setString(2, event_name);
            stmt.setString(3, description);
            stmt.setString(4, creation_date);
            stmt.setString(5, due_date);

            JsonObject jsonResponse = new JsonObject();
            if (stmt.executeUpdate() > 0) {
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("message", "Event created successfully.");
            } else {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "Failed to create event.");
            }

            response.getWriter().write(jsonResponse.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred.\"}");
        }
    }
}
