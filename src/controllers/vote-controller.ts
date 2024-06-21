import { Idea, User } from "@prisma/client";
import database from "../database.js";

type vote = "upvote" | 'downvote';

export class VoteController{

    static async saveVote(vote: {voteType: vote, user: User, idea: Idea}){


        const newVote = await database.vote.create({
            data: {
                type: vote.voteType === "upvote" ? 1 : -1;
                voter: {
                    connect: { username: vote.user.username }
                },
                idea: {
                    connect: { id: vote.idea.id }
                }
            }
        })
    }


}