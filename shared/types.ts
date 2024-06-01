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
     * @type {{[key: string]: any}}
     */
    data?: { [key: string]: any };
};

export type DatabaseBaseItem = {
    /**
     * The database identifier for the Base Item
     *
     * @type {string}
     */
    _id: string;
} & BaseItem;
