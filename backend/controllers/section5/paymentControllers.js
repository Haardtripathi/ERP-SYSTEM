const Payment = require('../../models/Payment')
const Delivered = require('../../models/Delivered')


exports.addPayment = async (req, res) => {
    try {

        const data = req.body.data
        const deliveredItem = await Delivered.findOne({ dispatchedId: data.dispatchedId })
        deliveredItem.payment_received = true

        await deliveredItem.save()
        const payment = new Payment({
            payment_id: data.payment_id,
            dispatchedId: data.dispatchedId,
            date: data.date,
            deposit_date: data.deposit_date || null,
            fund_type: data.fund_type,
            referenceId: data.referenceId,
        })

        await payment.save()
        return res.status(201).json({ message: "Payment data added successfully.", payment });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to add payment data" });
    }
}

exports.getAllPaymentData = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Fetch data with pagination, including only records where awb_number is "" or null
        const paymentData = await Payment.find({ isDeleted: false })
            .populate({
                path: 'dispatchedId',
                populate: {
                    path: 'confirmedId', // Populate `confirmedId` inside `dispatchId`
                }
            });

        const totalCount = await Payment.countDocuments({ isDeleted: false })
        return res.status(200).json({
            message: "Payment data fetched successfully.",
            paymentData,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to get confirmed data" });
    }

}