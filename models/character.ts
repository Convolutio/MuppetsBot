import { BufferResolvable } from "discord.js";

export class Character {
    //The name property will be the primary key in the database.
    name!:string;
    webhook_data!:{id:string, token:string};
    quotes?:{
        quote:string,
        id:number
    }[];
}