import { createHash } from "crypto";
import database from "../database.js";


export class AuthController{
    static hashPassword(password: string): string{
        let hash = createHash("sha256"); 
        return hash.update(password).digest("hex")
    }

    static async registerUser(user: {username: string, password: string}){
        const hashedPassword = AuthController.hashPassword(user.password)

        const newUser = await database.user.create({
            data: {
                username: user.username,
                password: hashedPassword
            }
        })
    }

}

   
