import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.util.Base64;

@WebServlet("/getAllEvents")
public class GetAllEventsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            // Establish database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to fetch all events
            String sql = "SELECT event_id, created_by_uid, event_name, description, creation_date, due_date, Logo, LogoType, Banner, BannerType FROM events";
            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            // Convert ResultSet to JSON Array
            JsonArray eventsArray = new JsonArray();

            while (rs.next()) {
                JsonObject event = new JsonObject();
                event.addProperty("event_id", rs.getInt("event_id"));
                event.addProperty("created_by_uid", rs.getInt("created_by_uid"));
                event.addProperty("event_name", rs.getString("event_name"));
                event.addProperty("description", rs.getString("description"));
                event.addProperty("creation_date", rs.getString("creation_date"));
                event.addProperty("due_date", rs.getString("due_date"));
                byte[] logoBytes = rs.getBytes("Logo");
                if (logoBytes != null) {
                    String logoBase64 = Base64.getEncoder().encodeToString(logoBytes);
                    event.addProperty("logo", logoBase64);
                } else {
                    event.addProperty("logo", (String) null);
                }
                event.addProperty("logoType", rs.getString("LogoType"));

                byte[] bannerBytes = rs.getBytes("Banner");
                if (bannerBytes != null) {
                    String bannerBase64 = Base64.getEncoder().encodeToString(bannerBytes);
                    event.addProperty("banner", bannerBase64);
                } else {
                    event.addProperty("banner", (String) null);
                }
                event.addProperty("bannerType", rs.getString("BannerType"));

                eventsArray.add(event);
            }

            // Send JSON response
            response.getWriter().write(eventsArray.toString());

        } catch (Exception e) {
            e.printStackTrace();
            JsonObject errorResponse = new JsonObject();
            errorResponse.addProperty("success", false);
            errorResponse.addProperty("message", "An error occurred while fetching events.");
            response.getWriter().write(errorResponse.toString());
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
