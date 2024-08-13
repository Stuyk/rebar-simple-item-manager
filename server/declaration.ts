import { Item } from '@Plugins/simple-item-manager/shared/types.js';

declare module '@Shared/types/character.js' {
    export interface Character {
        /**
         * Items in the player's inventory
         *
         * @type {Array<Item>}
         */
        items?: Array<Item>;

        /**
         * The maximum number of inventory slots the player has.
         *
         * @type {number}
         */
        maxSlots?: number;
    }
}

declare module '@Shared/types/vehicle.js' {
    export interface Vehicle {
        /**
         * Items in the player's inventory
         *
         * @type {Array<Item>}
         */
        items?: Array<Item>;

        /**
         * The maximum number of inventory slots the player has.
         *
         * @type {number}
         */
        maxSlots?: number;
    }
}
