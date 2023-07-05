import {
    type Cache,
    GameCache,
    MemberCache,
    TagCache
} from '#structs'
import type { Guild } from '#types/cache'
import type { DatabaseGuildData } from '#types/database'
import { isGuildChannel } from '#utility'
import type { GatewayGuildCreateDispatchData } from '@discordjs/core'
import dayjs from 'dayjs'

export class GuildCache {
    #cache: Cache
    #items: Map<bigint, Guild> = new Map()

    constructor(cache: Cache) {
        this.#cache = cache
    }

    get(key: bigint): Guild | null {
        return this.#items.get(key) ?? null
    }

    insert(gatewayGuildData: GatewayGuildCreateDispatchData, databaseGuildData: DatabaseGuildData) {
        const { channels, id: guild_id, members, name, roles } = gatewayGuildData
        const { inPersonGames, onlineGames, tags } = databaseGuildData
        const guildId = BigInt(guild_id)
        const channelIds: Set<bigint> = new Set()
        const roleIds: Set<bigint> = new Set()
        const gameCache = new GameCache()
        const memberCache = new MemberCache(this.#cache)
        const tagCache = new TagCache()

        for (const channel of channels) {
            if (!isGuildChannel(channel))
                continue

            this.#cache.channels.insert({ ...channel, guild_id })
            channelIds.add(BigInt(channel.id))
        }

        for (const inPersonGame of inPersonGames)
            gameCache.insert(dayjs(inPersonGame.date).format('YYYY-MM-DD'), inPersonGame.location)

        for (const member of members)
            memberCache.insert({
                communication_disabled_until: member.communication_disabled_until,
                guild_id,
                roles: member.roles,
                user: member.user
            })

        for (const onlineGame of onlineGames)
            gameCache.insert(dayjs(onlineGame.date).format('YYYY-MM-DD'), 'ONLINE')

        for (const role of roles) {
            this.#cache.roles.insert(guildId, role)
            roleIds.add(BigInt(role.id))
        }

        for (const tag of tags)
            tagCache.insert(tag)
    
        this.#cache.unavailableGuilds.remove(guildId)
        this.#items.set(
            guildId,
            {
                channelIds,
                games: gameCache,
                id: guildId,
                members: memberCache,
                name,
                roleIds,
                tags: tagCache
            }
        )
    }

    remove(key: bigint, unavailable: boolean) {
        this.#items.delete(key)

        if (unavailable)
            this.#cache.unavailableGuilds.insert(key)
    }

    update(guildId: bigint, name: string) {
        const guild = this.get(guildId)

        if (guild)
            guild.name = name
    }
}