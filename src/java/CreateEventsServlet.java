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
            String logoImg = requestBody.get("logo").getAsString();
            String logoImgType = requestBody.get("logoType").getAsString();
            String bannerImg = requestBody.get("banner").getAsString();
            String bannerImgType = requestBody.get("bannerType").getAsString();
            String creation_date = LocalDate.now().toString();
            
            System.out.print(logoImgType);
      
           

            Connection conn = DatabaseConnection.getConnection();
            String sql = "INSERT INTO events (created_by_uid, event_name, description, creation_date, due_date, Logo, Banner, LogoType, BannerType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setInt(1, created_by_uid);
            stmt.setString(2, event_name);
            stmt.setString(3, description);
            stmt.setString(4, creation_date);
            stmt.setString(5, due_date);
            if(logoImg.isEmpty()) {
                String filePath = "C:/Users/coman/Documents/NetBeansProjects/CA-2/Images/Default Event logo.png";
                File file = new File(filePath);
                FileInputStream logoInputStream = new FileInputStream(file);
                logoImgType = "image/jpeg";
                stmt.setBlob(6, logoInputStream);
                stmt.setString(8, logoImgType);
            } else {
                byte[] logoImageBytes = Base64.getDecoder().decode(logoImg);
                stmt.setBlob(6, new ByteArrayInputStream(logoImageBytes));
                stmt.setString(8, logoImgType);
            }
            
            if(bannerImg.isEmpty()) {
                String filePath = "C:/Users/coman/Documents/NetBeansProjects/CA-2/Images/Default Event banner.jpg";
                File file = new File(filePath);
                FileInputStream bannerInputStream = new FileInputStream(file);
                bannerImgType = "image/jpeg";
                stmt.setBlob(7, bannerInputStream);
                stmt.setString(9, bannerImgType);
            } else {
                byte[] bannerImageBytes = Base64.getDecoder().decode(bannerImg);
                stmt.setBlob(7, new ByteArrayInputStream(bannerImageBytes));
                stmt.setString(9, bannerImgType);
            }                 

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
