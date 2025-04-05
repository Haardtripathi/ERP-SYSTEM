"use client"

import { useState } from "react"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js"
import { ArrowDownIcon, ArrowUpIcon, ChevronDown, Filter, MoreHorizontal, Search } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
)

const Dashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState("30d")

    // Demo data adapted for an ERP System in an Indian context
    // Revenue now reflects order revenue in Indian Rupees
    const revenueData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
            {
                label: "Order Revenue",
                data: [250000, 320000, 280000, 350000, 400000, 420000, 390000, 450000, 480000, 500000, 520000, 550000],
                borderColor: "#0ea5e9",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                tension: 0.4,
                fill: true,
            },
        ],
    }

    // Order processing data showing orders at various stages over a week
    const orderProcessingData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Processed Orders",
                data: [120, 150, 180, 200, 170, 190, 160],
                backgroundColor: "#10b981",
                borderRadius: 4,
                barThickness: 20,
            },
            {
                label: "Pending Orders",
                data: [40, 35, 30, 50, 45, 40, 38],
                backgroundColor: "#f59e0b",
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    }

    // Distribution of order types as a Doughnut chart
    const orderTypeData = {
        labels: ["Regular", "Express", "Bulk"],
        datasets: [
            {
                data: [55, 30, 15],
                backgroundColor: ["#0ea5e9", "#10b981", "#f59e0b"],
                borderWidth: 0,
            },
        ],
    }

    // Payment conversion trend data (from pending to complete payments)
    const paymentConversionData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Payment Conversion (%)",
                data: [75, 78, 80, 82, 85, 88],
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.4,
                fill: true,
            },
        ],
    }

    // Sample Recent Orders data with statuses adapted for an ERP system in India
    const recentOrders = [
        { id: "#ERP-1001", customer: "Alex Johnson", date: "2023-06-01", status: "Delivered", amount: "₹2,350.00" },
        { id: "#ERP-1002", customer: "Sarah Williams", date: "2023-06-02", status: "Processing", amount: "₹1,250.00" },
        { id: "#ERP-1003", customer: "Michael Brown", date: "2023-06-03", status: "Pending", amount: "₹3,420.00" },
        { id: "#ERP-1004", customer: "Emily Davis", date: "2023-06-04", status: "Delivered", amount: "₹1,875.00" },
        { id: "#ERP-1005", customer: "David Miller", date: "2023-06-05", status: "Cancelled", amount: "₹650.00" },
    ]

    // Team members working on ERP modules
    const teamMembers = [
        { name: "Emma Wilson", role: "Product Manager", tasks: 14, completed: 11 },
        { name: "James Taylor", role: "UX Designer", tasks: 12, completed: 10 },
        { name: "Olivia Martin", role: "Developer", tasks: 18, completed: 15 },
        { name: "Noah Garcia", role: "Marketing", tasks: 9, completed: 6 },
    ]

    // Render status badge based on order status
    const getStatusBadge = (status) => {
        switch (status) {
            case "Delivered":
                return <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-800">Delivered</span>
            case "Processing":
                return <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">Processing</span>
            case "Pending":
                return <span className="px-2 py-1 text-xs rounded-md bg-yellow-100 text-yellow-800">Pending</span>
            case "Cancelled":
                return <span className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-800">Cancelled</span>
            default:
                return <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800">{status}</span>
        }
    }

    return (
        <div className="p-6 space-y-8 bg-gray-50">
            {/* KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 bg-white shadow">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold">₹450,000</div>
                    <div className="flex items-center text-xs mt-2">
                        <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500 font-medium">+15.3%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                </Card>
                <Card className="p-6 bg-white shadow">
                    <div className="text-sm font-medium text-gray-500 mb-1">New Orders</div>
                    <div className="text-2xl font-bold">1,230</div>
                    <div className="flex items-center text-xs mt-2">
                        <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500 font-medium">+10.5%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                </Card>
                <Card className="p-6 bg-white shadow">
                    <div className="text-sm font-medium text-gray-500 mb-1">Complaint Resolutions</div>
                    <div className="text-2xl font-bold">320</div>
                    <div className="flex items-center text-xs mt-2">
                        <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500 font-medium">-5.2%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                </Card>
                <Card className="p-6 bg-white shadow">
                    <div className="text-sm font-medium text-gray-500 mb-1">Payment Conversion</div>
                    <div className="text-2xl font-bold">88%</div>
                    <div className="flex items-center text-xs mt-2">
                        <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500 font-medium">+2.7%</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                </Card>
            </div>

            {/* Grid of Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Overview */}
                <Card className="p-6 bg-white shadow">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-lg font-medium">Order Revenue</h3>
                            <p className="text-sm text-gray-500">Monthly revenue from processed orders</p>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md">
                                Last {selectedPeriod === "30d" ? "30" : "7"} days
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[250px]">
                        <Line
                            data={revenueData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: (value) => `₹${value / 1000}k`,
                                        },
                                        grid: { color: "rgba(0, 0, 0, 0.05)" },
                                    },
                                    x: { grid: { color: "rgba(0, 0, 0, 0.05)" } },
                                },
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: { label: (context) => `Revenue: ₹${context.raw.toLocaleString()}` },
                                    },
                                },
                                elements: {
                                    point: { radius: 3 },
                                    line: { borderWidth: 2 },
                                },
                            }}
                        />
                    </div>
                </Card>

                {/* Order Processing Analytics */}
                <Card className="p-6 bg-white shadow">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-lg font-medium">Order Processing</h3>
                            <p className="text-sm text-gray-500">Daily order stats: processed vs pending</p>
                        </div>
                        <button className="text-gray-500">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="h-[250px]">
                        <Bar
                            data={orderProcessingData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" } },
                                    x: { grid: { display: false } },
                                },
                                plugins: {
                                    legend: {
                                        position: "top",
                                        align: "end",
                                        labels: { boxWidth: 12, usePointStyle: true, pointStyle: "rect" },
                                    },
                                },
                                barPercentage: 0.6,
                            }}
                        />
                    </div>
                </Card>

                {/* Order Types Distribution */}
                <Card className="p-6 bg-white shadow">
                    <div className="mb-3">
                        <h3 className="text-lg font-medium">Order Types</h3>
                        <p className="text-sm text-gray-500">Breakdown by Regular, Express & Bulk</p>
                    </div>
                    <div className="h-[250px] flex items-center justify-center">
                        <div className="w-[220px]">
                            <Doughnut
                                data={orderTypeData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: "65%",
                                    plugins: {
                                        legend: {
                                            position: "right",
                                            labels: { boxWidth: 12, usePointStyle: true, pointStyle: "rect" },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Payment Conversion Trend */}
                <Card className="p-6 bg-white shadow">
                    <div className="mb-3">
                        <h3 className="text-lg font-medium">Payment Conversion</h3>
                        <p className="text-sm text-gray-500">Conversion from pending to complete payments</p>
                    </div>
                    <div className="h-[250px]">
                        <Line
                            data={paymentConversionData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { callback: (value) => `${value}%` },
                                        grid: { color: "rgba(0, 0, 0, 0.05)" },
                                    },
                                    x: { grid: { color: "rgba(0, 0, 0, 0.05)" } },
                                },
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: { label: (context) => `Conversion: ${context.raw}%` },
                                    },
                                },
                                elements: {
                                    point: { radius: 3 },
                                    line: { borderWidth: 2 },
                                },
                            }}
                        />
                    </div>
                </Card>
            </div>

            {/* Recent Orders Table */}
            <Card className="p-6 bg-white shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Recent Orders</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-9 pr-4 py-2 text-sm border rounded-md w-[200px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <button className="p-2 border rounded-md">
                            <Filter className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{order.customer}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500">{order.date}</td>
                                    <td className="px-4 py-4 text-sm">{getStatusBadge(order.status)}</td>
                                    <td className="px-4 py-4 text-sm text-gray-500 text-right">{order.amount}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button className="text-gray-400 hover:text-gray-500">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex items-center justify-between mt-4 border-t pt-3">
                    <div className="text-xs text-gray-500">Showing 5 of 100 orders</div>
                    <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 text-sm border rounded-md text-gray-400 bg-gray-50" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </Card>

            {/* Team Performance */}
            <Card className="p-6 bg-white shadow">
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Team Performance</h3>
                    <p className="text-sm text-gray-500">Progress on key ERP modules</p>
                </div>
                <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <div key={member.name} className="flex items-center space-x-4">
                            <Avatar className="h-10 w-10 border">
                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                    {member.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <span className="text-xs text-gray-500">{member.role}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                        {member.completed} of {member.tasks} tasks completed
                                    </span>
                                    <span className="font-medium">{Math.round((member.completed / member.tasks) * 100)}%</span>
                                </div>
                                <Progress value={(member.completed / member.tasks) * 100} className="h-1.5" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}

export default Dashboard
