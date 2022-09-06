import { Character } from "../models/character.type";
import path from "node:path";
import { Sequelize, Model, DataTypes, QueryTypes } from "sequelize";
import { MuppetsClient } from "../muppets-client";

class db_Character extends Model {
    declare name:string;
    declare whkId:string;
    declare whkToken:string;
};

class db_Quotes extends Model {
    declare quote:string;
    declare author_whkId:string;
}

export class CharacterService {
    /*This class is used to fetch and put Character elements
    in the database.
    Notes that just a single character can have a certain name,
    making this property a primary key in the database and an
    identifier for the character's fetching.
    Notes also that all database errors will be display in the console
    as they cannot be throw without stop all process.*/
    private db!:Sequelize;

    constructor(private muppetClient:MuppetsClient) {
        const db_path = path.join(__dirname, '../..', "database.db");
        this.db = new Sequelize({
            dialect:'sqlite',
            storage:db_path,
            logging:false,
            host:'localhost'
        });
        
        db_Character.init({
            name:{
                type:DataTypes.TEXT,
                allowNull:false,
                unique:true
            },
            whkID:{
                type:DataTypes.STRING(30),
                primaryKey:true
            },
            whkToken:{
                type:DataTypes.STRING(200),
                allowNull:false
            }
        },{sequelize:this.db, modelName:'characters'});

        db_Quotes.init({
            quote:{
                type:DataTypes.TEXT,
                allowNull:false
            },
            author_whkId:{
                type:DataTypes.STRING(30),
                allowNull:false,
                references:{
                    model:db_Character,
                    key:'whkId'
                }
            },
            quote_id: {
                type:DataTypes.INTEGER,
                primaryKey:true
            }
        }, {sequelize:this.db, modelName:'quotes'});
    };

    private async buildCharacter(data:db_Character):Promise<Character> {
        const character:Character={
            name:data.name,
            webhook_data:{
                id:data.whkId,
                token:data.whkToken
            }
        };
        character.quotes = (await this.db.query<{quote:string, quote_id:number}>
            (`SELECT quotes.quote, quotes.quote_id
            FROM characters JOIN quotes ON characters.whkId = quotes.author_whkId
            WHERE characters.whkId="${character.webhook_data.id}";`, {type:QueryTypes.SELECT}))
            .map((value)=>({quote:value.quote, id:value.quote_id}));
        return character;
    };
    async getCharactersNames():Promise<string[]> {
        return (await this.db.query<{name:string}>(`SELECT name FROM characters`, {type:QueryTypes.SELECT}))
            .map(value => value.name);
    };
    async getCharacterWithName(name:string): Promise<Character> {
        const row = await this.db.query<db_Character>(`SELECT * FROM characters WHERE characters.name="${name}"`,
            {type:QueryTypes.SELECT, plain:true});
        if (!row) throw `Character with "${name}" name not found.`;
        return await this.buildCharacter(row);
    };

    async addQuote(characterName:string, quote:string) {
        await this.db.query(
        `INSERT INTO quotes (quote, author_whkId) VALUES
        ("${quote}",
        (SELECT whkId FROM characters WHERE name="${characterName}"));`,
        {type:QueryTypes.INSERT});
    };
    async deleteQuote(quote_id:number){
        await this.db.query(
            `DELETE FROM quotes
            WHERE quotes.quote_id=${quote_id};`,
            {type:QueryTypes.DELETE}
        );
    };
    async editQuote(quote_id:number, quote:string) {
        await this.db.query(
            `UPDATE quotes
                SET quote='${quote}'
                WHERE quote_id=${quote_id}`,
            {type:QueryTypes.UPDATE}
        );
    };

    async addCharacter(character:Character):Promise<void> {
        const data = [
            character.name,
            character.webhook_data.id,
            character.webhook_data.token
        ]
        await this.db.query(`INSERT INTO characters VALUES(?, ?, ?)`, {replacements:data, type:QueryTypes.INSERT});
        await this.muppetClient.deployCommands();
    };
    async deleteCharacter(characterName:string) {
        await this.db.query(
            `DELETE FROM quotes
            WHERE quotes.author_whkId=(SELECT whkId FROM characters
                WHERE name="${characterName}");`,
            {type:QueryTypes.DELETE}
        );
        await this.db.query(
            `DELETE FROM characters
                WHERE name="${characterName}";`,
            {type:QueryTypes.DELETE})
        await this.muppetClient.deployCommands();
    };
    async editCharacterName(whkId:string, newName:string) {
        await this.db.query(
            `UPDATE characters
                SET name="${newName}"
                WHERE whkId="${whkId}"`,
            {type:QueryTypes.UPDATE}
        );
        await this.muppetClient.deployCommands();
    };


}