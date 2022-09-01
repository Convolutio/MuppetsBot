import i18next from "i18next";
import fs from "node:fs";
import path from 'node:path';
import { MuppetsClientTranslationType, i18nKey, DISCORD_LANGUAGE, Localizations, is_DISCORD_LANGUAGE } from "../models/translation.type";

const DEFAULT_LANGUAGE = "en-US";

let initialValue:Partial<Record<DISCORD_LANGUAGE, {translation:MuppetsClientTranslationType}>> = {};

const availableLanguages:DISCORD_LANGUAGE[] = [];
fs.readdirSync(__dirname).map(folder => {
    if (is_DISCORD_LANGUAGE(folder)) {
        availableLanguages.push(folder);
    }
});

const resources = availableLanguages
    .map(folder => {
        const translation:MuppetsClientTranslationType = require(path.join(__dirname, folder, 'translation.json'))
        return {
            key:folder,
            value:{translation:translation}
        }
    }).reduce((acc, curr)=>(acc[curr.key]=curr.value, acc), initialValue);

i18next.init({
    fallbackLng:DEFAULT_LANGUAGE,
    resources: resources
});

function get_locales(key:i18nKey):Localizations {
    if (!resources) throw "error";
    const obj:Localizations = {};
    for(const language of availableLanguages) {
        obj[language] = resources[language]?.translation[key];
    }
    return obj;
};

export function i18n_build<BuilderType extends {
    setName:(name:string) => BuilderType,
    setDescription:(description:string) => BuilderType,
    setNameLocalizations:(localizedNames:Localizations) => BuilderType,
    setDescriptionLocalizations:(localizedDescriptions:Localizations) => BuilderType 
}>(builder:BuilderType, nameKey:i18nKey, descriptionKey:i18nKey):BuilderType {
    if (!resources[DEFAULT_LANGUAGE]) throw `The default language isn't supported. "./i18n/${DEFAULT_LANGUAGE}/translation.json" file is missing.`
    return builder.setName(nameKey)
        .setNameLocalizations(get_locales(nameKey))
        .setDescription(resources[DEFAULT_LANGUAGE].translation[descriptionKey])
        .setDescriptionLocalizations(get_locales(descriptionKey))
}

export const i18n = (lng?:DISCORD_LANGUAGE) => {
    if (lng && !availableLanguages.includes) {
        lng="en-US";
        console.log("The specified language isn't available. It is therefore set into english.")
    };
    return i18next.getFixedT(lng||DEFAULT_LANGUAGE);
};