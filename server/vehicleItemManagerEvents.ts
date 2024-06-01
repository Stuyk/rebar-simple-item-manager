import * as alt from 'alt-server';
import { Item } from '../shared/types.js';

type VehicleItemAddedCallback = (vehicle: alt.Vehicle, id: string, quantity: number) => void;
type VehicleItemRemovedCallback = (vehicle: alt.Vehicle, id: string, quantity: number) => void;
type VehicleItemUpdatedCallback = (vehicle: alt.Vehicle, items: Item[]) => void;

const onItemAddedCallbacks: VehicleItemAddedCallback[] = [];
const onItemRemovedCallbacks: VehicleItemRemovedCallback[] = [];
const onItemsUpdatedCallbacks: VehicleItemUpdatedCallback[] = [];

export function useVehicleItemManagerEventInvoker() {
    function invokeOnItemAdded(vehicle: alt.Vehicle, id: string, quantity: number) {
        for (let cb of onItemAddedCallbacks) {
            cb(vehicle, id, quantity);
        }
    }

    function invokeOnItemRemoved(vehicle: alt.Vehicle, id: string, quantity: number) {
        for (let cb of onItemRemovedCallbacks) {
            cb(vehicle, id, quantity);
        }
    }

    function invokeOnItemsUpdated(vehicle: alt.Vehicle, items: Item[]) {
        for (let cb of onItemsUpdatedCallbacks) {
            cb(vehicle, items);
        }
    }

    return {
        invokeOnItemAdded,
        invokeOnItemRemoved,
        invokeOnItemsUpdated,
    };
}

export function useVehicleItemManagerEvents() {
    /**
     * Invokes a callback when the item that was added or quantity of item is added to a vehicle
     *
     * @param {VehicleItemAddedCallback} cb
     */
    function onItemAdded(cb: VehicleItemAddedCallback) {
        onItemAddedCallbacks.push(cb);
    }

    /**
     * Invokes a callback when an item is removed or a quantity of item is removed from a vehicle
     *
     * @param {VehicleItemRemovedCallback} cb
     */
    function onItemRemoved(cb: VehicleItemRemovedCallback) {
        onItemRemovedCallbacks.push(cb);
    }

    /**
     * Invokes a callback whenever vehicle inventory is modified
     *
     * @param {VehicleItemUpdatedCallback} cb
     */
    function onItemsUpdated(cb: VehicleItemUpdatedCallback) {
        onItemsUpdatedCallbacks.push(cb);
    }

    return {
        onItemAdded,
        onItemRemoved,
        onItemsUpdated,
    };
}
