const midtransClient = require('midtrans-client');
const paymentRepository = require('./payment.responsitory');

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

  const createPaymentTransaction = async (orderId, amount, method) => {
    try {
      // Simpan transaksi ke database
      const payment = await paymentRepository.createPayment({
        orderId,
        amount,
        status: 'pending',
        method,
      });
  
      // Request ke Midtrans
      try {
        const transaction = await snap.createTransaction({
          transaction_details: {
            order_id: `order-${payment.id}`,
            gross_amount: amount,
          },
          payment_type: method,
        });
  
        return transaction;
      } catch (error) {
        console.error("Error dari Midtrans:", error.message);
        throw new Error('Terjadi kesalahan saat membuat transaksi di Midtrans.');
      }
      
    } catch (error) {
      throw new Error('Terjadi kesalahan saat membuat transaksi pembayaran.');
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