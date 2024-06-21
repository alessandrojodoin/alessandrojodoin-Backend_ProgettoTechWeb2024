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

    static async getIdeas(){
        const Ideas = await database.idea.findMany();
    }


}