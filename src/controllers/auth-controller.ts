import { createHash, hash } from "crypto";
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

    static async findUser(username: string, excludePassword = true){
        const foundUser = await database.user.findUnique({
            where: {
                username: username
            },
            omit: {
                password: excludePassword
            }
        })

        return foundUser;
    }

    static verifyToken(token: string){
        return Jwt.verify(token, process.env.TOKEN_SECRET);
    }

    static async authenticateUser(credentials: {username: string, password: string}){
        let user = await AuthController.findUser(credentials.username, false);
        if(user === null){
            throw new Error;
        }
        if(user.password !== AuthController.hashPassword(credentials.password)){
            throw new Error;
        }
        return this.issueToken(user.username);
    }

}

   
