import { Cache, Database } from '#structs'
import { BOT_TOKEN } from '#utility'
import {
    Client,
    GatewayIntentBits,
    type RESTGetAPIGuildMemberResult,
    Routes
} from '@discordjs/core'
import { REST } from '@discordjs/rest'
import { WebSocketManager } from '@discordjs/ws'

const rest = new REST().setToken(BOT_TOKEN)
const ws = new WebSocketManager({
	intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMembers,
	rest,
    token: BOT_TOKEN
})

export class ToriClient extends Client {
    readonly cache: Cache
    readonly database: Database
    id?: bigint
    ping?: number

    constructor() {
        super({ rest, ws })

        this.cache = new Cache()
        this.database = new Database()
    }

    async fetchMember(guildId: bigint, id: string): Promise<void> {
        const guild = this.cache.guilds.get(guildId)

        if (!guild)
            return
            
        const idBigInt = BigInt(id)

        if (guild.members.get(idBigInt))
            return

        const guildIdString = guildId.toString()
        const member = await this.rest.get(Routes.guildMember(guildIdString, id)) as RESTGetAPIGuildMemberResult

        guild.members.insert({
            communication_disabled_until: member.communication_disabled_until,
            guild_id: guildIdString,
            roles: member.roles,
            user: member.user
        })
    }

    async login() {
        await ws.connect()
    }
}