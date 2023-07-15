import type { ModalInteractionOptions } from '#types/interaction'
import { BaseInteraction } from './BaseInteraction.js'
import type { APIModalSubmission } from '@discordjs/core'

export class ModalInteraction extends BaseInteraction {
    #data: APIModalSubmission
    #username: string

    constructor(options: ModalInteractionOptions) {
        super(options)

        this.#data = options.data
        this.#username = options.username
    }

    get customId() {
        return this.#data.custom_id
    }

    get username() {
        return this.#username
    }

    values(): [string, string][] {
        const entries = this.#data.components.map(component => {
            const { custom_id, value } = component.components[0]

            return [custom_id, value] as [string, string]
        })

        return entries
    }
}