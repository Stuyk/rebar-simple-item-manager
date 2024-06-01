import { useRebar } from '@Server/index.js';

import './decayHandler.js';
import { useItemManager } from './itemManager.js';
import { useItemManagerDatabase } from './database.js';
import { useItemUsageManager } from './itemUsageManager.js';
import { useItemArrayManager } from './itemArrayManager.js';
import { usePlayerItemManager } from './playerItemManager.js';
import { useVehicleItemManager } from './vehicleItemManager.js';
import { useStorageItemManager } from './storageItemManager.js';
import { usePlayerItemManagerEvents } from './playerItemManagerEvents.js';
import { useVehicleItemManagerEvents } from './vehicleItemManagerEvents.js';
import { useStorageItemManagerEvents } from './storageItemManagerEvents.js';

import { ItemIDs } from '../shared/ignoreItemIds.js';

const API_NAME = 'item-manager-api';
const Rebar = useRebar();
const db = useItemManagerDatabase();

function useApi() {
    return {
        useItemArrayManager,
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
