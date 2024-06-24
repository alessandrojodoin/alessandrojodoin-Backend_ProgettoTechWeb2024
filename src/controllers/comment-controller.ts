import { Idea, User } from "@prisma/client";
import database from "../database.js";




export class CommentController{

    static textMaxLength = 200;

    static validateComment(comment: {text: string, author: User, replyTo: Idea}){
        let errors: string[] = [];
        if(comment.text.length === 0){
            errors.push("Contents must be specified.");
        }
        if(comment.text.length >= this.textMaxLength){
            errors.push(`Title must not exceed ${this.textMaxLength}.`);
        }

        if(errors.length === 0){
            return true
        }
        else return errors;
    }

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
