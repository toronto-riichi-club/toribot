import { BaseInteraction } from '#structs'
import type { AutocompleteFocusedOption, ChatInputCommandInteractionOptions } from '#types/interaction'
import {
    type APIApplicationCommandOptionChoice,
    type APIChatInputApplicationCommandInteractionData,
    type APIModalInteractionResponseCallbackData,
    InteractionResponseType,
    Routes
} from '@discordjs/core'

export class ChatInputCommandInteraction extends BaseInteraction {
    #data: APIChatInputApplicationCommandInteractionData
    #guildId: string

    constructor(options: ChatInputCommandInteractionOptions) {
        super(options)

        this.#data = options.data
        this.#guildId = options.guildId
    }

    get guildId() {
        return this.#guildId
    }

    get name() {
        return this.#data.name
    }

    get options() {
        return this.#data.options
    }

    async autocomplete(choices: APIApplicationCommandOptionChoice<number | string>[]): Promise<void> {
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

    getFocusedOption<T extends AutocompleteFocusedOption>(): T {
        const option = this.#data.options.find(o => ('focused' in o) && Boolean(o.focused)) as T

        return option
    }

    async replyWithModal(data: APIModalInteractionResponseCallbackData): Promise<void> {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data,
                    type: InteractionResponseType.Modal
                }
            }
        )
    }
}