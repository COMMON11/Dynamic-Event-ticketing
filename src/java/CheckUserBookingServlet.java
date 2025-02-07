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

@WebServlet("/checkUserServlet")
public class CheckUserBookingServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            int userID = Integer.parseInt(request.getParameter("user_id"));
            int maxBooking = Integer.parseInt(request.getParameter("maxBookings"));

            // Establish database connection
            conn = DatabaseConnection.getConnection();

            // SQL query to fetch the event by ID
            String sql = "SELECT qty from bookings where user_id = ?";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, userID);
            rs = stmt.executeQuery();

            JsonObject jsonResponse = new JsonObject();

            if (rs.next()) {
                int newMaxBookings = maxBooking - rs.getInt("qty");
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("maxBookings", newMaxBookings);
                
            } else {
                jsonResponse.addProperty("success", true);
                jsonResponse.addProperty("maxBookings", maxBooking);
            }

            // Send JSON response
            response.getWriter().write(jsonResponse.toString());

        } catch (NumberFormatException e) {
            response.getWriter().write("{\"success\": false, \"message\": \"Invalid User ID format.\"}");
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
