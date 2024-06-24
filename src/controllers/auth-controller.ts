import { createHash } from "crypto";
import database from "../database.js";
import Jwt from "jsonwebtoken";

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

    static issueToken(username: string): string{
        return Jwt.sign({user: username}, process.env.TOKEN_SECRET, {expiresIn: `${24*60*60}s`});
    }

    static async findUser(username: string){
        const foundUser = await database.user.findUnique({
            where: {
                username: username
            }
        })

        return foundUser;
    }

}

   
