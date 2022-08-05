import { Character } from "../models/character";

export class CharacterService {
    /*This class is used to fetch and put Character elements
    in the database.
    Notes that just a single character can have a certain name,
    making this property a primary key in the database and an
    identifier for the character's fetching.*/
    characters:Character[] = [];
    constructor() {}
    private async getCharacters():Promise<Character[]> {
        return this.characters
    }
    async getCharactersNames():Promise<string[]> {
        const tab :string[]= [];
        (await this.getCharacters()).forEach(value => {
            tab.push(value.name);
        });
        return tab;
    }
    async getCharacterWithName(name:string): Promise<Character> {
        const res = (await this.getCharacters()).find(value=>value.name==name);
        if (!res) throw `The character with ${name} name hasn't been found`
        return res;
    }
    async addCharacter(character:Character):Promise<void>{
        this.characters.push(character);
    }
}