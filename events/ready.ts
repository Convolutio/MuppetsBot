import MyEventBuilder from "../models/event.type";

const event : MyEventBuilder = async() => {
    return {
        name:'ready',
        once:true,
        execute() {
            console.log("Ready !")
        }
    }
}

export = event;