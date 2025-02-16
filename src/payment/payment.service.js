const midtransClient = require('midtrans-client');
const paymentRepository = require('./payment.responsitory');
const prisma = require("../db");


const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: 'SB-Mid-server-JcVTqoGDlOPrIuuZ6KGPZ_pS',
    clientKey: 'SB-Mid-client-lISevg2hhVj4TYGw'
})

const getAllPayments = async () => {
  try {
    const payments = await paymentRepository.getAllPaymetData(); // Menyesuaikan dengan metode query database Anda
    return payments;
  } catch (error) {
    throw new Error('Gagal mengambil data pembayaran: ' + error.message);
  }
}

const getPaymentById = async (id) => {
    try {
      const payment = await paymentRepository.getPaymentById(id); // Menyesuaikan dengan metode query database Anda
      return payment;
    } catch (error) {
      throw new Error('Gagal mengambil data pembayaran: ' + error.message);
    }
  };

  const createPaymentTransaction = async (userId, orderId, amount, method) => {
  try {
    console.log("Memeriksa order dengan ID:", orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Order dengan ID ${orderId} tidak ditemukan.`);
      throw new Error(`Order dengan ID ${orderId} tidak ditemukan.`);
    }

    console.log("Order ditemukan:", order);

    // Cek duplikasi pembayaran
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId },
    });

    if (existingPayment) {
      console.error(`Transaksi pembayaran untuk orderId ${orderId} sudah ada.`);
      throw new Error(`Transaksi pembayaran untuk orderId ${orderId} sudah ada.`);
    }

    console.log("Tidak ada pembayaran duplikat untuk orderId:", orderId);

    // Buat transaksi pembayaran baru tanpa userId
    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        status: 'pending',
        method,
      },
    });

    console.log("Transaksi pembayaran berhasil dibuat:", payment);
    return payment;
  } catch (error) {
    console.error("Error di createPaymentTransaction:", error.message);
    throw error;
  }
};

  

  

  const updatePaymentAndOrderStatus = async (paymentId) => {
    const payment = await paymentRepository.getPaymentById(paymentId);
  
    if (!payment) {
      throw new Error('Payment not found');
    }
  
    // Call Midtrans to check payment status
    const midtransStatus = await midtransClient.transaction.status(`order-${payment.id}`);
  
    if (midtransStatus.transaction_status === 'settlement') {
      // Update payment and order statuses
      await paymentRepository.updatePaymentStatus(paymentId, 'completed');
      await paymentRepository.updateOrderStatus(payment.orderId, 'completed');
    } else if (midtransStatus.transaction_status === 'cancel' || midtransStatus.transaction_status === 'deny') {
      await paymentRepository.updatePaymentStatus(paymentId, 'failed');
      await paymentRepository.updateOrderStatus(payment.orderId, 'canceled');
    } else {
      throw new Error('Transaction is still pending or in a different state.');
    }
  
    return {
      message: 'Payment and order statuses updated successfully.',
      paymentStatus: midtransStatus.transaction_status,
    };
  };
  
module.exports = {
    getAllPayments,
    createPaymentTransaction,
    getPaymentById,
    updatePaymentAndOrderStatus
}