import { Character } from "../models/character.type";
import path from "node:path";
import { Sequelize, Model, DataTypes, QueryTypes, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from "sequelize";
import { MuppetsClient } from "../muppets-client";
import { Attachment } from "discord.js";
import axios from "axios";
import { db_Character, database, Quote } from "../models/db_classes";
export class CharacterService {
    /*
    This class is used to fetch and put Character elements
    in the database.
    One character matches one webhook, then the webhook id is a primary key.
    */
    private db:Sequelize;

    constructor(private muppetClient:MuppetsClient) {
        this.db = database;
    };

    private async checkCorrectCharName(name:string):Promise<db_Character> {
        const row = await this.db.query<db_Character>(`SELECT * FROM characters WHERE characters.name="${name}"`,
            {type:QueryTypes.SELECT, plain:true});
        if (!row) throw {
            name:"muppetsClientError",
            message:this.muppetClient.i18n("characterNotFound_error", {charName:name})
        }
        return row
    }

    private async buildCharacter(data:db_Character):Promise<Character> {
        const character:Character={
            name:data.name,
            webhook_data:{
                id:data.whkId,
                token:data.whkToken
            }
        };
        character.quotes = (await Quote.findAll({
            attributes:["quote", "quote_id"],
            where:{author_whkId:character.webhook_data.id}}))
                .map(res => ({
                    quote:res.quote,
                    id:+res.quote_id
                }));
        return character;
    };
    async getCharactersNames():Promise<string[]> {
        return (await db_Character.findAll({attributes:["name"]}))
            .map(value => value.name);
    };
    async getCharacterWithName(name:string): Promise<Character> {
        const row = await this.checkCorrectCharName(name);
        return await this.buildCharacter(row);
    };

    async addQuote(characterName:string, quote:string, attachment?:Attachment, attachment_url?:string) {
        await this.checkCorrectCharName(characterName);
        const author_whkId = (await this.db.query<{whkId:string}>(
            `SELECT whkId FROM characters WHERE name="${characterName}"`,
            {type:QueryTypes.SELECT}))[0].whkId;
        if (attachment) {
            const res = await axios.get<ArrayBuffer>(attachment.url, {responseType:"arraybuffer"});
            const buffer = res.data;
            await Quote.create({quote:quote, author_whkId:author_whkId, attachment:buffer, attachment_url:attachment_url});
        } else {
            await Quote.create({quote:quote, author_whkId:author_whkId});
        }
    };
    async deleteQuote(quote_id:number){
        await Quote.destroy({where:{quote_id:quote_id}});
    };
    async editQuote(quote_id:number, quote:string, attachment?:Attachment) {
        let buffer:ArrayBuffer|null=null;
        if (attachment) {
            const res = await axios.get<ArrayBuffer>(attachment.url, {responseType:"arraybuffer"});
            buffer = res.data;
        }
        await Quote.update({quote:quote, attachment:buffer, attachment_url:null},
            {where:{quote_id:quote_id}});
    };

    async addCharacter(character:Character):Promise<void> {
        let doesCharacterAlreadyExist:boolean = true; 
        try {
            await this.checkCorrectCharName(character.name);
        } catch(err:any) {
            if (err.name && err.name==="muppetsClientError")
            doesCharacterAlreadyExist = false;
        } finally {
            if (doesCharacterAlreadyExist) {
                throw {
                    name:"muppetsClientError",
                    message:this.muppetClient.i18n('characterAlreadyExist_error', {charName:character.name})
                }
            }
            await db_Character.create({
                name:character.name,
                whkToken:character.webhook_data.token,
                whkId:character.webhook_data.id});
        }
    };
    async deleteCharacter(characterName:string) {
        await this.checkCorrectCharName(characterName);
        const char = (await db_Character.findOne({
            attributes:["whkId"], where:{name:characterName}})
        );
        if (!char?.whkId) throw "Webhook id not found in the db";
        await Quote.destroy({
            where:{author_whkId:char.whkId}
        })
        await char.destroy();
    };
    async editCharacterName(whkId:string, newName:string) {
        await db_Character.update({name:newName}, {where:{whkId:whkId}});
    };
    async getQuote(quote_id:string):Promise<{quote:string, attachment:string|ArrayBuffer|null}> {
        const query = await Quote.findOne({
            attributes:["quote", "attachment_url"],
            where:{quote_id:quote_id}
        });
        if (!query) throw "Invalid quote id";
        let quote = {
            quote:query?.quote,
            attachment:query?.attachment_url||null
        }
        if (!quote.attachment || (await axios.get(quote.attachment)).status!==200) {
            if (quote.attachment) await Quote.update({attachment_url:null}, {where:{quote_id:quote_id}});
            const a = (await Quote.findOne({
                attributes:["attachment"],
                where:{quote_id:quote_id}
            }))?.attachment||null;
            return {quote:query?.quote, attachment:a};
        } else return quote;
    }

    async addAttachmentUrl(quote_id:string, attachment_url:string) {
        await Quote.update({attachment_url:attachment_url},{where:{quote_id:quote_id}});
    }
}