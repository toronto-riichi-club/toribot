import { commands, modals } from '#interactions'
import {
    BaseInteraction,
    ChatInputCommandInteraction,
    ModalInteraction,
    type ToribotClient,
} from '#structs'
import {
    type APIChatInputApplicationCommandInteractionData,
    type APIEmbed,
    type GatewayInteractionCreateDispatchData,
    MessageFlags,
    PermissionFlagsBits,
    InteractionType,
    type WithIntrinsicProps,
} from '@discordjs/core'

export async function handleInteractionCreate(client: ToribotClient, payload: WithIntrinsicProps<GatewayInteractionCreateDispatchData>) {
    const {
        application_id: applicationId,
        app_permissions,
        data,
        guild_id: guildId,
        id,
        member,
        token,
        type,
    } = payload.data
    const baseOptions = { applicationId, id, rest: client.rest, token }
    const baseInteraction = new BaseInteraction(baseOptions)
    const embed: Partial<APIEmbed> = { color: 0xF8F8FF }

    if (!guildId) {
        embed.description = 'toribot only works in guilds.'

        await baseInteraction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
        return
    }

    const permissions = BigInt(app_permissions)
    const missingPermissions = []

    if ((permissions & PermissionFlagsBits.SendMessages) !== PermissionFlagsBits.SendMessages)
        missingPermissions.push("**Send Messages**")
    if ((permissions & PermissionFlagsBits.EmbedLinks) !== PermissionFlagsBits.EmbedLinks)
        missingPermissions.push("**Embed Links**")

    if (missingPermissions.length) {
        embed.description = `toribot requires the ${ new Intl.ListFormat().format(missingPermissions) } ${ missingPermissions.length === 1 ? 'permission': 'permissions' } in order to run this command.`

        await baseInteraction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
        return
    }

    switch (type) {
        case InteractionType.ApplicationCommand:
        case InteractionType.ApplicationCommandAutocomplete: {
            const interaction = new ChatInputCommandInteraction({
                data: data as APIChatInputApplicationCommandInteractionData,
                username: member.user.username,
                ...baseOptions
            })
            const { name } = interaction.data
            const command = commands.get(name)

            if (!command) {
                embed.description = `I have received an unknown command with the name "${ name }".`

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            } else
                await command.run(client, interaction)

            break
        }
        case InteractionType.ModalSubmit: {
            const interaction = new ModalInteraction({
                data,
                username: member.user.username,
                ...baseOptions
            })
            const key = interaction.data.custom_id.split(':')[0]
            const modal = modals.get(key)

            if (!modal) {
                embed.description = `I have received an unknown modal with the name "${ key }".`

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            } else
                await modal.handle(client, interaction)

            break
        }
        default: {
            embed.description = 'I have received an unknown interaction.'

            await baseInteraction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            break
        }
    }
}