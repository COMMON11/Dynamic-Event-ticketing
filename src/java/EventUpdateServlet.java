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
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.util.Base64;

@WebServlet("/eventUpdate")
public class EventUpdateServlet extends HttpServlet {

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");

        try (BufferedReader reader = request.getReader()) {
            JsonObject requestBody = JsonParser.parseReader(reader).getAsJsonObject();

            int event_id = requestBody.get("event_id").getAsInt();
            String event_name = requestBody.get("event_name").getAsString();
            String description = requestBody.get("description").getAsString();
            String due_date = requestBody.get("due_date").getAsString();
            String logoImg = requestBody.get("logo").getAsString();
            String logoImgType = requestBody.get("logoType").getAsString();
            String bannerImg = requestBody.get("banner").getAsString();
            String bannerImgType = requestBody.get("bannerType").getAsString();
            String creation_date = LocalDate.now().toString();
            int availSlots = requestBody.get("availSlots").getAsInt();
            int maxBookings = requestBody.get("maxBookings").getAsInt();
            int price = requestBody.get("price").getAsInt();
            
            System.out.print(logoImgType);
      
           

            Connection conn = DatabaseConnection.getConnection();
            String sql = "UPDATE events SET event_name=?, description=?, Due_date=?, Logo=?, LogoType=?, Banner=?, BannerType=?, AvailSlots=?, MaxBooking=?, Price=? WHERE event_id=?";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, event_name);
            stmt.setString(2, description);
            stmt.setString(3, due_date);
//            stmt.setString(4, creation_date);
//            stmt.setString(5, due_date);
            if(logoImg.isEmpty()) {
                String filePath = getServletContext().getRealPath("/Images/Default Event logo.png");
                File file = new File(filePath);
                FileInputStream logoInputStream = new FileInputStream(file);
                logoImgType = "image/jpeg";
                stmt.setBlob(4, logoInputStream);
                stmt.setString(5, logoImgType);
            } else {
                byte[] logoImageBytes = Base64.getDecoder().decode(logoImg);
                stmt.setBlob(4, new ByteArrayInputStream(logoImageBytes));
                stmt.setString(5, logoImgType);
            }
            
            if(bannerImg.isEmpty()) {
                String filePath = getServletContext().getRealPath("/Images/Default Event banner.jpg");
                File file = new File(filePath);
                FileInputStream bannerInputStream = new FileInputStream(file);
                bannerImgType = "image/jpeg";
                stmt.setBlob(6, bannerInputStream);
                stmt.setString(7, bannerImgType);
            } else {
                byte[] bannerImageBytes = Base64.getDecoder().decode(bannerImg);
                stmt.setBlob(6, new ByteArrayInputStream(bannerImageBytes));
                stmt.setString(7, bannerImgType);
            } 
            stmt.setInt(8, availSlots);
            stmt.setInt(9, maxBookings);
            stmt.setInt(10, price);
            stmt.setInt(11, event_id);

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
