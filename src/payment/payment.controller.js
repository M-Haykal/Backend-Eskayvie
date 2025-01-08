const paymentService = require("./payment.service");
const { verifyToken, verifyRole } = require("../middelware/authMiddelware");
const express = require("express");
const prisma = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments(); // Fungsi yang akan mengambil semua data pembayaran
    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data pembayaran ditemukan.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Data pembayaran berhasil ditemukan.",
      data: payments,
    });
  } catch (error) {
    console.error("Error di controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server.",
    });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const payment = await paymentService.getPaymentById(id); // Fungsi yang akan mengambil semua data pembayaran
    if (!payment || payment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada data pembayaran ditemukan.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Data pembayaran berhasil ditemukan.",
      payment,
    });
  } catch (error) {
    console.error("Error di controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Terjadi kesalahan pada server.",
    });
  }
});

router.post("/", async (req, res) => {
  const { orderId, amount, method } = req.body;

  try {
    // Validasi input
    if (!orderId || typeof orderId !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Order ID harus berupa angka dan tidak boleh kosong.',
      });
    }

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Jumlah pembayaran harus berupa angka dan tidak boleh kosong.',
      });
    }

    if (!method || typeof method !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Metode pembayaran harus berupa string dan tidak boleh kosong.',
      });
    }

    // Buat transaksi pembayaran
    const transaction = await paymentService.createPaymentTransaction(orderId, amount, method);

    res.status(201).json({
      success: true,
      message: 'Transaksi pembayaran berhasil dibuat.',
      data : transaction,
    });
  } catch (error) {
    console.error("Error di paymentController:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server.',
    });
  }
});

router.post('/verify', async (req, res) => {
  const { order_id, transaction_status } = req.body;

  try {
    // Cari payment berdasarkan orderId
    const payment = await prisma.payment.findUnique({
      where: { orderId: parseInt(order_id) },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment dan order berdasarkan status transaksi
    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    if (transaction_status === 'settlement') {
      paymentStatus = 'completed';
      orderStatus = 'completed';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      paymentStatus = 'failed';
      orderStatus = 'canceled';
    }

    // Update status di database
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: paymentStatus },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
    });

    res.send({
      status: 200,
      message: 'Payment status updated successfully',
      data: {
        paymentId: payment.id,
        paymentStatus,
        orderId: payment.orderId,
        orderStatus,
      },
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
