import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';

import './decayHandler.js';
import './service.js';
import { useItemManager } from './itemManager.js';
import { useItemManagerDatabase } from './database.js';
import { useItemUsageManager } from './itemUsageManager.js';
import { useItemArrayManager } from './itemArrayManager.js';
import { usePlayerItemManager } from './playerItemManager.js';
import { useVehicleItemManager } from './vehicleItemManager.js';
import { useStorageItemManager } from './storageItemManager.js';
import { Item } from '@Shared/types/items.js';

const API_NAME = 'item-manager-api';
const Rebar = useRebar();
const db = useItemManagerDatabase();

function useApi() {
    return {
        useItemArrayManager,
        useItemManager,
        useItemUsageManager,
        usePlayerItemManager,
        useStorageItemManager,
        useVehicleItemManager,
    };
}

declare global {
    export interface ServerPlugin {
        [API_NAME]: ReturnType<typeof useApi>;
    }
}

declare module 'alt-server' {
    export interface ICustomEmitEvent {
        'rebar:entityItemsUpdated': (entity: alt.Entity, items: Item[]) => void;
        'rebar:storageItemAdded': (identifier: string, item_id: string, quantity: number) => void;
        'rebar:storageItemRemoved': (identifier: string, item_id: string, quantity: number) => void;
        'rebar:storageItemsUpdated': (identifier: string, items: Item[]) => void;
    }
}

Rebar.useApi().register(API_NAME, useApi());
db.init();
