import type { GameLocation } from '#types/cache'

export class GameCache {
    #items: Map<string, Record<Required<GameLocation>, boolean>> = new Map()

    entries() {
        return this.#items.entries()
    }

    get(key: string): Record<Required<GameLocation>, boolean> | null {
        return this.#items.get(key) ?? null
    }

    insert(date: string, location: GameLocation) {
        const games: Record<Required<GameLocation>, boolean> = this.get(date) ?? {
            ONLINE: false,
            PEEL: false,
            TORONTO: false,
            WATERLOO: false,
            YORK: false
        }

        games[location] = true

        this.#items.set(date, games)  
    }

    remove(date: string, location: GameLocation) {
        const games = this.get(date)

        if (!games)
            return

        games[location] = false

        if (Object.values(games).every(v => !v))
            this.#items.delete(date)
    }
}