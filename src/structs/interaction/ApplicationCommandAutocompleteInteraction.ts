import type { AutocompleteFocusedOption } from '#types/interaction'
import {
    type APIApplicationCommandAutocompleteGuildInteraction,
    type APIApplicationCommandInteractionDataIntegerOption,
    type APIApplicationCommandInteractionDataOption,
    ApplicationCommandOptionType,
    InteractionResponseType,
    Routes
} from '@discordjs/core'
import type { REST } from '@discordjs/rest'

export class ApplicationCommandAutocompleteInteraction {
    readonly guildId: bigint
    protected readonly id: string
    readonly name: string
    protected readonly options: APIApplicationCommandInteractionDataOption[]
    protected readonly rest: REST
    readonly subcommand: string | null
    protected readonly token: string

    constructor(rest: REST, interaction: APIApplicationCommandAutocompleteGuildInteraction ) {
        this.guildId = BigInt(interaction.guild_id)
        this.id = interaction.id
        this.name = interaction.data.name
        this.options = interaction.data.options
        this.rest = rest
        this.token = interaction.token

        if (this.options[0]?.type === ApplicationCommandOptionType.Subcommand) {
            this.subcommand = this.options[0].name
            this.options = this.options[0].options ?? []
        }
    }

    async autocomplete(choices: APIApplicationCommandInteractionDataIntegerOption[]) {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data: {
                        choices
                    },
                    type: InteractionResponseType.ApplicationCommandAutocompleteResult
                }
            }
        )
    }

    getFocusedOption(): AutocompleteFocusedOption {
        const option = this.options.find(o => ('focused' in o) && Boolean(o.focused)) as APIApplicationCommandInteractionDataIntegerOption

        return option
    }
}