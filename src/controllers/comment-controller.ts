import { Idea, User } from "@prisma/client";
import database from "../database.js";


export class CommentController{

    static async saveComment(comment: {text: string, author: User, replyTo: Idea}){
        const newComment = await database.comment.create({
            data: {
                text: comment.text,
                author: {
                    connect: { username: comment.author.username }
                },
                idea: {
                    connect: { id: comment.replyTo.id }
                }
            }
            
        }) 
    }

    static async getComments(includeAuthor: true, includeIdea: false){
        var includedRelations = {
            author: includeAuthor,
            idea: includeIdea
        }

        const Comments = await database.comment.findMany({
            include: includedRelations
        })

        return Comments
    }

    static async deleteComment(id: number){
        const deleteOperation = await database.comment.delete({
            where: {
                id: id
            }
        })
    }
}
