import express from "express";
import { IdeaController } from "../controllers/idea-controller.js";
import { json } from "stream/consumers";
import { AuthController } from "../controllers/auth-controller.js";

export const ideaRouter = express.Router();

ideaRouter.get("/ideas", (req, res) => {
    IdeaController.getIdeas().then(foundIdeas => res.json(foundIdeas));
})

ideaRouter.get("/ideas/:id", (req, res) => {
    IdeaController.findIdea(Number(req.params.id)).then(foundIdea => res.json(foundIdea));
})

ideaRouter.post("/ideas", async (req, res) => {
    let idea = req.body;
    //Find User
    const user = await AuthController.findUser(idea.userUsername);

    idea.author = user;
    delete idea.userUsername;

    const isIdeaValid = IdeaController.validateIdea(idea);

    if(isIdeaValid){
        IdeaController.saveIdea(idea);
    }


})

ideaRouter.delete("/ideas/:id", (req, res) => {
    
    IdeaController.deleteIdea(Number(req.params.id));

})