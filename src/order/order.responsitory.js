const prisma = require("../db");

const findProductById = async (productId) => {
    return prisma.product.findUnique({
        where: { id: parseInt(productId) },
    });
};

const createOrder = async (orderData) => {
    return prisma.order.create({

        data: orderData,
        include: { orderItems: true },
    });
};

const findAllOrders = async (userId) => {
    return await prisma.order.findMany({
        where: { userId },
        include: { orderItems: { include: { product: true } } },
    });
};






const findOrderById = async (orderId) => {
    return prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
            orderItems: { include: { product: true } },
        },
    });
};

const updateOrderById = async (orderId, orderData) => {
    return prisma.order.update({
        where: { id: parseInt(orderId) },
        data: orderData,
        include: { orderItems: true },
    });
};

const deleteOrderById = async (orderId) => {
    await prisma.orderItem.deleteMany({ where: { orderId } });
    return prisma.order.delete({ where: { id: orderId } });
};

module.exports = {
    findProductById,
    createOrder,
    findAllOrders,
    findOrderById,
    updateOrderById,
    deleteOrderById,
};
