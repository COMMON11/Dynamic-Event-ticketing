import com.google.gson.JsonArray;
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
import java.util.Base64;

@WebServlet("/getUserArchived")
public class GetUserArchivedServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            int userId = Integer.parseInt(request.getParameter("user_id"));

            // Establish database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to fetch the event by ID
            String sql = "SELECT event_id, created_by_uid, event_name, description, creation_date, due_date, Logo, LogoType, Banner, BannerType, AvailSlots, MaxBooking, Price, Total_qty, Total_cost FROM events_archived WHERE created_by_uid = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userId);
            rs = stmt.executeQuery();

            JsonArray ArchivedArray = new JsonArray();

            if (rs.next()) {
                JsonObject jsonResponse = new JsonObject();
                jsonResponse.addProperty("event_id", rs.getInt("event_id"));
                jsonResponse.addProperty("created_by_uid", rs.getInt("created_by_uid"));
                jsonResponse.addProperty("event_name", rs.getString("event_name"));
                jsonResponse.addProperty("description", rs.getString("description"));
                jsonResponse.addProperty("creation_date", rs.getString("creation_date"));
                jsonResponse.addProperty("due_date", rs.getString("due_date"));
                jsonResponse.addProperty("availSlots", rs.getInt("AvailSlots"));
                jsonResponse.addProperty("maxBookings", rs.getInt("MaxBooking"));
                jsonResponse.addProperty("price", rs.getInt("Price"));
                jsonResponse.addProperty("total_qty", rs.getInt("Total_qty"));
                jsonResponse.addProperty("Total_cost", rs.getFloat("Total_cost"));
                byte[] logoBytes = rs.getBytes("Logo");
                if (logoBytes != null) {
                    String logoBase64 = Base64.getEncoder().encodeToString(logoBytes);
                    jsonResponse.addProperty("logo", logoBase64);
                } else {
                    jsonResponse.addProperty("logo", (String) null);
                }
                jsonResponse.addProperty("logoType", rs.getString("LogoType"));

                byte[] bannerBytes = rs.getBytes("Banner");
                if (bannerBytes != null) {
                    String bannerBase64 = Base64.getEncoder().encodeToString(bannerBytes);
                    jsonResponse.addProperty("banner", bannerBase64);
                } else {
                    jsonResponse.addProperty("banner", (String) null);
                }
                jsonResponse.addProperty("bannerType", rs.getString("BannerType"));
                
                ArchivedArray.add(jsonResponse);

            } else {
                JsonObject jsonResponse = new JsonObject();
                jsonResponse.addProperty("success", false);
                jsonResponse.addProperty("message", "Event not found.");
                ArchivedArray.add(jsonResponse);
            }

            // Send JSON response
            response.getWriter().write(ArchivedArray.toString());

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
