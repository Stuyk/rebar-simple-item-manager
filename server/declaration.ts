import { Item } from "@Plugins/simple-item-manager/shared/types.js";

declare module '@Shared/types/character.js' {
    export interface Character {
        items: Array<Item>
    }
}