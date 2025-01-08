const {
    findProductById,
    createOrder,
    findAllOrders,
    findOrderById,
    updateOrderById,
    deleteOrderById,
} = require("./order.responsitory");

const calculateOrderItemsWithPrice = async (orderItems) => {
    const itemsWithPrice = [];
    let totalAmount = 0;

    for (const item of orderItems) {
        const product = await findProductById(item.productId);
        if (!product) throw new Error(`Product with ID ${item.productId} not found`);

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        itemsWithPrice.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
        });
    }

    return { itemsWithPrice, totalAmount };
};

const createNewOrder = async (orderData) => {
    const { itemsWithPrice, totalAmount } = await calculateOrderItemsWithPrice(orderData.orderItems);
    return createOrder({
        userId: orderData.userId,
        status: orderData.status,
        totalAmount,
        orderItems: { create: itemsWithPrice },
    });
};

const updateOrder = async (orderId, orderData) => {
    const { itemsWithPrice, totalAmount } = await calculateOrderItemsWithPrice(orderData.orderItems);
    return updateOrderById(orderId, {
        userId: orderData.userId,
        status: orderData.status,
        totalAmount,
        orderItems: {
            deleteMany: {},
            create: itemsWithPrice,
        },
    });
};

module.exports = {
    calculateOrderItemsWithPrice,
    createNewOrder,
    findAllOrders,
    findOrderById,
    updateOrder,
    deleteOrderById,
};
