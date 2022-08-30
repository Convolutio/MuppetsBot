const options = [
    //commands names
    "characters",
    "quotes",
    "play",
    "add",
    "remove",
    "edit",
    //commands args names
    "character",
    "content",
    "name",
    "avatarURL",
    "avatarFile",
    //commands description
    "play_description",
    "characters_description",
    "quotes_description",
    "characters$add_description",
    "characters$remove_description",
    "characters$edit_description",
    "quotes$add_description",
    "quotes$remove_description",
    "quotes$edit_description",
    //args description
    "play$character_description",
    "play$content_description",
    "characters$add$name_description",
    "characters$add$avatarURL_description",
    "characters$add$avatarFile_description",
    "characters$edit$character_description",
    "characters$edit$name_description",
    "characters$edit$avatarURL_description",
    "characters$edit$avatarFile_description",
    "characters$remove$character_description",
    "quotes$add$character_description",
    "quotes$add$content_description",
    "quotes$edit$character_description",
    "quotes$edit$content_description",
    "quotes$remove$character_description",
    //UI's logs
    "done",
    "webhookAwaited_log",
    "noSavedQuote_error",
    "characterCreated_log",
    "characterEdited_log",
    "characterDeleted_log",
    "invalidAvatar_error",
    "quoteAdded_log",
    "quoteRemoved_log",
    "quoteEdited_log",
    //Selector interface
    "selectorPlaceholder",
    "selectorMessage",
] as const;
type Option = typeof options[number];

export type MuppetsClientTranslationType = {
    [keys in Option]: string;
};