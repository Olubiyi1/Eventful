interface InitializePaymentData {
    userId: string;
    eventId: string;
    email: string;
}
interface InitializePaymentResponse {
    authorizationUrl: string;
    reference: string;
}
declare class PaymentService {
    static initializePayment: (data: InitializePaymentData) => Promise<InitializePaymentResponse>;
    static verifyPayment: (reference: string) => Promise<void>;
    static handleWebhook: (event: string, data: any) => Promise<void>;
}
export default PaymentService;
