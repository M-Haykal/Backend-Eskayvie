const prisma = require("../db");

const findProductById = async (productId) => {
    return prisma.product.findUnique({
        where: { id: productId },
    });
};

const createOrder = async (orderData) => {
    return prisma.order.create({
        data: orderData,
        include: { orderItems: true },
    });
};

const findAllOrders = async () => {
    return await prisma.order.findMany({
      include: { orderItems: { include: { product: true } } },
    });
};




const findOrderById = async (orderId) => {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: { include: { product: true } },
        },
    });
};

const updateOrderById = async (orderId, orderData) => {
    return prisma.order.update({
        where: { id: orderId },
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
