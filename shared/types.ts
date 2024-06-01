export type InventoryExtension = {
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
};

export type Storage = {
    /**
     * Database ID for the storage interface
     *
     * @type {string}
     */
    _id: string;

    /**
     * Plain text string identifier for the storage
     *
     * @type {string}
     */
    id: string;

    /**
     * The date in which the storage was last used
     *
     * @type {number}
     */
    lastAccessed: number;
} & InventoryExtension;

export type BaseItem = {
    /**
     * A general purpose item identifier.
     *
     * Used for things like `food-burger`
     *
     * @type {string}
     */
    id: string;

    /**
     * The unique name of the item
     *
     * @type {string}
     */
    name: string;

    /**
     * The description of the item
     *
     * @type {string}
     */
    desc: string;

    /**
     * The maximum amount of items that can exist in this stack of items
     *
     * @type {number}
     */
    maxStack: number;

    /**
     * Weight per item, this is not the total weight.
     *
     * You'll want to do `quantity * weight` to see the total weight of the stack.
     *
     * @type {number}
     */
    weight: number;

    /**
     * Icon for the item with extension
     *
     * ie. `icon-burger.png`
     *
     * @type {string}
     */
    icon: string;

    /**
     * The number of in-game hours before this item expires. If this value is never set it never expires.
     *
     * If the decay is set to zero at any point, any decayed items will be removed.
     *
     * @type {number}
     */
    decay?: number;

    /**
     * Optional ruleset to further describe how the item will work
     *
     * Item manager does not manage these rules, just a placeholder to help with rules
     */
    rules?: {
        /**
         * Prevent the item from being traded, stored
         *
         * @type {boolean}
         */
        noTradingOrStorage?: boolean;

        /**
         * Destroy the item on drop
         *
         * @type {boolean}
         */
        noDropping?: boolean;
    };
};

export type Item = {
    /**
     * A unique string that is attached to the item.
     *
     * @type {string}
     */
    uid: string;

    /**
     * The number of items in the stack of items
     *
     * @type {number}
     */
    quantity: number;

    /**
     * Any custom data that belongs to the item
     *
     * @type {{ [key: string]: any }}
     */
    data?: { [key: string]: any };
} & BaseItem;

export type AddOptions = {
    /**
     * The maximum weight an array of items can have
     *
     * @type {number}
     */
    maxWeight?: number;

    /**
     * The max slots of an array of items can have
     *
     * @type {number}
     */
    maxSlots?: number;

    /**
     * Any unique data to be associated with the item
     *
     * Custom data cannot be added to items with a stack greater than 1
     *
     * @type {{[key: string]: string | number | Array<any>}}
     */
    data?: { [key: string]: string | number | Array<any> };
};

export type DatabaseBaseItem = {
    /**
     * The database identifier for the Base Item
     *
     * @type {string}
     */
    _id: string;
} & BaseItem;
