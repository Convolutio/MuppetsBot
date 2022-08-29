const options = [
    //commands names
    "characters",
    "quotes",
    "play",
    "add",
    "remove",
    "edit",
    //commands args
    "character",
    "content",
    "name",
    "url_avatar",
    "avatarFile",
    //commands description
    "play_description",
    "characterAdd_description",
    "characterRemove_description",
    "characterEdit_description",
    "quoteAdd_description",
    "quoteRemove_description",
    "quoteEdit_description",
    //args description
    "playCharacter_description",
    "playContent_description",
    //UI's logs
    "webhookAwaited_log",
    "noSavedQuote_error",
    "characterCreated_log",
    "characterEdited_log",
    "characterDeleted_log",
    "invalidAvatar_error",
    //Selector interface
    "selectorTitle",
    "selectorPlaceholder",
    "selectorMessage"
] as const;
type Option = typeof options[number];


export type MuppetsClientTranslationType = {
    [keys in Option]: string;
};