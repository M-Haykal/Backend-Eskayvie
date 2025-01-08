const prisma = require("../db");


const getAllPaymetData = async () => {
  return prisma.payment.findMany();
};

const getPaymentById = async (id) => {
  return prisma.payment.findUnique({ where: { id } });
};

const createPayment = async ({ orderId, amount, method }) => {
  try {
    // Log langkah validasi orderId
    console.log("Memeriksa order dengan ID:", orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error(`Order dengan ID ${orderId} tidak ditemukan.`);
      throw new Error(`Order dengan ID ${orderId} tidak ditemukan.`);
    }

    console.log("Order ditemukan:", order);

    // Log langkah validasi duplikasi pembayaran
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment) {
      console.error(`Transaksi pembayaran untuk orderId ${orderId} sudah ada.`);
      throw new Error(`Transaksi pembayaran untuk orderId ${orderId} sudah ada.`);
    }

    console.log("Tidak ada pembayaran duplikat untuk orderId:", orderId);

    // Buat transaksi pembayaran baru
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
    console.error("Error di createPayment:", error.message);
    throw error;
  }
};





module.exports = {
    createPayment,
    getAllPaymetData,
    getPaymentById
}