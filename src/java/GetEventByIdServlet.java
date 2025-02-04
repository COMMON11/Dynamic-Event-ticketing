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

@WebServlet("/getEventById")
public class GetEventByIdServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            // Get event_id from request parameters
            String eventIdParam = request.getParameter("event_id");

            if (eventIdParam == null || eventIdParam.isEmpty()) {
                response.getWriter().write("{\"success\": false, \"message\": \"Event ID is required.\"}");
                return;
            }

            int event_id = Integer.parseInt(eventIdParam);

            // Establish database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to fetch the event by ID
            String sql = "SELECT event_id, created_by_uid, event_name, description, creation_date, due_date FROM events WHERE event_id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, event_id);
            rs = stmt.executeQuery();

            JsonObject jsonResponse = new JsonObject();

            if (rs.next()) {
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("event_id", rs.getInt("event_id"));
                jsonResponse.addProperty("created_by_uid", rs.getInt("created_by_uid"));
                jsonResponse.addProperty("event_name", rs.getString("event_name"));
                jsonResponse.addProperty("description", rs.getString("description"));
                jsonResponse.addProperty("creation_date", rs.getString("creation_date"));
                jsonResponse.addProperty("due_date", rs.getString("due_date"));
            } else {
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "Event not found.");
            }

            // Send JSON response
            response.getWriter().write(jsonResponse.toString());

        } catch (NumberFormatException e) {
            response.getWriter().write("{\"success\": false, \"message\": \"Invalid Event ID format.\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while fetching the event.\"}");
        } finally {
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
