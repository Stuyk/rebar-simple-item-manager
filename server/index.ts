import { useRebar } from '@Server/index.js';
import { usePlayerItemManager } from './playerItemManager.js';
import { useItemManager } from './itemManager.js';
import { usePlayerItemManagerEvents } from './playerItemManagerEvents.js';
import { useVehicleItemManagerEvents } from './vehicleItemManagerEvents.js';
import { useVehicleItemManager } from './vehicleItemManager.js';
import { useStorageItemManagerEvents } from './storageItemManagerEvents.js';
import { useStorageItemManager } from './storageItemManager.js';
import { useItemManagerDatabase } from './database.js';
import { ItemIDs } from '../shared/ignoreItemIds.js';
import { useItemUsageManager } from './itemUsageManager.js';

const API_NAME = 'item-manager-api';
const Rebar = useRebar();
const db = useItemManagerDatabase();

function useApi() {
    return {
        useItemManager,
        useItemUsageManager,
        usePlayerItemManager,
        usePlayerItemManagerEvents,
        useStorageItemManager,
        useStorageItemManagerEvents,
        useVehicleItemManager,
        useVehicleItemManagerEvents,
        convertToId(name: string) {
            return name as ItemIDs;
        },
    };
}

declare global {
    export interface ServerPlugin {
        [API_NAME]: ReturnType<typeof useApi>;
    }
}

Rebar.useApi().register(API_NAME, useApi());
db.init();
