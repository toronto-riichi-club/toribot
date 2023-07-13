import { Cache, Database } from '#structs'
import { BOT_TOKEN } from '#utility'
import { Client, GatewayIntentBits } from '@discordjs/core'
import { REST } from '@discordjs/rest'
import { WebSocketManager } from '@discordjs/ws'

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN)
const gateway = new WebSocketManager({
	token: BOT_TOKEN,
	intents: GatewayIntentBits.Guilds,
	rest,
})

export class ToribotClient extends Client {
    readonly cache: Cache
    readonly database: Database

    public constructor() {
        super({ rest, gateway })

        this.cache = new Cache()
        this.database = new Database()
    }

    public async login() {
        await gateway.connect()
    }
}