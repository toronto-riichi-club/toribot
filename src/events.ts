import {
    autocompletes,
    commands,
    modals
} from '#interactions'
import {
    ApplicationCommandAutocompleteInteraction,
    ApplicationCommandInteraction,
    ModalSubmitInteraction,
    type ToriClient
} from '#structs'
import {
    isApplicationCommandAutocompleteInteraction,
    isChatInputApplicationCommandInteraction,
    isGuildChannel,
    isModalSubmitInteraction
} from '#utility'
import {
    type APIEmbed,
    GatewayDispatchEvents,
    InteractionResponseType,
    MessageFlags,
    Routes
} from '@discordjs/core'
import { WebSocketShardEvents } from '@discordjs/ws'
import { isGuildInteraction } from 'discord-api-types/utils'

export async function handleEvents(client: ToriClient) {
    client.on(GatewayDispatchEvents.ChannelCreate, payload => {
        const channel = payload.data

        if (!isGuildChannel(channel))
            return

        client.cache.channels.insert(channel)
    })
    client.on(GatewayDispatchEvents.ChannelDelete, payload => client.cache.channels.remove(BigInt(payload.data.id)))
    client.on(GatewayDispatchEvents.ChannelUpdate, payload => {
        const channel = payload.data

        if (!isGuildChannel(channel))
            return

        client.cache.channels.insert(channel)
    })
    client.on(GatewayDispatchEvents.GuildCreate, async payload => {
        const gatewayGuildData = payload.data
        const guildId = BigInt(gatewayGuildData.id)
        const databaseGuildData = await client.database.readGuild(guildId)

        await client.database.insertGuild(guildId)

        client.cache.guilds.insert(gatewayGuildData, databaseGuildData)
    })
    client.on(GatewayDispatchEvents.GuildDelete, payload => client.cache.guilds.remove(BigInt(payload.data.id), payload.data.unavailable))
    client.on(GatewayDispatchEvents.GuildMemberAdd, payload => {
        const member = payload.data
        const guildId = BigInt(member.guild_id)
        const guild = client.cache.guilds.get(guildId)

        if (guild)
            guild.members.insert({
                communication_disabled_until: member.communication_disabled_until,
                guild_id: member.guild_id,
                roles: member.roles,
                user: member.user
            })
    })
    client.on(GatewayDispatchEvents.GuildMemberRemove, payload => {
        const userId = BigInt(payload.data.user.id)
        const guildId = BigInt(payload.data.guild_id)
        const guild = client.cache.guilds.get(guildId)

        if (guild)
            guild.members.remove(userId)
    })
    client.on(GatewayDispatchEvents.GuildMemberUpdate, payload => {
        const member = payload.data
        const guildId = BigInt(member.guild_id)
        const guild = client.cache.guilds.get(guildId)

        if (guild)
            guild.members.update(member)
    })
    client.on(GatewayDispatchEvents.GuildMembersChunk, payload => {
        const guildId = BigInt(payload.data.guild_id)
        const guild = client.cache.guilds.get(guildId)

        if (guild) {
            for (const member of payload.data.members)
                guild.members.insert({
                    communication_disabled_until: member.communication_disabled_until,
                    guild_id: payload.data.guild_id,
                    roles: member.roles,
                    user: member.user
                })
        }
    })
    client.on(GatewayDispatchEvents.GuildRoleCreate, payload => client.cache.roles.insert(BigInt(payload.data.guild_id), payload.data.role))
    client.on(GatewayDispatchEvents.GuildRoleDelete, payload => client.cache.roles.remove(BigInt(payload.data.role_id)))
    client.on(GatewayDispatchEvents.GuildRoleUpdate, payload => client.cache.roles.insert(BigInt(payload.data.guild_id), payload.data.role))
    client.on(GatewayDispatchEvents.GuildUpdate, payload => client.cache.guilds.update(BigInt(payload.data.id), payload.data.name))
    client.on(GatewayDispatchEvents.InteractionCreate, async payload => {
        const p = payload.data

        if (!isGuildInteraction(p))
            return
        if (isApplicationCommandAutocompleteInteraction(p)) {
            const interaction = new ApplicationCommandAutocompleteInteraction(client.rest, p)
            const { name } = interaction.getFocusedOption()
            const autocomplete = autocompletes.get(name)
            const choices = autocomplete.getChoices(interaction, client)

            await interaction.autocomplete(choices)
        } else if (isChatInputApplicationCommandInteraction(p)) {
            const interaction = new ApplicationCommandInteraction(client.rest, p)
            const command = commands.get(p.data.name)
            const guild = client.cache.guilds.get(interaction.guildId)

            for (const resolvedMemberId of Object.keys(interaction.resolved?.members ?? {})) {
                const { communication_disabled_until, roles } = interaction.resolved.members[resolvedMemberId]
                const user = interaction.resolved.users[resolvedMemberId]

                guild.members.insert(
                    {
                        communication_disabled_until,
                        guild_id: payload.data.guild_id,
                        roles,
                        user
                    },
                    false
                )
            }

            await command.run(interaction, client)
        } else if (isModalSubmitInteraction(p)) {
            const interaction = new ModalSubmitInteraction(client.rest, p)
            const key = [...modals.keys()].find(key => p.data.custom_id.startsWith(key))
            const modal = modals.get(key)

            await modal.handle(interaction, client)
        } else {
            const embed: Partial<APIEmbed> = { color: 0xF8F8FF, description: 'Unknown interaction' }

            await client.rest.post(
                Routes.interactionCallback(p.id, p.token),
                {
                    auth: false,
                    body: {
                        data: { embeds: [embed], flags: MessageFlags.Ephemeral },
                        type: InteractionResponseType.ChannelMessageWithSource
                    }
                }
            )
        }
    })
    client.on(GatewayDispatchEvents.Ready, async payload => {
        const { user } = payload.data
        const unavailableGuildIds = payload.data.guilds.map(guild => BigInt(guild.id))
        const commandJSON = [...commands.values()].map(command => command.getCommand())

        client.id = BigInt(user.id)

        for (const unavailableGuildId of unavailableGuildIds)
            client.cache.unavailableGuilds.insert(unavailableGuildId)

        if (process.env.NODE_ENV === 'production') {
            await client
                .api
                .applicationCommands
                .bulkOverwriteGlobalCommands(client.id.toString(), commandJSON)
            await client
                .api
                .applicationCommands
                .bulkOverwriteGuildCommands(client.id.toString(), process.env.DEVELOPMENT_GUILD_ID, [])
        } else {
            await client
                .api
                .applicationCommands
                .bulkOverwriteGlobalCommands(client.id.toString(), [])
            await client
                .api
                .applicationCommands
                .bulkOverwriteGuildCommands(client.id.toString(), process.env.DEVELOPMENT_GUILD_ID, commandJSON)
        }

        console.log(`${ user.username }#${ user.discriminator } is online!`)
    })
    client.ws.on(WebSocketShardEvents.HeartbeatComplete, payload => {
        client.ping = payload.latency
    })
}