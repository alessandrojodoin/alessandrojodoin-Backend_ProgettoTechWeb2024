import express from "express";
import { IdeaController } from "../controllers/idea-controller.js";
import { json } from "stream/consumers";
import { AuthController } from "../controllers/auth-controller.js";
import { VoteController } from "../controllers/vote-controller.js";

export const ideaRouter = express.Router();


ideaRouter.get("/ideas", (req, res) => {
    IdeaController.getIdeas().then(foundIdeas => res.status(200).json(foundIdeas));
})


ideaRouter.get("/ideas/:id", (req, res) => {
    IdeaController.findIdea(Number(req.params.id))
    .then(foundIdea => {
        if(foundIdea === null){
            res.status(404).send("Idea not found.");
        }
        else{
            res.status(200).json(foundIdea);
        }
        
    })
})

ideaRouter.post("/ideas", async (req, res) => {
    let idea = req.body;
    //Find User
    const user = await AuthController.findUser(idea.userUsername);

    idea.author = user;
    delete idea.userUsername;

    const isIdeaValid = IdeaController.validateIdea(idea);

    if(isIdeaValid === true){
        IdeaController.saveIdea(idea);
    }
    else{

    }


})

ideaRouter.delete("/ideas/:id", (req, res) => {
    
    IdeaController.deleteIdea(Number(req.params.id));

})

//Votes routing

ideaRouter.get("/ideas/:id/votes", async (req, res) => {
    const idea = await IdeaController.findIdea(Number(req.params.id));

    if(idea){
        res.json(VoteController.getVotes(idea));
    }
    

})