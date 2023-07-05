import type { Cache } from '#structs'
import type { Role } from '#types/cache'
import type { APIRole } from '@discordjs/core'

export class RoleCache {
    #cache: Cache
    #items: Map<bigint, Role> = new Map()

    constructor(cache: Cache) {
        this.#cache = cache
    }

    get(id: bigint): Role | null {
        return this.#items.get(id) ?? null
    }

    insert(guildId: bigint, role: APIRole) {
        const id = BigInt(role.id)
        const guild = this.#cache.guilds.get(guildId)

        if (guild)
            guild.roleIds.add(id)

        this.#items.set(
            id,
            {
                guildId,
                id,
                permissions: role.permissions,
                position: role.position
            }
        )
    }

    remove(key: bigint) {
        const role = this.get(key)

        if (role) {
            this.#items.delete(key)
            this.#cache.guilds.get(role.guildId).channelIds.delete(key)
        } 
    }
}