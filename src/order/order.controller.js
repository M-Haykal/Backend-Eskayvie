const express = require("express");
const router = express.Router();
const {
    createNewOrder,
    findAllOrders,
    findOrderById,
    updateOrder,
    deleteOrderById,
} = require("./order.servce");
const { verifyToken, verifyRole } = require('../middelware/authMiddelware');


router.post("/", verifyToken, async (req, res) => {
    try {
        // Ambil userId dari hasil decode token yang disimpan di req.user
        const userId = req.user.id; 
        const order = await createNewOrder(req.body, userId);
        res.status(200).send({
            status: 200,
            message: "Create order successfully",
            data_order: order,
        });
    } catch (error) {
        console.error(error);
        const status = error.message.includes("not found") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
        const orders = await findAllOrders();
        res.status(200).send({
            status: 200,
            message: "Get all orders",
            data: orders,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const order = await findOrderById(parseInt(req.params.id));
        if (!order) return res.status(404).json({ error: "Order not found" });

        res.status(200).json({
            status: 200,
            message: "Order found successfully",
            data_order: order,
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const updatedOrder = await updateOrder(parseInt(req.params.id), req.body);
        res.status(200).send({
            status: 200,
            message: "Order updated successfully",
            data_order: updatedOrder,
        });
    } catch (error) {
        const status = error.message.includes("not found") ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await deleteOrderById(parseInt(req.params.id));
        res.status(200).json({
            message: `Order with ID ${req.params.id} and its items have been deleted successfully`,
        });
    } catch (error) {
        const status = error.message.includes("not found") ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = router;
