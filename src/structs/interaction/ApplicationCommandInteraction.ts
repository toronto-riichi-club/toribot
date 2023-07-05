import {
    type APIApplicationCommandInteractionDataOption,
    type APIChatInputApplicationCommandGuildInteraction,
    type APIInteractionDataResolved,
    type APIInteractionResponseCallbackData,
    type APIMessage,
    type APIModalInteractionResponseCallbackData,
    ApplicationCommandOptionType,
    InteractionResponseType,
    Routes,
} from '@discordjs/core'
import type { REST } from '@discordjs/rest'

export class ApplicationCommandInteraction {
    protected readonly applicationId: string
    readonly guildId: bigint
    readonly id: string
    protected readonly invokerPermissions: number
    protected readonly options: APIApplicationCommandInteractionDataOption[]
    readonly resolved: APIInteractionDataResolved
    protected readonly rest: REST
    readonly subcommand: string | null
    protected readonly token: string

    constructor(rest: REST, interaction: APIChatInputApplicationCommandGuildInteraction ) {
        this.applicationId = interaction.application_id
        this.guildId = BigInt(interaction.guild_id)
        this.id = interaction.id
        this.invokerPermissions = Number(interaction.member.permissions)
        this.options = interaction.data.options
        this.resolved = interaction.data.resolved
        this.rest = rest
        this.token = interaction.token

        if (this.options?.[0]?.type === ApplicationCommandOptionType.Subcommand) {
            this.subcommand = this.options[0].name
            this.options = this.options[0].options ?? []
        }
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

    getBooleanOption(name: string): boolean {
        const foundOption = this.options.find(option => option.name === name)

        return foundOption && 'value' in foundOption
            ? Boolean(foundOption.value.toString())
            : false
    }

    getNumberOption(name: string): number {
        const foundOption = this.options.find(option => option.name === name)

        return foundOption && 'value' in foundOption
            ? Number(foundOption.value.toString())
            : null
    }

    getStringOption(name: string): string {
        const foundOption = this.options.find(option => option.name === name)

        return foundOption && 'value' in foundOption
            ? foundOption.value.toString()
            : null
    }

    isInvokerAnAdmin(): boolean {
        return (this.invokerPermissions & (1 << 3)) !== 0
    }

    async reply({ ...data }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}) {
        await this.rest.post(
            Routes.interactionCallback(this.id, this.token),
            {
                auth: false,
                body: {
                    data,
                    type: InteractionResponseType.ChannelMessageWithSource
                }
            }
        )
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

    async response(): Promise<APIMessage> {
        const message = await this.rest.get(Routes.webhookMessage(this.applicationId, this.token)) as APIMessage

        return message
    }

    async updateReply({ ...body }: Pick<APIInteractionResponseCallbackData, 'content' | 'components' | 'embeds' | 'flags'> = {}) {
        await this.rest.patch(
            Routes.webhookMessage(this.applicationId, this.token),
            { auth: false, body }
        )
    }
}