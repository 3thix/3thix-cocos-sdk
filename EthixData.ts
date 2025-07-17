// EthixData.ts

export const SandboxLoginUrl = "https://sandbox-login.3thix.com/";
export const SandboxCreatePaymentUrl = "https://sandbox-api.3thix.com/order/payment/create";
export const SandboxPaymentPayUrl = "https://sandbox-pay.3thix.com/?invoiceId=";
export const SandboxPaymentResultUrl = "https://sandbox-api.3thix.com/invoice/details/get";

export const ProductionLoginUrl = "https://login.3thix.com/";
export const ProductionCreatePaymentUrl = "https://api.3thix.com/order/payment/create";
export const ProductionPaymentPayUrl = "https://pay.3thix.com/?invoiceId=";
export const ProductionPaymentResultUrl = "https://api.3thix.com/invoice/details/get";

export enum Rails
{
    CREDIT_CARD = "CREDIT_CARD",
    ACH = "ACH",
    KAKAOPAY = "KAKAOPAY",
    ETHEREUM = "ETHEREUM",
    POLYGON = "POLYGON",
    AVAX_C = "AVAX-C",
    TELOS = "TELOS",
    ARBITRUM = "ARBITRUM",
    BNB_CHAIN = "BNB_CHAIN",
    SKALE = "SKALE",
    PAYTM = "PAYTM",
    PAYNOW = "PAYNOW",
    KONBINI = "KONBINI",
    AUPAY = "AUPAY",
    SEI = "SEI",
    SOLANA = "SOLANA",
}

export enum Currencies
{
    USD = "USD",
    BRL = "BRL",
    CAD = "CAD",
    CNY = "CNY",
    EUR = "EUR",
    SOL = "SOL"
}

export interface PaymentRequestItem
{
    product_name: string;
    qty_unit: number;
    price_unit: string;
}

export interface PaymentRequest
{
    rail: string;
    currency: string;
    amount: string;
    cart: PaymentRequestItem[];
}

export interface PaymentRequestResponse
{
    order_id: string;
    invoice_id: string;
    invoice_amount: string;
    invoice_currency: string;
}

export interface Invoice
{
    id: string;
    order_id: string;
    issuer_entity_id: string;
    currency: string;
    amount: string;
    remaining_amount: string;
    amount_paid: string;
    fees: string;
    remaining_fees: string;
    fees_paid: string;
    total: string;
    total_remaining: string;
    status: string;
    created_at: string;
}

export interface Order
{
    id: string;
    fulfillment_game_user_id: any;
    fulfillment_entity_id: any;
    issuer_entity_id: string;
    type: string;
    destination_currency: string;
    destination_amount: string;
    destination_fees: string;
    destination_total: string;
    status: string;
    created_at: string;
}

export interface PaymentDetailsResponse
{
    invoice: Invoice;
    order: Order;
}

export interface PaymentDetailsBody
{
    id: string; // invoice_id
}

export interface ErrorResponse
{
    message: string;
    error_code: string;
}
