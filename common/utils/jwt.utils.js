// definition de la classe jwt
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

class JwtUtils{
    // Methode pour generer un token jwt
    static generateAccessToken(payload){
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    }

    //methode pour generer un token de rafraichissement
    static generateRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        });
    }

  //methode pour verifier un token d'acces
    static verifyAccessToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }

  //methode pour verifier un token de rafraichissement
    static verifyRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    }
}

export default JwtUtils;