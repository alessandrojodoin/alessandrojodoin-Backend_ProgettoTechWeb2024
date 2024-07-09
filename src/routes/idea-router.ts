import express from "express";
import { IdeaController } from "../controllers/idea-controller.js";
import { json } from "stream/consumers";
import { AuthController } from "../controllers/auth-controller.js";
import { VoteController } from "../controllers/vote-controller.js";
import { enforceAuthentication, enforceIdeaAuthorization } from "../middleware/authorization.js";

export const ideaRouter = express.Router();


ideaRouter.get("/ideas", async (req, res) => {
    IdeaController.getIdeas().then(foundIdeas => res.status(200).json(foundIdeas));
})


ideaRouter.get("/ideas/:id", (req, res) => {
    IdeaController.findIdea(Number(req.params.id))
    .then(foundIdea => {
        if(foundIdea === null){
            res.status(404).send("Idea was not found.");
        }
        else{
            res.status(200).json(foundIdea);
        }
        
    })
})

ideaRouter.post("/ideas", async (req, res) => {
    let idea = req.body;
    //Find User
    const user = await AuthController.findUser(req.body.username);

    idea.author = user;
    delete idea.username;

    const isIdeaValid = IdeaController.validateIdea(idea);

    if(isIdeaValid === true){
        IdeaController.saveIdea(idea);
        res.status(200).send("Idea was successfully submitted.");
    }
    else{
        res.status(400).send("Request is not valid");
    }


})

ideaRouter.delete("/ideas/:id", enforceIdeaAuthorization, async (req, res) => {
    
    await IdeaController.deleteIdea(Number(req.params.id));
    res.send("Idea deleted.");

})

//Votes routing

ideaRouter.get("/ideas/:id/votes", async (req, res) => {
    const idea = await IdeaController.findIdea(Number(req.params.id));

    if(idea !== null){
        res.status(200).json(await VoteController.getVotes(idea));
    }
    else{
        res.status(404).send("Idea does not exist");
    }
})

ideaRouter.post("/ideas/:id/votes", async (req, res) => {
    const idea = await IdeaController.findIdea(Number(req.params.id));

    if((idea !== null) && (idea.authorUsername !== req.body.username)){

        const user = await AuthController.findUser(req.body.username);

        await VoteController.saveVote({voteType: req.body.voteType, user: user, idea: idea});
        res.status(200).json(await VoteController.getVotes(idea));
    }
    else if (idea === null){
        res.status(404).send("Idea does not exist");
    }
    else{
        res.status(401).send("User can not vote on own post.");
    }
})

ideaRouter.delete("/ideas/:id/votes", async (req, res) => {
    const idea = await IdeaController.findIdea(Number(req.params.id));

    if(idea !== null){

        const user = await AuthController.findUser(req.body.username);
        await VoteController.cancelVote({user: user, idea: idea});
        res.status(200).send("Vote removed");
    }
    else{
        res.status(404).send("Idea does not exist");
    }
})
