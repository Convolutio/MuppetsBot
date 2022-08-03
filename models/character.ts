import { BufferResolvable } from "discord.js";

export class Character {
    name!:string;
    avatar!:BufferResolvable;
    quotes?:string[];
}