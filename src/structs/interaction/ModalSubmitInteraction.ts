import {
    type APIInteractionResponseCallbackData,
    type APIModalSubmission,
    type APIModalSubmitGuildInteraction,
    InteractionResponseType,
    Routes
} from '@discordjs/core'
import type { REST } from '@discordjs/rest'

export class ModalSubmitInteraction {
    protected readonly applicationId: string
    readonly data: APIModalSubmission
    readonly guildId: bigint
    protected readonly id: string
    protected readonly rest: REST
    protected readonly token: string

    constructor(rest: REST, interaction: APIModalSubmitGuildInteraction ) {
        this.applicationId = interaction.application_id
        this.data = interaction.data
        this.guildId = BigInt(interaction.guild_id)
        this.id = interaction.id
        this.rest = rest
        this.token = interaction.token
    }

    async defer({ ...data }: Pick<APIInteractionResponseCallbackData, 'flags'> = {}) {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data,
                    type: InteractionResponseType.DeferredChannelMessageWithSource
                }
            }
        )
    }
    
    values(): Record<string, string> {
        const entries = this.data.components.map(component => {
            const { custom_id, value } = component.components[0]

            return [custom_id, value]
        })
        const values = Object.fromEntries(entries)

        return values
    }

    async updateReply({ ...body }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}) {
        await this.rest.patch(
            Routes.webhookMessage(this.applicationId, this.token),
            { auth: false, body }
        )
    }
}