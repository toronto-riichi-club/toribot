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
    public constructor() {
        super({ rest, gateway })
    }

    public async login() {
        await gateway.connect()
    }
}