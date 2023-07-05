import type { ApplicationCommandAutocompleteInteraction, ToriClient } from '#structs'
import type { AutocompleteInteraction } from '#types/interaction'
import type { APIApplicationCommandOptionChoice } from '@discordjs/core'

export const QueryAutocomplete: AutocompleteInteraction = {
    getChoices(interaction: ApplicationCommandAutocompleteInteraction, client: ToriClient): APIApplicationCommandOptionChoice<string>[] {
        const valueLowercased = interaction.getFocusedOption().value.toString().toLowerCase()
        const guild = client.cache.guilds.get(interaction.guildId)
        const choices: APIApplicationCommandOptionChoice<string>[] = []

        for (const phrase of guild.tags.items()) {
            if (phrase.toLowerCase().includes(valueLowercased))
                choices.push({ name: phrase, value: phrase })
                
            if (choices.length > 25)
                break
        }

        return choices
    }
}