import { IPlugin, IModLoaderAPI, ILogger } from "modloader64_api/IModLoaderAPI";
import { Client, Options } from 'tmi.js';
import fs from 'fs';
import { bus, EventHandler } from "modloader64_api/EventHandler";

class tmi implements IPlugin{

    ModLoader!: IModLoaderAPI; 
    pluginName?: string | undefined;
    client!: Client;
    optsFile: string = "./TMI.json";

    preinit(): void {
    }

    init(): void {
    }

    @EventHandler("TMI:onMessage")
    onMessage(evt: any){
    }

    postinit(): void {
        if (fs.existsSync(this.optsFile)){
            let opts: TwitchOpts = JSON.parse(fs.readFileSync(this.optsFile).toString());
            this.client = Client(opts);
            this.client.connect();
            this.client.on('message', (channel, tags, message, self) => {
                if(self) return;
                bus.emit("TMI:onMessage", {msg: message.toLowerCase(), tags: tags, reply: (msg: string)=>{
                    this.client.say(channel, msg);
                }});
            });
        }else{
            this.ModLoader.logger.error("[TMI]: THIS MOD WILL NOT FUNCTION UNTIL YOU CLOSE MODLOADER AND EDIT TMI.JSON!");
            fs.writeFileSync(this.optsFile, JSON.stringify(new TwitchOpts("", "", []), null, 2));
        }
    }

    onTick(frame?: number | undefined): void {
    }

}

module.exports = tmi;

class TwitchOpts implements Options{
    options: any = {debug: true};
    identity: any = {
        username: "",
        password: ""
    };
    channels: Array<string> = [];

    constructor(username: string, password: string, channel: Array<string>){
        this.identity["username"] = username;
        this.identity["password"] = password;
        this.channels = channel;
    }
}