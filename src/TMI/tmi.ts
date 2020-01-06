import { IPlugin, IModLoaderAPI, ILogger } from "modloader64_api/IModLoaderAPI";
import { Client, Options } from 'tmi.js';
import fs from 'fs';
import { bus, EventHandler } from "modloader64_api/EventHandler";
import http from 'http';

class tmi implements IPlugin {

    ModLoader!: IModLoaderAPI;
    pluginName?: string | undefined;
    client!: Client;
    optsFile: string = "./TMI.json";
    dbFile: string = "./TMI_db.json";
    opts!: TwitchOpts;
    database: any = {};

    preinit(): void {
    }

    init(): void {
    }

    @EventHandler("TMI:onMessage")
    onMessage(evt: any) {
        if (evt.msg === "!points") {
            evt.reply("@" + evt.tags.username + ": You have " + this.database[evt.tags["user-id"]!] + " points.");
        }
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

    @EventHandler("TMI:onConfig")
    onConfig(evt: any) {
    }

    @EventHandler("TMI:onGetViewerList")
    onGetViewerList(list: any){
        for (let i = 0; i < list.chatters.viewers.length; i++){
            if (!this.database.hasOwnProperty(list.chatters.viewers[i])) {
                this.database[list.chatters.viewers[i]] = 0;
            }
            this.database[list.chatters.viewers[i]]+=10;
        }
    }

    postinit(): void {
        if (fs.existsSync(this.dbFile)) {
            this.database = JSON.parse(fs.readFileSync(this.dbFile).toString());
        } else {
            fs.writeFileSync(this.dbFile, JSON.stringify(this.database, null, 2));
        }
        setInterval(() => {
            fs.writeFileSync(this.dbFile, JSON.stringify(this.database, null, 2));
        }, 60 * 1000);
        setInterval(() => {
            var url = 'https://tmi.twitch.tv/group/user/' + this.opts.channels[0].toLowerCase() + '/chatters';

            http.get(url, (res)=>{
                var body = '';

                res.on('data', function (chunk) {
                    body += chunk;
                });

                res.on('end', function () {
                    var fbResponse = JSON.parse(body);
                    bus.emit("TMI:onGetViewerList", fbResponse);
                });
            }).on('error', function (e) {
                console.log("Got an error: ", e);
            });
        }, 60 * 1000);
        if (fs.existsSync(this.optsFile)) {
            this.opts = JSON.parse(fs.readFileSync(this.optsFile).toString());
            this.client = Client(this.opts);
            this.client.connect();
            bus.emit("TMI:onConfig", {
                say: (msg: string) => {
                    for (let i = 0; i < this.opts.channels.length; i++) {
                        this.client.say(this.opts.channels[i], msg);
                    }
                },
                reply: (msg: string) => {
                    for (let i = 0; i < this.opts.channels.length; i++) {
                        this.client.say(this.opts.channels[i], msg);
                    }
                },
                whisper: (username: string, msg: string) => {
                    this.client.whisper(username, msg);
                }
            });
            this.client.on('message', (channel, tags, message, self) => {
                if (self) return;
                if (!this.database.hasOwnProperty(tags["username"]!)) {
                    this.database[tags["username"]!] = 0;
                }
                let evt: any = {
                    msg: message.toLowerCase(), tags: tags, points: 1,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(tags.username!, msg);
                    }
                };
                bus.emit("TMI:onMessage", evt);
                this.database[tags["username"]!] += evt.points;
            });
            this.client.on("cheer", (channel, tags, message) => {
                if (!this.database.hasOwnProperty(tags["username"]!)) {
                    this.database[tags["username"]!] = 0;
                }
                let evt: any = {
                    msg: message.toLowerCase(), tags: tags, points: 0,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(tags.username!, msg);
                    }
                };
                bus.emit("TMI:onCheer", evt);
                this.database[tags["username"]!] += evt.points;
            });
            this.client.on("resub", (channel, username, months, message, tags, methods) => {
                if (!this.database.hasOwnProperty(tags["username"]!)) {
                    this.database[tags["username"]!] = 0;
                }
                let evt: any = {
                    msg: message.toLowerCase(), username: username, points: 0, tags: tags, method: methods, months: months,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(tags.username!, msg);
                    }
                };
                bus.emit("TMI:onResub", evt);
                this.database[tags["username"]!] += evt.points;
            });
            this.client.on("subgift", (channel, username, streakMonths, recipient, methods, tags) => {
                if (!this.database.hasOwnProperty(tags["username"]!)) {
                    this.database[tags["username"]!] = 0;
                }
                let evt: any = {
                    msg: "", tags: tags, gifter: username, points: 0, recipient: recipient, method: methods, streak: streakMonths,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(tags.username!, msg);
                    }
                };
                bus.emit("TMI:onGiftsub", evt);
                this.database[tags["username"]!] += evt.points;
            });
            this.client.on("submysterygift", (channel, username, numbOfSubs, methods, tags) => {
                if (!this.database.hasOwnProperty(tags["username"]!)) {
                    this.database[tags["username"]!] = 0;
                }
                let evt: any = {
                    msg: "", tags: tags, gifter: username, points: 0, num: numbOfSubs, method: methods,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(tags.username!, msg);
                    }
                };
                bus.emit("TMI:onMysterysub", evt);
                this.database[tags["username"]!] += evt.points;
            });
            this.client.on("subscription", (channel, username, method, message, tags) => {
                if (!this.database.hasOwnProperty(tags["username"]!)) {
                    this.database[tags["username"]!] = 0;
                }
                let evt: any = {
                    msg: message, username: username, points: 0, tags: tags, method: method,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(tags.username!, msg);
                    }
                };
                bus.emit("TMI:onSub", evt);
                this.database[tags["username"]!] += evt.points;
            });
            this.client.on("hosted", (channel, username, viewers, autohost) => {
                bus.emit("TMI:onHost", {
                    msg: "", username: username, viewers: viewers, autohost: autohost,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(username, msg);
                    }
                });
            });
            this.client.on("raided", (channel, username, viewers) => {
                bus.emit("TMI:onRaid", {
                    msg: "", username: username, viewers: viewers,
                    reply: (msg: string) => {
                        this.client.say(channel, msg);
                        this.ModLoader.logger.info(msg);
                    },
                    whisper: (msg: string) => {
                        this.client.whisper(username, msg);
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