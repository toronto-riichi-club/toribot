import type { ModalSubmitInteraction, ToriClient } from '#structs'
import type { ModalInteraction } from '#types/interaction'
import { type APIEmbed, MessageFlags } from '@discordjs/core'

export const UpdateTagModal: ModalInteraction = {
    async handle(interaction: ModalSubmitInteraction, client: ToriClient): Promise<void> {
        await interaction.defer({ flags: MessageFlags.Ephemeral })

        const { aliases, content } = interaction.values()
        const trimmedAliases = aliases
            .split(',')
            .map(s => s.trim())
        const embed: Partial<APIEmbed> = { color: 0xF8F8FF }
        const doEmptyAliasesExist = trimmedAliases?.some(trimmedAlias => !trimmedAlias.length) ?? false

        if (doEmptyAliasesExist) {
            embed.description = 'Some of the provided aliases do not contain any characters. Please try again and ensure that all keywords contain at least one character.'
            
            await interaction.updateReply({ embeds: [embed] })
            return
        }

        const keyword = interaction.data.custom_id.split('-')[2]
        const isInvalidTagInput = await client.database.isInvalidTagInput(interaction.guildId, keyword, trimmedAliases, true)

        if (isInvalidTagInput) {
            embed.description = 'Some of the provided aliases are already used.'
            
            await interaction.updateReply({ embeds: [embed] })
            return
        }

        const guildTags = client.cache.guilds.get(interaction.guildId).tags
        const oldTag = await client.database.readTag(interaction.guildId, keyword)
        const newTag = await client.database.updateTag(interaction.guildId, keyword, { aliases: trimmedAliases, content })
        
        guildTags.remove(oldTag)
        guildTags.insert(newTag)
        embed.description = 'Updated tag!'

        await interaction.updateReply({ embeds: [embed] })
    }
}