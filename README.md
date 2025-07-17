# EthixController (Cocos Creator)

This component provides a singleton controller to manage interactions with the 3thix SDK in Cocos Creator. It ensures persistent state and UI references across scene transitions, including Web3 login, tokens, balances, and button callbacks.

## 🧩 Features

- Singleton pattern with race-condition safety
- Automatically persists across scene changes
- Provides easy access to Web3 / 3thix SDK interactions
- Designed for UI integration

---

## 🚀 How to Use

### 1. Add the Controller to Your Scene

- Create an **empty node** in your main scene (e.g., `EthixController`).
- Attach the `EthixController` script to this node.
- Optionally, make this node a **Prefab** if you'll instantiate it dynamically.

```ts
// Example structure:
- EthixController
  - EthixController.ts (script)
```

### 2. Singleton Pattern (No Duplicates)

This component uses a safe singleton logic to prevent duplicates or race conditions:

```ts
onLoad()
{
    if (EthixController.instance && EthixController.instance !== this)
    {
        this.destroy();
        return;
    }

    EthixController.instance = this;
    director.addPersistRootNode(this.node);
}
```

This ensures only one instance exists and is preserved across scenes.

---

## 🧠 Accessing the Controller

Anywhere in your game scripts, access the controller like this:

```ts
const controller = EthixController.instance;
controller.connectWallet();
```

Or using the static property:

```ts
EthixController.instance.doSomethingImportant();
```

---

## 🔗 Example: Connect Wallet Button

Bind this method to a UI `Button` in the editor:

```ts
connectWallet()
{
    // your SDK logic here
    console.log("Connecting wallet...");
}
```

And assign it via Inspector:
- Node: `EthixController`
- Component: `EthixController`
- Function: `connectWallet`

---

## 🧪 Optional: Prefab-Based Setup

If you prefer not to place the controller manually in every scene:

1. Save the controller node as a Prefab.
2. Instantiate it in your game's entry point if not already present:

```ts
if (!EthixController.instance) {
    resources.load("prefabs/EthixController", Prefab, (err, prefab) => {
        const node = instantiate(prefab);
        director.getScene().addChild(node);
    });
}
```

---

## 🧼 Cleanup (Editor Mode)

To avoid duplicate controllers when testing in the Editor, consider clearing persistent nodes manually if needed.

```ts
director.removePersistRootNode(EthixController.instance.node);
EthixController._instance = null;
```

---

## 📦 File Location Recommendation

Place the script in:

```
assets/scripts/controllers/EthixController.ts
```
