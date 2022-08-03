import { Character } from "../models/character";

export class CharacterService {
    //No characters must share the same name
    characters:Character[] = [
        {
            name:"Gérard Depardieu",
            avatar:'https://m.media-amazon.com/images/M/MV5BZGZlNjQ0NjMtZjdlMi00NzdmLThjN2QtMTNlMDc0NDVkNDBiXkEyXkFqcGdeQXVyNjgxMTQ3MTY@._V1_.jpg',
            quotes:[
                "Ça se bouffe, ça 🐼 ?",
                "J'aime le cidre des paysans, ce qu'on nomme le \"tord-boyaux\", et qui file la chiasse à chaque fois."
            ]
        },
        {
            name:'Jacques Chirac',
            avatar:'https://www.corbeil-essonnes.fr/wp-content/uploads/Portrait-Jacques-Chirac.jpg',
            quotes:[
                'Un chef c\'est fait pour cheffer.',
                "J'aime les pommes."
            ]
        }
    ];
    constructor() {}
    async getCharacters():Promise<Character[]> {
        return this.characters
    }
    async getCharactersName():Promise<string[]> {
        const tab :string[]= [];
        (await this.getCharacters()).forEach(value => {
            tab.push(value.name);
        });
        return tab;
    }
    async getCharacterWithName(name:string): Promise<Character|undefined> {
        const res = (await this.getCharacters()).find(value=>value.name==name);
        if (!res) {
            console.error("Not found");
        }
        return res;
    }
}