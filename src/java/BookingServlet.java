import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/BookEvent")
public class BookingServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        BufferedReader reader = request.getReader();
        JsonObject requestBody = JsonParser.parseReader(reader).getAsJsonObject();        

        // Retrieve parameters
        int userId = requestBody.get("user_id").getAsInt();
        int eventId = requestBody.get("event_id").getAsInt();
        int quantity = requestBody.get("quantity").getAsInt();
        int cost = requestBody.get("cost").getAsInt();

        Connection conn = null;
        PreparedStatement stmt = null;

        try {

            // Establish connection
            conn = DatabaseConnection.getConnection();

            // Insert query
            String sql = "INSERT INTO bookings (user_id, event_id, qty, cost) VALUES (?, ?, ?, ?)";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            stmt.setInt(2, eventId);
            stmt.setInt(3, quantity);
            stmt.setInt(4, cost);

            int rowsInserted = stmt.executeUpdate();
            JsonObject jsonResponse = new JsonObject();
            if (rowsInserted > 0) {
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("message", "Booking successful");
                
                sql = "UPDATE events SET AvailSlots = AvailSlots - ? where event_id = ? ";
                stmt = conn.prepareStatement(sql);
                stmt.setInt(1, quantity);
                stmt.setInt(2, eventId);
                
                rowsInserted = stmt.executeUpdate();
            } else {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "Booking failed");
            }
            response.getWriter().write(jsonResponse.toString());
        } catch (Exception e) {
            e.printStackTrace();
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", e.getMessage());
            response.getWriter().write(jsonResponse.toString());
            
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
