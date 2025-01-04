import org.springframework.security.crypto.bcrypt.BCrypt;

public class PasswordHasher {

    // Method to hash a password
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt(12)); // 12 rounds of salting
    }
}