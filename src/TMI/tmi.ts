import { IPlugin, IModLoaderAPI, ILogger } from "modloader64_api/IModLoaderAPI";
import { Client, Options } from 'tmi.js';
import fs from 'fs';
import { bus, EventHandler } from "modloader64_api/EventHandler";

class tmi implements IPlugin {

    ModLoader!: IModLoaderAPI;
    pluginName?: string | undefined;
    client!: Client;
    optsFile: string = "./TMI.json";

    preinit(): void {
    }

    init(): void {
    }

    @EventHandler("TMI:onMessage")
    onMessage(evt: any) {
    }

    @EventHandler("TMI:onCheer")
    onCheer(evt: any) {
    }

    @EventHandler("TMI:onResub")
    onResub(evt: any) {
    }

    @EventHandler("TMI:onGiftsub")
    onGiftSub(evt: any) {
    }

    @EventHandler("TMI:onMysterysub")
    onMysterySub(evt: any) {
    }

    @EventHandler("TMI:onSub")
    onSub(evt: any) {
    }

    @EventHandler("TMI:onHost")
    onHost(evt: any) {
    }

    @EventHandler("TMI:onRaid")
    onRaid(evt: any) {
    }

    postinit(): void {
        if (fs.existsSync(this.optsFile)) {
            let opts: TwitchOpts = JSON.parse(fs.readFileSync(this.optsFile).toString());
            this.client = Client(opts);
            this.client.connect();
            this.client.on('message', (channel, tags, message, self) => {
                if (self) return;
                bus.emit("TMI:onMessage", {
                    msg: message.toLowerCase(), tags: tags, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("cheer", (channel, tags, message) => {
                bus.emit("TMI:onCheer", {
                    msg: message.toLowerCase(), tags: tags, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("resub", (channel, username, months, message, tags, methods) => {
                bus.emit("TMI:onResub", {
                    msg: message.toLowerCase(), username: username, tags: tags, method: methods, months: months, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("subgift", (channel, username, streakMonths, recipient, methods, tags) => {
                bus.emit("TMI:onGiftsub", {
                    msg: "", tags: tags, gifter: username, recipient: recipient, method: methods, streak: streakMonths, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("submysterygift", (channel, username, numbOfSubs, methods, tags) => {
                bus.emit("TMI:onMysterysub", {
                    msg: "", tags: tags, gifter: username, num: numbOfSubs, method: methods, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("subscription", (channel, username, method, message, tags) => {
                bus.emit("TMI:onSub", {
                    msg: message, username: username, tags: tags, method: method, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("hosted", (channel, username, viewers, autohost) => {
                bus.emit("TMI:onHost", {
                    msg: "", username: username, viewers: viewers, autohost: autohost, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
            this.client.on("raided", (channel, username, viewers) => {
                bus.emit("TMI:onRaid", {
                    msg: "", username: username, viewers: viewers, reply: (msg: string) => {
                        this.client.say(channel, msg);
                    }
                });
            });
        } else {
            this.ModLoader.logger.error("[TMI]: THIS MOD WILL NOT FUNCTION UNTIL YOU CLOSE MODLOADER AND EDIT TMI.JSON!");
            fs.writeFileSync(this.optsFile, JSON.stringify(new TwitchOpts("", "", []), null, 2));
        }
    }

    onTick(frame?: number | undefined): void {
    }

}

module.exports = tmi;

class TwitchOpts implements Options {
    options: any = { debug: true };
    identity: any = {
        username: "",
        password: ""
    };
    channels: Array<string> = [];

    constructor(username: string, password: string, channel: Array<string>) {
        this.identity["username"] = username;
        this.identity["password"] = password;
        this.channels = channel;
    }
}