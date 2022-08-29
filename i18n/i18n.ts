import i18next from "i18next";
import fs from "node:fs";
import path from 'node:path';
import { MuppetsClientTranslationType } from "../models/translation.type";

let initialValue:{[languages:string]:{translation:MuppetsClientTranslationType}} = {};

const availableLanguages = fs.readdirSync(__dirname).filter(file => !file.includes('.'));

const resources = availableLanguages
    .map(folder => {
        const translation:MuppetsClientTranslationType = require(path.join(__dirname, folder, 'translation.json'))
        return {
            key:folder,
            value:{translation:translation}
        }
    }).reduce((acc, curr)=>(acc[curr.key]=curr.value, acc), initialValue);

i18next.init({
    fallbackLng:"en",
    resources: resources
});

export const i18n = (lng?:string) => {
    if (lng && !availableLanguages.includes) {
        lng="en";
        console.log("The specified language isn't available. It is therefore set into english.")
    };
    return i18next.getFixedT(lng||"en");
};