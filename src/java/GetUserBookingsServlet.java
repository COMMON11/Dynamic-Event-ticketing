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

@WebServlet("/getUserBookings")
public class GetUserBookingsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        int user_id = Integer.parseInt(request.getParameter("user_id"));

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        ResultSet rs2 = null;

        try {
            // Establish database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to fetch all events
            String sql = "SELECT event_id, qty, cost FROM bookings WHERE user_id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, user_id);
            rs = stmt.executeQuery();

            // Convert ResultSet to JSON Array
            JsonArray bookingsArray = new JsonArray();

            while (rs.next()) {
                JsonObject booking = new JsonObject();
                sql = "SELECT event_name, Logo, Banner, LogoType, BannerType FROM events WHERE event_id = ?";
                stmt = conn.prepareStatement(sql);
                stmt.setInt(1, rs.getInt("event_id"));
                rs2 = stmt.executeQuery();
                if (rs2.next()) {
                    booking.addProperty("event_name", rs2.getString("event_name"));
                    booking.addProperty("LogoType", rs2.getString("LogoType"));
                    booking.addProperty("BannerType", rs2.getString("BannerType"));
                    
                    byte[] logoBytes = rs2.getBytes("Logo");
                    if (logoBytes != null) {
                        String logoBase64 = Base64.getEncoder().encodeToString(logoBytes);
                        booking.addProperty("logo", logoBase64);
                    } else {
                        booking.addProperty("logo", (String) null);
                    }

                    byte[] bannerBytes = rs2.getBytes("Banner");
                    if (bannerBytes != null) {
                        String bannerBase64 = Base64.getEncoder().encodeToString(bannerBytes);
                        booking.addProperty("banner", bannerBase64);
                    } else {
                        booking.addProperty("banner", (String) null);
                    }
                }
                booking.addProperty("event_id", rs.getInt("event_id"));
                booking.addProperty("qty", rs.getInt("qty"));
                booking.addProperty("cost", rs.getString("cost"));


                bookingsArray.add(booking);
            }

            // Send JSON response
            response.getWriter().write(bookingsArray.toString());

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