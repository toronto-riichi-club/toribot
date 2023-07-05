import type { Cache } from '#structs'
import type { APIGuildChannel, Channel } from '#types/cache'

export class ChannelCache {
    #cache: Cache
    #items: Map<bigint, Channel> = new Map()

    constructor(cache: Cache) {
        this.#cache = cache
    }

    get(key: bigint): Channel | null {
        return this.#items.get(key) ?? null
    }

    insert(channel: APIGuildChannel & { guild_id: string }) {
        const id = BigInt(channel.id)
        const guildId = BigInt(channel.guild_id)
        const guild = this.#cache.guilds.get(guildId)

        if (guild)
            guild.channelIds.add(id)

        this.#items.set(
            id,
            {
                flags: channel?.flags ?? null,
                guildId,
                id,
                parentId: channel?.parent_id
                    ? BigInt(channel.parent_id)
                    : null,
                permissionOverwrites: channel?.permission_overwrites ?? [],
                position: channel?.position ?? null,
                type: channel.type
            }
        )
    }

    remove(key: bigint) {
        const channel = this.get(key)

        if (channel) {
            this.#items.delete(key)
            this.#cache.guilds.get(channel.guildId).channelIds.delete(key)
        } 
    }
}