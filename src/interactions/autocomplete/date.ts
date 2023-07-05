import type { ApplicationCommandAutocompleteInteraction, ToriClient } from '#structs'
import { GameLocation } from '#types/cache'
import type { AutocompleteInteraction } from '#types/interaction'
import type { APIApplicationCommandOptionChoice } from '@discordjs/core'

export const DateAutocomplete: AutocompleteInteraction = {
    getChoices(interaction: ApplicationCommandAutocompleteInteraction, client: ToriClient): APIApplicationCommandOptionChoice<string>[] {
        const guild = client.cache.guilds.get(interaction.guildId)
        const list: GameLocation[] = interaction.name === 'online'
            ? ['ONLINE']
            : ['PEEL', 'TORONTO', 'WATERLOO', 'YORK']
        const valueLowercased = interaction.getFocusedOption().value.toString().toLowerCase()
        const choices: APIApplicationCommandOptionChoice<string>[] = []

        for (const [date, state] of guild.games.entries())
            for (const location of list)
                if (state[location]) {
                    const name = (location === 'ONLINE')
                        ? date
                        : `${ date } (${ location.charAt(0).toUpperCase() }${ location.slice(1).toLowerCase() })`
                    const value = (location === 'ONLINE')
                        ? date
                        : `${ date }_${ location }`

                    if (name.includes(valueLowercased))
                        choices.push({ name, value })
                }

                if (choices.length >= 25)
                    return choices

        return choices
    }
}