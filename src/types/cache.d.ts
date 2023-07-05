import type {
    GameCache,
    MemberCache,
    TagCache
} from '#structs'
import type {
    APIGuildCategoryChannel,
    APIGuildForumChannel,
    APIGuildMember,
    APIGuildStageVoiceChannel,
    APIGuildVoiceChannel,
    APINewsChannel,
    APIOverwrite,
    APITextChannel,
    APIThreadChannel,
    ChannelFlags,
    ChannelType,
    GatewayGuildMemberAddDispatchData,
    Permissions
} from '@discordjs/core'
import type { InPersonGameLocation } from '@prisma/client'

export type APIGuildChannel =
    | APIGuildCategoryChannel
    | APIGuildForumChannel
    | APIGuildStageVoiceChannel
    | APIGuildVoiceChannel
    | APINewsChannel
    | APITextChannel
    | APIThreadChannel

export type Channel = {
    flags: ChannelFlags | null
    guildId: bigint
    id: bigint
    parentId: bigint | null
    permissionOverwrites: APIOverwrite[]
    position: number
    type: Omit<ChannelType, ChannelType.DM | ChannelType.GroupDM>
}

export type GameLocation = InPersonGameLocation | 'ONLINE'

export type Guild = {
    channelIds: Set<bigint>
    games: GameCache
    id: bigint
    members: MemberCache
    name: string
    roleIds: Set<bigint>
    tags: TagCache
}

export type Member = {
    communicationDisabledUntil: Date | null
    guildId: bigint
    id: bigint
    roleIds: bigint[]
}

export type MinimumGuildMember = Required<Pick<
    APIGuildMember & { guild_id: string } | GatewayGuildMemberAddDispatchData,
    'communication_disabled_until' | 'guild_id' | 'roles' | 'user'
>>

export type Role = {
    guildId: bigint
    id: bigint
    permissions: Permissions
    position: number
}

export type User = {
    discriminator: string
    id: bigint
    mutualGuilds: number
    username: string
}