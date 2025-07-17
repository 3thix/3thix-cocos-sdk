

# 3thix Cocos SDK

The 3thix Cocos SDK provides developers with tools to integrate 3thix's login and payment functionalities into Cocos Creator games. This SDK allows users to log in via a WebView and create payment requests to purchase in-game items seamlessly.

## Features
- **User Login**: Authenticate users through 3thix's login page using a WebView.
- **Payment Requests**: Build and process payment carts for in-game purchases, supporting multiple blockchain rails and currencies.
- **Sandbox and Production Modes**: Test in a sandbox environment or deploy to production with ease.
- **Payment Polling**: Automatically poll for payment status with success and failure callbacks.

## Installation
1. **Add the SDK to Your Project**:
   - Copy the `EthixController.ts` and `EthixData.ts` files into your Cocos Creator project.
   - Ensure the Cocos Creator WebView component is available in your project.

2. **Configure the SDK**:
   - Attach the `EthixController` script to a persistent node in your scene.
   - Assign a WebView component and an optional close button in the Cocos Creator editor.
   - Set your `thirdPartyId`, `sandboxApiKey`, and `productionApiKey` in the `EthixController` properties.
   - Toggle the `useSandbox` property to switch between sandbox and production environments.

## Usage

### 1. Setting Up the SDK
Ensure the `EthixController` is attached to a node that persists across scenes. The singleton pattern ensures only one instance exists.

```typescript
// Example: Accessing the EthixController
import { EthixController } from './EthixController';

const ethix = EthixController.Instance;
```

### 2. User Login
Call the `doLogin` method to open the 3thix login page in the WebView. The SDK listens for a player token via `postMessage`.

```typescript
ethix.doLogin();
```

Once the user logs in, the `playerToken` is stored in the `EthixController` instance.

### 3. Creating a Payment Request
Add items to the payment cart and initiate a payment request. The SDK supports multiple blockchain rails (e.g., AVAX_C, ETH) and currencies (e.g., USD).

```typescript
// Add items to the cart
ethix.addProductToCart("Sword", 1, "10.99");
ethix.addProductToCart("Shield", 2, "5.50");

// Create a payment request
ethix.createPayment(
    Rails.AVAX_C,
    Currencies.USD,
    (response) => {
        console.log("Payment successful:", response);
    },
    (error) => {
        console.error("Payment failed:", error);
    }
);
```

The SDK will:
- Calculate the total amount from the cart.
- Send the payment request to the 3thix API.
- Open the payment page in the WebView.
- Poll for payment status every 5 seconds (up to 3 minutes) and trigger the appropriate callback.

### 4. Clearing the Cart
Clear the cart after a payment or when needed:

```typescript
ethix.clearCart();
```

## Configuration
- **thirdPartyId**: Your 3thix company ID.
- **sandboxApiKey**: API key for the sandbox environment.
- **productionApiKey**: API key for the production environment.
- **useSandbox**: Set to `true` for testing, `false` for production.
- **webView**: Assign a Cocos Creator WebView component for login and payment pages.
- **closeWebviewButton**: Optional button to manually close the WebView.

## Dependencies
- Cocos Creator (with WebView component support).
- `EthixData.ts` for data types and API endpoints.

## Example Scene Setup
1. Create a node in your scene and attach the `EthixController` script.
2. Add a WebView component to the same node or a child node.
3. Optionally, add a Button component for closing the WebView.
4. Configure the properties in the Cocos Creator editor.

## Notes
- Ensure a stable internet connection for API requests and WebView functionality.
- The SDK uses a singleton pattern, so avoid attaching `EthixController` to multiple nodes.
- Polling stops after 3 minutes or if the WebView is closed manually.
- The SDK supports both sandbox and production environments for testing and deployment.

## License
This SDK is provided under the MIT License. See the `LICENSE` file for details.

## Support
For issues or questions, contact 3thix support at [support@3thix.com](mailto:support@3thix.com) or visit [3thix Documentation](https://docs.3thix.com).

