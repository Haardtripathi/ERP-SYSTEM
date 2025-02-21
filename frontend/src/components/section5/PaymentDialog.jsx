"use client"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { addPayment } from "@/services/paymentService"
import { toast } from "react-hot-toast"

const PaymentDialog = ({ referenceId, dispatchedId }) => {  // Changed from ref to referenceId
    const [isOpen, setIsOpen] = useState(false)
    const [fundType, setFundType] = useState("")
    const [date, setDate] = useState("")
    const [depositDate, setDepositDate] = useState("")
    const [paymentId, setPaymentId] = useState("")

    const handleSubmit = async () => {
        try {
            if (!fundType || !date || !paymentId || (fundType === "Cheque" && !depositDate)) {
                toast.error("Please fill all required fields")
                return
            }

            const paymentData = {
                referenceId,  // Using referenceId instead of ref
                dispatchedId,
                fund_type: fundType,
                date,
                payment_id: paymentId,
                ...(fundType === "Cheque" && { deposit_date: depositDate }),
            }

            await addPayment(paymentData)
            toast.success("Payment added successfully")
            setIsOpen(false)
            resetForm()
        } catch (error) {
            toast.error("Failed to add payment")
            console.error("Payment error:", error)
        }
    }

    const resetForm = () => {
        setFundType("")
        setDate("")
        setDepositDate("")
        setPaymentId("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
                    Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Payment Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="fund_type">Fund Type</label>
                        <Select onValueChange={setFundType} value={fundType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select fund type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Transfer">Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="date">Date</label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    {fundType === "Cheque" && (
                        <div className="grid gap-2">
                            <label htmlFor="deposit_date">Deposit Date</label>
                            <Input
                                id="deposit_date"
                                type="date"
                                value={depositDate}
                                onChange={(e) => setDepositDate(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label htmlFor="payment_id">Payment ID</label>
                        <Input
                            id="payment_id"
                            type="text"
                            value={paymentId}
                            onChange={(e) => setPaymentId(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentDialog