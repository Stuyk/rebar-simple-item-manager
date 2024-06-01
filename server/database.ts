import { useRebar } from '@Server/index.js';
import { ItemManagerConfig } from '../shared/config.js';

const Rebar = useRebar();
const db = Rebar.database.useDatabase();
let isReady = false;

export function useItemManagerDatabase() {
    async function init() {
        await db.createCollection(ItemManagerConfig.collectionName);
        await db.createCollection(ItemManagerConfig.collectionNameForStorage);
        isReady = true;
    }

    return {
        init,
        isReady: () => {
            return isReady;
        },
    };
}
