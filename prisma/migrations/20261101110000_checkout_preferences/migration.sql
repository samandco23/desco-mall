ALTER TABLE "users" ADD COLUMN "preferredPaymentMethod" TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentProvider" TEXT NOT NULL DEFAULT 'FAPSHI';
ALTER TABLE "orders" ADD COLUMN "kpayPaymentId" TEXT;
ALTER TABLE "orders" ADD COLUMN "kpayReference" TEXT;
ALTER TABLE "orders" ADD COLUMN "confirmationToken" TEXT;
ALTER TABLE "orders" ADD COLUMN "shippingNeighborhood" TEXT;
CREATE UNIQUE INDEX "orders_confirmationToken_key" ON "orders"("confirmationToken");
