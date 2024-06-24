import { User } from "@prisma/client";
import { Idea } from "@prisma/client";
import database from "../database.js";

const titleMaxLength = 100;
const descriptionMaxLength = 400;


export class IdeaController {

    static validateIdea(idea: {title: string, description: string, author: User}): true | string[]{
        let errors: string[] = [];
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

    static async findIdea(id: number){
        const foundIdea = await database.idea.findUnique({
            where: {
                id: id
            }
        })

        return foundIdea
    }


}