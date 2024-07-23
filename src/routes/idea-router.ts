import express from "express";
import { IdeaController } from "../controllers/idea-controller.js";
import { json } from "stream/consumers";
import { AuthController } from "../controllers/auth-controller.js";
import { VoteController } from "../controllers/vote-controller.js";
import { enforceAuthentication, enforceIdeaAuthorization } from "../middleware/authorization.js";
import { CommentController } from "../controllers/comment-controller.js";
import { Idea } from "@prisma/client";

export const ideaRouter = express.Router();


ideaRouter.get("/ideas", async (req, res) => {
    let foundIdeas: Idea[];

    if(req.query.maxAge === undefined){
        foundIdeas = await IdeaController.getIdeas();
    }
    else{
        let startingDate = new Date();
        let dateOffset = (24*60*60*1000);
        try{
            dateOffset = dateOffset * Number(req.query.maxAge); 
        }
        catch(error){
            res.status(400).json({message: "Invalid Request"});
        }
        startingDate.setTime(startingDate.getTime() - dateOffset);
        foundIdeas = await IdeaController.getIdeas(startingDate);
    }
    

    let ideas = [];

    for(let idea of foundIdeas){
        const tally = await IdeaController.countVotes(idea);
        ideas.push({...idea, ...tally});
    }

    res.status(200).json(ideas);
})



ideaRouter.get("/ideas/:id", async (req, res) => {
    IdeaController.findIdea(Number(req.params.id))
    .then(async foundIdea => {
        if(foundIdea === null){
            res.status(404).json({message: "Idea was not found."});
        }
        else{
            const tally = await IdeaController.countVotes(foundIdea);
            res.status(200).json({...foundIdea, ...tally});
        }
        
    })
})

ideaRouter.post("/ideas", enforceAuthentication, async (req, res) => {
    let idea = req.body;
    //Find User
    const user = await AuthController.findUser(req.body.username);

    idea.author = user;

    const isIdeaValid = IdeaController.validateIdea(idea);

    if(isIdeaValid === true){
        IdeaController.saveIdea(idea);
        res.status(200).send("Idea was successfully submitted.");
    }
    else{
        res.status(400).send("Request is not valid");
    }


})

ideaRouter.delete("/ideas/:id", enforceAuthentication, enforceIdeaAuthorization, async (req, res) => {
    
    await IdeaController.deleteIdea(Number(req.params.id));
    res.send("Idea deleted.");

})

//Votes routing

ideaRouter.get("/ideas/:id/votes", async (req, res) => {
    const idea = await IdeaController.findIdea(Number(req.params.id));

    if(idea !== null){
        if(req.query.username !== undefined){
            const vote = await VoteController.getUserVote(req.query.username as string, idea.id);
            if(vote !== null){
                const responseVote = {
                    type: vote.type === 1 ? "upvote" : "downvote",
                    user: vote.voterUsername,
                    idea: vote.ideaId
                }
                res.status(200).json(responseVote);
            }
            else{
               res.status(200).json({message: "User has not voted on this post"});
            }
           


        }
        else{
            const votes = 
            res.status(200).json(await VoteController.getVotes(idea.id));
        }

    }
    else{
        res.status(404).json({message: "Idea does not exist"});
    }
})

ideaRouter.post("/ideas/:id/votes", enforceAuthentication, async (req, res) => {
    const idea = await IdeaController.findIdea(Number(req.params.id));

    if((idea !== null) && (idea.authorUsername !== req.body.username)){

        const user = await AuthController.findUser(req.body.username);

        await VoteController.saveVote({voteType: req.body.voteType, user: user, idea: idea});
        res.status(200).json(await VoteController.getVotes(idea.id));
    }
    else if (idea === null){
        res.status(404).send("Idea does not exist");
    }
    else{
        res.status(401).send("User can not vote on own post.");
    }
})

ideaRouter.delete("/ideas/:id/votes", enforceAuthentication, async (req, res) => {
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

//Comment routing
ideaRouter.get("/ideas/:id/comments", async (req, res) => {
    const foundIdea = await IdeaController.findIdea(Number(req.params.id));

    if(foundIdea !== null){
        CommentController.getComments(Number(req.params.id)).then(async foundComments => {
            res.status(200).json(foundComments);
        })
    }
    else{
        res.status(404).json({message:"Idea does not exist"});
    }
})

ideaRouter.post("/ideas/:id/comments", enforceAuthentication, async (req, res) => {
    const foundIdea = await IdeaController.findIdea(Number(req.params.id));

    let comment = req.body;

    if(foundIdea !== null){

        const user = await AuthController.findUser(req.body.username);

        comment.author = user;
        comment.replyTo = foundIdea;
        if(CommentController.validateComment(comment) === true){
            CommentController.saveComment(comment).then(async foundComments => {
                res.status(200).send("Comment added");
            })
        }
        else{
            res.status(401).send("Request invalid");
        }

    }
    else{
        res.status(404).send("Idea does not exist");
    }
})