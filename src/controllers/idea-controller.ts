import { User } from "@prisma/client";
import { Idea } from "@prisma/client";
import database from "../database.js";
import { VoteController } from "./vote-controller.js";

const titleMaxLength = 100;
const descriptionMaxLength = 400;


export class IdeaController {

    //Checks to see if an idea's fields meet their respective requirements.
    //Returns true if there are no issues, else it returns an array of error messages
    static validateIdea(idea: {title: string, description: string, author: User}): true | string[]{
        let errors: string[] = [];
        
        try{
            if(idea.title.length === 0){
                errors.push("Title must be specified.");
            }
            if(idea.title.length >= titleMaxLength){
                errors.push(`Title must not exceed ${titleMaxLength}.`);
            }
            if(idea.description.length >= descriptionMaxLength){
                errors.push(`Description must not exceed ${descriptionMaxLength}.`);
            }
    
            if(errors.length === 0){
                return true
            }
            else return errors;
        }
        catch(error){
            errors.push("Request is malformed");
            return errors;
        }

    }

    //Saves an idea into the database
    static async saveIdea(idea: {title: string, description: string, author: User}){
        const newIdea = await database.idea.create({
            data: {
                title: idea.title,
                description: idea.description,
                author: {
                    connect: { username: idea.author.username }
                }
            }
        })
    }

    //Retrieve all ideas stored in the database.
    static async getIdeas(includeComments = false, includeAuthor = true, includeVotes = true){
        var includedRelations = {
            author: includeAuthor,
            votes: includeVotes,
            comments: includeComments
        }
        
        const Ideas = await database.idea.findMany({
            include: includedRelations
        });


        return Ideas;

    }

    //Deletes an idea from the database
    static async deleteIdea(id: number){
        const deleteVotes = database.vote.deleteMany({
            where:{
                ideaId: id,
            }
        })

        const deleteComments = database.comment.deleteMany({
            where:{
                ideaId: id,
            }
        })

        const deleteIdea = database.idea.delete({
            where: {
                id: id
            }
        })

        const transaction = await database.$transaction([deleteVotes, deleteComments, deleteIdea]);
    }

    //Retrieves a specific idea from the database
    static async findIdea(id: number){
        const foundIdea = await database.idea.findUnique({
            where: {
                id: id
            }
        })

        return foundIdea
    }

    static async countVotes(idea: Idea){
        const votes = await VoteController.getVotes(idea.id);
        let tally = {
            upvotes: 0,
            downvotes: 0
        }
        for(let vote of votes){
            if(vote.type === 1){
                tally.upvotes = tally.upvotes + 1;
            }
            else{
                tally.downvotes = tally.downvotes + 1;
            }
        }
        return tally;
    }


}