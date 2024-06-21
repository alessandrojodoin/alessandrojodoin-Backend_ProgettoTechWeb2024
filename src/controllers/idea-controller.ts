import { User } from "@prisma/client";
import { Idea } from "@prisma/client";
import database from "../database.js";


export class IdeaController {

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

    static async getIdeas(filters: ((element: Idea) => boolean)[], includeComments = false, includeAuthor = true, includeVotes = true){
        var includedRelations = {
            author: includeAuthor,
            votes: includeVotes,
            comments: includeComments
        }
        
        const Ideas = await database.idea.findMany({
            include: includedRelations
        });

        filters.forEach(element => {
            Array.prototype.filter(element);
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