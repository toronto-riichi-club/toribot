import type { ModalInteraction, ToribotClient } from '#structs'
import type { Modal } from '#types/interaction'
import type { APIEmbed } from '@discordjs/core'
import type { GameLocation, GameType } from '@prisma/client'

export const AddScoreModal: Modal = {
    async run(client: ToribotClient, interaction: ModalInteraction): Promise<void> {
        await interaction.defer()

        let embed: Partial<APIEmbed> = { color: 0xF8F8FF }

        const usernames: string[] = [interaction.username]
        const scores: number[] = []

        let totalScore = 0

        for (const [index, [username, submittedScore]] of interaction.values().entries()) {
            if (!submittedScore?.length) {
                scores.push(0)
                continue
            }

            const prefix = (index === 4)
                ? 'The leftover points'
                : `The score for ${username}`

            if (index !== 4)
                usernames.push(username)

            let submittedScoreSanitized = submittedScore.replace(/\s,/g, '')

            const hasPeriod = submittedScoreSanitized.includes('.')
            const hasLetterK = submittedScoreSanitized.includes('k')

            let errorMessage

            if (!hasPeriod && !hasLetterK) {
                submittedScoreSanitized = submittedScoreSanitized.replace(/^0+/, '')

                const [, num, zeroes] = [...submittedScoreSanitized.matchAll(/^(\d*[^-0])(0*)$/g)]?.[0] ?? []

                if (!/^-?\d+$/g.test(num))
                    errorMessage =`${prefix} must be a valid integer.`
                else if (Math.abs(parseInt(num)) > 100)
                    errorMessage = `${prefix} must be at or below 100,000.`

                const zeroesPart = zeroes?.length
                    ? zeroes
                    : '000'

                submittedScoreSanitized = num.concat(zeroesPart)
            } else if (!hasPeriod && hasLetterK) {
                submittedScoreSanitized = submittedScoreSanitized.replace(/k/g, '')

                if (!/^-?\d+$/g.test(submittedScoreSanitized))
                    errorMessage =`${prefix} must be a valid integer.`
                else if (Math.abs(parseInt(submittedScoreSanitized)) > 100)
                    errorMessage = `${prefix} must be at or below 100,000.`

                submittedScoreSanitized = submittedScoreSanitized.concat('000')
            } else if (hasPeriod && !hasLetterK) {
                submittedScoreSanitized = submittedScoreSanitized
                    .replace(/\./g, '')
                    .concat('00')

                if (!/^-?\d+$/g.test(submittedScoreSanitized))
                    errorMessage =`${prefix} must be a valid integer.`
                else if (Math.abs(parseInt(submittedScoreSanitized)) > 100_000)
                    errorMessage = `${prefix} must be at or below 100,000.`
            } else {
                submittedScoreSanitized = submittedScoreSanitized
                    .replace(/[\.k]/g, '')
                    .concat('00')

                if (!/^-?\d+$/g.test(submittedScoreSanitized))
                    errorMessage =`${prefix} must be a valid integer.`
                else if (Math.abs(parseInt(submittedScoreSanitized)) > 100_000)
                    errorMessage = `${prefix} must be at or below 100,000.`
            }
            if (errorMessage?.length) {
                embed.description = errorMessage

                await interaction.updateReply({ embeds: [embed] })
                return
            }

            const score = Number(submittedScoreSanitized)
            
            scores.push(score)
            totalScore += score
        }

        if (totalScore !== 100_000) {
            embed.description = 'The total score does not sum to 100,000 points.'

            await interaction.updateReply({ embeds: [embed] })
            return
        }

        const [, location, type] = interaction.customId.split(':')
        const gameId = await client.database.games.insertGame(
            usernames[0],
            usernames[1],
            usernames[2],
            usernames[3],
            usernames[4],
            scores[0],
            scores[1],
            scores[2],
            scores[3],
            scores[4],
            location as GameLocation,
            type as GameType
        )

        embed = {
            ...embed,
            description: [0, 1, 2, 3]
                .map(index => {
                    const username = usernames[index + 1]
                    const cachedPlayer = client.cache.players.get(username)

                    return { score: scores[index], username: Boolean(cachedPlayer) ? `<@${cachedPlayer.toString()}>` : username }
                })
                .sort((a, b) => b.score - a.score)
                .map(({ score, username }) => `${score} - ${username}`)
                .join('\n'),
            fields: scores[4]
                ? [{ inline: false, name: 'Leftover points', value: scores[4].toString() }]
                : undefined,
            footer: { text: `Submitted by ${interaction.username}` },
            title: `Game #${gameId} (${type.toLowerCase()} at ${location.charAt(0).toUpperCase()}${location.slice(1).toLowerCase()})`
        }

        await interaction.updateReply({ embeds: [embed] })
    }
}