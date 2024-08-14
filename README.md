# Simple Item Manager

An item manager that allows you to add, remove, create, and check items.

This is a common library for building larger inventory systems.

All inventory functions automatically save to the database, and simplifies overall inventory management.

## Features

-   Configureable Weight
-   Configureable Slot Count
-   Inventory Bindings for Player
-   Inventory Bindings for Vehicles
-   Inventory Binder for General Purpose Usage, like Storage
-   Events when added, removed, and updated
-   Decay system for items
-   Decay system for storages, online players, and vehicles

## API

**Really Important,** when you create items you must start your server once for it to register.

After starting your server, the `add` functions will give you auto-complete information for available items.

### Create an Item

Items are automatically saved into the database.

```ts
declare global {
    export interface RebarItems {
        'food-burger': string;
        'seed-pouch': string;
    }
}

async function someFunction() {
    const api = await Rebar.useApi().getAsync('item-manager-api');
    const manager = api.useItemManager();
    manager.create({
        id: 'food-burger',
        name: 'Burger',
        desc: 'A delicious burger',
        icon: 'icon-burger.png',
        maxStack: 6,
        weight: 0.01,
    });

    manager.create({
        id: 'seed-pouch',
        name: 'Seed Pouch',
        desc: 'A seed pouch that contains many seeds',
        icon: 'icon-seed-pouch.png',
        maxStack: 1,
        weight: 0.0001,
    });
}
```

### Add an Item to Player

Added items must exist in the database, and if items can be stacked they will be.

An entire inventory add will fail if slot count, or weight is exceeded.

```ts
async function addSpecificItem(player: alt.Player) {
    const rebarPlayer = Rebar.usePlayer(player);
    const api = await Rebar.useApi().getAsync('item-manager-api');
    const itemManager = api.usePlayerItemManager(player);

    // id, quantity to add
    const didAdd = await itemManager.add('seed-pouch', parseInt(5));
}

async function addSomeItem(player: alt.Player, id: string) {
    const rebarPlayer = Rebar.usePlayer(player);
    const api = await Rebar.useApi().getAsync('item-manager-api');
    const itemManager = api.usePlayerItemManager(player);

    // id, quantity to add
    const didAdd = await itemManager.add(api.convertToId(id), parseInt(5));
    if (!didAdd) {
        // You can get error messages when inventory fails with the getErrorMessage function
        rebarPlayer.notify.sendMessage(itemManager.getErrorMessage());
        return;
    }

    rebarPlayer.notify.sendMessage(`Added Item: ${id}`);
}
```

### Remove an Item to Player

Removing an item works from the back of the array forward, and tries to remove the quantity specified.

The removal will fail if there is not enough quantity of an item to remove.

```ts
async function removeSomeItem(player: alt.Player, id: string) {
    const rebarPlayer = Rebar.usePlayer(player);
    const api = await Rebar.useApi().getAsync('item-manager-api');
    const itemManager = api.usePlayerItemManager(player);

    // id, quantity to remove
    const didRemove = await itemManager.remove(api.convertToId(id), 5);
    if (!didRemove) {
        // You can get error messages when inventory fails with the getErrorMessage function
        rebarPlayer.notify.sendMessage(itemManager.getErrorMessage());
        return;
    }

    rebarPlayer.notify.sendMessage(`Removed ${quantity} ${id}`);
}
```

## Expanding Item Interfaces

All interfaces from the base interfaces can be expanded / changed through declarations.

By default `Item` inherits `RebaseBaseItem`.

```ts
declare module '@Shared/types/items.js' {
    interface RebarBaseItem {
        newField: string;
    }

    interface Item {
        onlyItemField: string;
    }
}
```
