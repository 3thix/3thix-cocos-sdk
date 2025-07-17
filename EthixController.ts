export const EthixSDKVersion = "1.0.0";

import { _decorator, Button, Component, director, WebView } from 'cc';
const { ccclass, property } = _decorator;

import
{
    Rails, Currencies, PaymentRequest, PaymentRequestItem,
    PaymentRequestResponse, PaymentDetailsResponse, PaymentDetailsBody,
    ErrorResponse, SandboxCreatePaymentUrl, SandboxPaymentPayUrl,
    SandboxPaymentResultUrl, SandboxLoginUrl,
    ProductionLoginUrl, ProductionCreatePaymentUrl,
    ProductionPaymentPayUrl, ProductionPaymentResultUrl
} from './EthixData';

/**
 * Main SDK controller class responsible for:
 * - Handling user login via WebView
 * - Managing the payment cart
 * - Sending payment requests to Ethix API
 * - Polling payment results
 *
 * Singleton pattern ensures a single global instance.
 */
@ccclass('EthixController')
export class EthixController extends Component
{
    /** Singleton instance */
    private static instance: EthixController;

    /** Returns the global SDK instance */
    public static get Instance()
    {
        return this.instance;
    }

    /** Your 3thix company ID */
    @property({ type: String })
    private thirdPartyId: string = "your-company-id";

    /** Sandbox environment API key */
    @property({ type: String })
    private sandboxApiKey: string = "your-sandbox-api-key";

    /** Production environment API key */
    @property({ type: String })
    private productionApiKey: string = "your-production-api-key";

    /** Toggle between sandbox (true) and production (false) mode */
    @property
    private useSandbox: boolean = true;

    /** WebView used to load login/payment pages */
    @property({ type: WebView })
    private webView: WebView | null = null;

    /** Optional: Button to close the WebView manually */
    @property(Button)
    private closeWebviewButton: Button | null = null;

    /** Cart used to build the payment request */
    private _paymentRequestCart: PaymentRequestItem[] = [];

    /** Player token returned by login (via postMessage) */
    public playerToken: string | null = null;

    /** Ensure singleton pattern and persist this node across scene reloads */
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

    /** Setup WebView state and close button */
    start()
    {
        if (this.webView)
        {
            this.webView.node.active = false;
            this.webView.node.setSiblingIndex(999); // Ensure on top
        } else
        {
            console.warn('WebView component not assigned');
        }

        this.closeWebviewButton?.node.on('click', () =>
        {
            if (this.webView != null)
                this.webView.node.active = false;
        });
    }

    /**
     * Opens the login page inside the WebView and listens for the player token.
     */
    public doLogin()
    {
        if (this.webView)
        {
            this.webView.url = this.useSandbox ? SandboxLoginUrl : ProductionLoginUrl;
            window.addEventListener('message', this.onWebMessageReceived);
            this.webView.node.on('loaded', this.onWebViewLoaded, this);
        } else
        {
            console.error('WebView component not assigned');
        }
    }

    /** Handler for postMessage events from the WebView */
    private onWebMessageReceived = (event: MessageEvent) =>
    {
        if (event.data?.token)
        {
            console.log('🎉 Token received from 3thix via postMessage:', event.data.token);
            this.playerToken = event.data.token;
        }
    }

    /** Called when WebView content is fully loaded */
    private onWebViewLoaded()
    {
        console.log('WebView content loaded!');
    }

    /** Cleanup event listeners */
    onDestroy()
    {
        this.webView?.node.off('loaded', this.onWebViewLoaded, this);
        window.removeEventListener('message', this.onWebMessageReceived);
    }

    /**
     * Adds an item to the current payment cart.
     * @param productName - Name of the product
     * @param quantity - Quantity of the product
     * @param price - Unit price of the product (as string, e.g. "10.99")
     */
    public addProductToCart(productName: string, quantity: number, price: string)
    {
        console.log("Adding product to cart:", { productName, quantity, price });

        this._paymentRequestCart.push({
            product_name: productName,
            qty_unit: quantity,
            price_unit: price
        });
    }

