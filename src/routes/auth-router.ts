import express from "express";
import { AuthController } from "../controllers/auth-controller.js";

export const authRouter = express.Router();



authRouter.post("/auth", async (req, res) => {
    try{
        let token = await AuthController.authenticateUser(req.body);
        res.status(200).json(token);
    }
    catch(error){
        res.status(401).send("Invalid Credentials.");
    }
})

authRouter.post("/signup", async (req, res) => {
    let user = await AuthController.findUser(req.body.username);
    if(user !== null){
        res.status(401).json({message: "Username already taken."});
        return;
    }
    AuthController.registerUser({username: req.body.username, password: req.body.password});
    res.status(200).json(AuthController.issueToken(req.body.username));
    
})