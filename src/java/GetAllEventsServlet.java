import java.io.IOException;
import java.sql.*;
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
            
            String sql = "{call GetEventsJSON()}";
            CallableStatement stmt2 = conn.prepareCall(sql);
            ResultSet rs2 = stmt2.executeQuery();
            JsonObject result = new JsonObject();
            
            if(rs2.next()) {
                result.addProperty("result", rs2.getString(1));
            }
            
            response.getWriter().write(result.toString());
            
            
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