    /**
     * Sends the payment request and opens the WebView with the payment page.
     * Automatically starts polling for payment result.
     *
     * @param rail - Blockchain rail (e.g. AVAX_C, ETH)
     * @param currency - Desired currency (e.g. USD)
     * @param onSuccess - Callback when payment is successful
     * @param onFailure - Callback when payment fails or times out
     */
    public async createPayment(
        rail: Rails,
        currency: Currencies,
        onSuccess?: (res: PaymentDetailsResponse) => void,
        onFailure?: (err: ErrorResponse) => void
    )
    {
        let amount = 0;

        // Calculate total amount from cart
        for (const item of this._paymentRequestCart)
        {
            const price = parseFloat(item.price_unit);
            if (!isNaN(price)) amount += price * item.qty_unit;
            else console.error(`Invalid price for ${item.product_name}`);
        }

        // Build the payment request payload
        const paymentRequest: PaymentRequest = {
            rail: rail === Rails.AVAX_C ? 'AVAX-C' : Rails[rail],
            currency: Currencies[currency],
            amount: amount.toFixed(2),
            cart: this._paymentRequestCart
        };

        console.log("Creating Payment Request:", paymentRequest);
        clearCart();

        const apiKey = this.useSandbox ? this.sandboxApiKey : this.productionApiKey;
        const createPaymentUrl = this.useSandbox ? SandboxCreatePaymentUrl : ProductionCreatePaymentUrl;
        const paymentPayUrl = this.useSandbox ? SandboxPaymentPayUrl : ProductionPaymentPayUrl;
        const paymentResultUrl = this.useSandbox ? SandboxPaymentResultUrl : ProductionPaymentResultUrl;

        try
        {
            const res = await fetch(createPaymentUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey
                },
                body: JSON.stringify(paymentRequest)
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const json: PaymentRequestResponse = await res.json();

            // Open payment page in WebView
            if (this.webView !== null)
            {
                this.webView.node.active = true;
                this.webView.url = `${paymentPayUrl}${json.invoice_id}`;
            } else
            {
                console.error('WebView component not assigned');
            }

            // Start polling for result
            this.pollPaymentResult(json.invoice_id, paymentResultUrl, onSuccess, onFailure);
        } catch (err)
        {
            console.error('Payment creation failed:', err);
            const message = err instanceof Error ? err.message : String(err);
            if (onFailure) onFailure({ message, error_code: 'FETCH_FAILED' });
        }
    }

    /**
     * Continuously polls for payment result every 5 seconds (up to 3 minutes).
     * @param invoiceId - The invoice ID returned from createPayment
     * @param paymentResultUrl - Endpoint to check payment status
     * @param onSuccess - Callback if payment succeeds
     * @param onFailure - Callback if payment fails or WebView is closed
     */
    private async pollPaymentResult(
        invoiceId: string,
        paymentResultUrl: string,
        onSuccess?: (res: PaymentDetailsResponse) => void,
        onFailure?: (err: ErrorResponse) => void
    )
    {
        const body = JSON.stringify({ id: invoiceId });

        let retries = 0;
        const maxRetries = 36; // 3 minutes max (36 x 5s)

        while (retries++ < maxRetries)
        {
            try
            {
                const res = await fetch(paymentResultUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body
                });

                if (!res.ok) throw new Error(`Poll Error: ${res.status}`);
                const json: PaymentDetailsResponse = await res.json();

                // If payment is confirmed
                if (json.invoice.status === 'PAID')
                {
                    console.log('✅ Payment completed:', json.invoice.id);
                    if (this.webView !== null && this.webView.node.active)
                    {
                        this.webView.node.active = false;
                    }
                    if (onSuccess) onSuccess(json);
                    break;
                }

                // If user closed WebView manually
                if (this.webView !== null && !this.webView.node.active)
                {
                    const error: ErrorResponse = {
                        message: 'WebView closed or payment not completed.',
                        error_code: 'WEBVIEW_CLOSED'
                    };
                    if (onFailure) onFailure(error);
                    break;
                }
            } catch (err)
            {
                console.error('Polling failed:', err);
                const message = err instanceof Error ? err.message : String(err);
                if (onFailure) onFailure({ message, error_code: 'POLL_FAILED' });
                break;
            }

            await this.wait(5000); // wait 5 seconds
        }
    }

    /**
     * Helper method to wait asynchronously.
     * @param ms - Milliseconds to wait
     */
    private wait(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clears the current payment cart.
     */
    public clearCart()
    {
        this._paymentRequestCart = [];
    }
}