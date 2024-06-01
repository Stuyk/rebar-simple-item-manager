import { useRebar } from '@Server/index.js';
import { ItemManagerConfig } from '../shared/config.js';

const Rebar = useRebar();
const db = Rebar.database.useDatabase();
let isReady = false;

export function useItemManagerDatabase() {
    async function init() {
        const dbClient = await db.getClient();

        try {
            await dbClient.createCollection(ItemManagerConfig.collectionName);
            await dbClient.createCollection(ItemManagerConfig.collectionNameForStorage);
        } catch (err) {}

        isReady = true;
    }

    return {
        init,
        isReady: () => {
            return isReady;
        },
    };
}
