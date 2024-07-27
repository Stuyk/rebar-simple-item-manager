import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { Storage } from '../shared/types.js';
import { ItemManagerConfig } from '../shared/config.js';
import { useStorageItemManager } from './storageItemManager.js';
import { useVehicleItemManager } from './vehicleItemManager.js';
import { usePlayerItemManager } from "./playerItemManager.js";

const Rebar = useRebar();
const RebarEvents = Rebar.events.useEvents();
const db = Rebar.database.useDatabase();

let isUpdating = false;

async function updateStorage() {
    const documents = await db.getAll<Storage>(ItemManagerConfig.collectionNameForStorage);
    if (!documents || documents.length <= 0) {
        return;
    }

    const promises: Promise<void>[] = [];

    for (let document of documents) {
        if (document.noDecay) {
            continue;
        }

        promises.push(
            new Promise(async (resolve: Function) => {
                const storageItem = await useStorageItemManager(document.id);
                try {
                    storageItem.invokeDecay();
                } catch (err) {}

                resolve();
            }),
        );
    }

    await Promise.all(promises);
}

async function updateVehicles() {
    const promises: Promise<any>[] = [];

    for (let vehicle of alt.Vehicle.all) {
        if (!Rebar.document.vehicle.useVehicle(vehicle).get()) {
            continue;
        }

        const vehicleManager = useVehicleItemManager(vehicle);
        promises.push(vehicleManager.invokeDecay());
    }

    await Promise.all(promises);
}

async function updatePlayers() {
    const promises: Promise<any>[] = [];

    for (let player of alt.Player.all) {
        if (!Rebar.document.character.useCharacter(player).get()) {
            continue;
        }

        const playerManager = usePlayerItemManager(player);
        promises.push(playerManager.invokeDecay());
    }

    await Promise.all(promises);
}

async function handleDecay() {
    if (isUpdating) {
        return;
    }

    isUpdating = true;

    const promises: Promise<void>[] = [];

    promises.push(updatePlayers());
    promises.push(updateVehicles());
    promises.push(updateStorage());

    await Promise.all(promises);

    isUpdating = false;
}

RebarEvents.on('time-hour-changed', handleDecay);
