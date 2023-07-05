import type { ModalSubmitInteraction, ToriClient } from '#structs'
import type { ModalInteraction } from '#types/interaction'
import { type APIEmbed, MessageFlags } from '@discordjs/core'

export const AddTagModal: ModalInteraction = {
    async handle(interaction: ModalSubmitInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const { keyword, aliases, content } = interaction.values()
        const trimmedAliases = aliases
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length)
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }
        const doEmptyAliasesExist = aliases.length
            ? trimmedAliases?.some(trimmedAlias => !trimmedAlias.length)
            : false

        if (doEmptyAliasesExist) {
            embed.description = 'Some of the provided aliases do not contain any characters. Please try again and ensure that all keywords contain at least one character.'
            
            await interaction.updateReply({ embeds: [embed] })
            return
        }

        const isInvalidTagInput = await client.database.isInvalidTagInput(interaction.guildId, keyword, trimmedAliases)

        if (isInvalidTagInput) {
            embed.description = 'The provided keyword (or some of the aliases) are already used.'
            
            await interaction.updateReply({ embeds: [embed] })
            return
        }

        const tag = await client.database.insertTag(interaction.guildId, keyword, trimmedAliases, content)

        client.cache.guilds.get(interaction.guildId).tags.insert(tag)
        embed.description = 'Added tag!'

        await interaction.updateReply({ embeds: [embed] })
    }
}