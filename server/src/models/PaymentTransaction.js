import mongoose from 'mongoose';

const oid = mongoose.Schema.Types.ObjectId;

export const PAYMENT_TXN_STATUS = ['pending', 'processing', 'success', 'failed', 'expired'];

const paymentTransactionSchema = new mongoose.Schema(
  {
    txnRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    groupCode: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    customer: {
      type: oid,
      ref: 'User',
      required: true,
      index: true,
    },
    orders: [
      {
        type: oid,
        ref: 'Order',
      },
    ],
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    currency: {
      type: String,
      default: 'VND',
      uppercase: true,
    },
    status: {
      type: String,
      enum: PAYMENT_TXN_STATUS,
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'vnpay',
    },
    vnpTransactionNo: {
      type: String,
    },
    bankCode: {
      type: String,
    },
    bankTranNo: {
      type: String,
    },
    cardType: {
      type: String,
    },
    responseCode: {
      type: String,
    },
    transactionStatus: {
      type: String,
    },
    payDate: {
      type: Date,
    },
    ipnLogs: [
      {
        receivedAt: { type: Date, default: Date.now },
        params: { type: mongoose.Schema.Types.Mixed },
        result: { type: mongoose.Schema.Types.Mixed },
        ip: String,
        _id: false,
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    failureReason: {
      type: String,
    },
  },
  { timestamps: true }
);

export const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
export default PaymentTransaction;
