import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import * as Utility from '@Shared/utility/index.js';

import { ItemManagerConfig } from '../shared/config.js';
import { DatabaseBaseItem } from '../shared/types.js';
import { useItemManagerDatabase } from './database.js';
import { RebarBaseItem, RebarItems } from '@Shared/types/items.js';

const Rebar = useRebar();
const db = Rebar.database.useDatabase();
const managerDb = useItemManagerDatabase();

let databaseItems: { [id: string]: DatabaseBaseItem } = {};
let isReady = false;

async function init() {
    await alt.Utils.waitFor(() => managerDb.isReady(), 30000);

    let items = await db.getAll<DatabaseBaseItem>(ItemManagerConfig.collectionName);
    if (!items || items.length <= 0) {
        await db.create<RebarBaseItem>(
            {
                id: 'example',
                name: 'Example Item',
                desc: 'Basic Example Item',
                maxStack: 16,
                weight: 0.01,
                icon: 'whatever.png',
            },
            ItemManagerConfig.collectionName,
        );
        items = await db.getAll<DatabaseBaseItem>(ItemManagerConfig.collectionName);
    }

    const ids = [];
    for (let item of items) {
        ids.push(item.id);
        databaseItems[item.id] = item;
    }

    alt.log(`Total Items - ${items.length}`);
    isReady = true;
}

export function useItemManager() {
    /**
     * Create an item, and add it to the database
     *
     * @param {RebarBaseItem} item
     */
    async function create(item: RebarBaseItem) {
        if (item.weight < 0) {
            item.weight = 0;
        }

        if (item.maxStack <= 0) {
            item.maxStack = 1;
        }

        await alt.Utils.waitFor(() => isReady, 60000 * 2);
        if (databaseItems[item.id]) {
            return;
        }

        await db.create(Utility.clone.objectData(item), ItemManagerConfig.collectionName);
    }

    /**
     * Remove an item from the database
     *
     * @param {keyof RebarItems} id
     * @return
     */
    async function remove(id: keyof RebarItems) {
        if (!databaseItems[id]) {
            return false;
        }

        await db.deleteDocument(databaseItems[id]._id, ItemManagerConfig.collectionName);
        delete databaseItems[id];
        return true;
    }

    /**
     * Returns the full database item with the `_id`
     *
     * Returns `undefined` if the item does not exist
     *
     * @param {keyof RebarItems} id
     * @return {(DatabaseBaseItem | undefined)}
     */
    function getDatabaseItem(id: keyof RebarItems): DatabaseBaseItem | undefined {
        if (!databaseItems[id]) {
            return undefined;
        }

        return Utility.clone.objectData<DatabaseBaseItem>(databaseItems[id]);
    }

    /**
     * Returns a `BaseItem` clone, does not include `_id`
     *
     * @param {keyof RebarItems} id
     * @return
     */
    function getBaseItem(id: keyof RebarItems) {
        if (!databaseItems[id]) {
            return undefined;
        }

        const item = Utility.clone.objectData<DatabaseBaseItem>(databaseItems[id]);
        delete item._id;
        return item as RebarBaseItem;
    }

    /**
     * Check if item `id` already exists
     *
     * @param {RebarItems} id
     * @return
     */
    function has(id: keyof RebarItems) {
        return databaseItems[id] ? true : false;
    }

    return {
        create,
        getBaseItem,
        getDatabaseItem,
        has,
        remove,
    };
}

init();
