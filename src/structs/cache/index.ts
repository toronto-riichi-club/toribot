import {
    ChannelCache,
    GuildCache,
    RoleCache,
    UnavailableGuildCache,
    UserCache
} from '#structs'

export class Cache {
    channels = new ChannelCache(this)
    guilds = new GuildCache(this)
    roles = new RoleCache(this)
    unavailableGuilds = new UnavailableGuildCache()
    users = new UserCache()
}