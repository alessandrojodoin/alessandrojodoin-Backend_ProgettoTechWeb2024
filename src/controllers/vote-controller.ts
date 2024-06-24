import { Idea, User } from "@prisma/client";
import database from "../database.js";

type Vote = "upvote" | 'downvote';

export class VoteController{

    static async saveVote(vote: {voteType: Vote, user: User, idea: Idea}){

        //Create a new vote if one doesn't exist already, else update it with the new vote value.
        const newVote = await database.vote.upsert({
            where: {
                voterUsername_ideaId: {
                    voterUsername: vote.user.username,
                    ideaId: vote.idea.id
                }
            },
            create: {
                type: vote.voteType === "upvote" ? 1 : -1,
                voter: {
                    connect: { username: vote.user.username }
                },
                idea: {
                    connect: { id: vote.idea.id }
                }
            },
            update: {
                type: vote.voteType === "upvote" ? 1 : -1
            }
        })
    }

    static async cancelVote(vote: {user: User, idea: Idea}){
        const deletedVote = await database.vote.delete({
            where: {
                voterUsername_ideaId: {
                    voterUsername: vote.user.username,
                    ideaId: vote.idea.id
                }
            }
        })
    }


}