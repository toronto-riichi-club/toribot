import type { Cache } from '#structs'
import type { Member, MinimumGuildMember } from '#types/cache'
import type { GatewayGuildMemberUpdateDispatchData } from '@discordjs/core'

export class MemberCache {
    #cache: Cache
    #items: Map<bigint, Member> = new Map()

    constructor(cache: Cache) {
        this.#cache = cache
    }

    get(key: bigint): Member | null {
        return this.#items.get(key) ?? null
    }

    insert(member: MinimumGuildMember, shouldIncrementMutualGuilds = true) {
        const id = BigInt(member.user.id)

        this.#items.set(
            id,
            {
                communicationDisabledUntil: member.communication_disabled_until
                    ? new Date(member.communication_disabled_until)
                    : null,
                guildId: BigInt(member.guild_id),
                id,
                roleIds: member.roles.map(BigInt)
            }
        )
        this.#cache.users.insert(member.user, shouldIncrementMutualGuilds)
    }

    remove(key: bigint) {
        const member = this.get(key)

        if (member) {
            this.#items.delete(key)
            this.#cache.users.decrementMutualGuilds(key)
        }
    }

    update(member: GatewayGuildMemberUpdateDispatchData) {
        const id = BigInt(member.user.id)
        const cachedMember = this.get(id)

        if (cachedMember) {
            cachedMember.communicationDisabledUntil = member.communication_disabled_until
                ? new Date(member.communication_disabled_until)
                : null
            cachedMember.roleIds = member.roles.map(BigInt)
        }
    }
}