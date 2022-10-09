import axios from "axios";
import {database, Quote} from "../models/db_classes";

(async () => {
    const url = "https://cdn.discordapp.com/attachments/740512405108424787/1028435489025429514/Dream_TradingCard_resize.jpg"

    const res = await axios.get<ArrayBuffer>(url, {responseType:"arraybuffer"});
    await Quote.create({quote:"Hello", author_whkId:'1028419434370580521', attachment:res.data})
    const q = await Quote.findOne({where:{quote:"Hello"}, attributes:["attachment"]});
    console.log(q?.attachment)
})()