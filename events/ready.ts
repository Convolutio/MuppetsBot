import { MyEventType } from "../models/event.type";

const event : MyEventType = {
    name:'ready',
    once:true,
    execute() {
        console.log("Ready !")
    }
}

export = event;