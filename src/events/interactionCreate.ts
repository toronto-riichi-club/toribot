import { commands, modals } from '#interactions'
import {
    BaseInteraction,
    ChatInputCommandInteraction,
    ModalInteraction,
    type ToribotClient,
} from '#structs'
import type { BaseInteractionOptions } from '#types/interaction'
import {
    type APIEmbed,
    type GatewayInteractionCreateDispatchData,
    MessageFlags,
    InteractionType,
    type WithIntrinsicProps,
    ApplicationCommandType,
} from '@discordjs/core'

export async function handleInteractionCreate(client: ToribotClient, payload: WithIntrinsicProps<GatewayInteractionCreateDispatchData>) {
    const {
        application_id: applicationId,
        data,
        guild_id: guildId,
        id,
        member,
        token,
        type,
    } = payload.data
    const baseOptions: BaseInteractionOptions = {
        applicationId,
        id,
        rest: client.rest,
        token
    }
    const baseInteraction = new BaseInteraction(baseOptions)
    const embed: Partial<APIEmbed> = { color: 0xF8F8FF }

    if (!guildId) {
        embed.description = 'toribot only works in guilds.'

        await baseInteraction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
        return
    }

    switch (type) {
        case InteractionType.ApplicationCommand:
        case InteractionType.ApplicationCommandAutocomplete: {
            if (data.type !== ApplicationCommandType.ChatInput) {
                embed.description = `I have received an unknown command with the name "${ data.name }".`

                await baseInteraction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            } else {
                const interaction = new ChatInputCommandInteraction({
                    data,
                    guildId,
                    ...baseOptions
                })
                const { name } = interaction
                const command = commands.get(name)

                if (!command) {
                    embed.description = `I have received an unknown command with the name "${ name }".`

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
                } else
                    await command.run(client, interaction)
            }

            break
        }
        case InteractionType.ModalSubmit: {
            const interaction = new ModalInteraction({
                data,
                username: member.user.username,
                ...baseOptions
            })
            const key = interaction.customId.split(':')[0]
            const modal = modals.get(key)

            if (!modal) {
                embed.description = `I have received an unknown modal with the name "${ key }".`

                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            } else
                await modal.run(client, interaction)

            break
        }
        default: {
            embed.description = 'I have received an unknown interaction.'

            await baseInteraction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral })
            break
        }
    }
}