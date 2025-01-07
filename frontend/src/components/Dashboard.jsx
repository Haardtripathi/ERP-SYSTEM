import React from 'react';

const Dashboard = () => {
    return (
        <div className="max-w-md mx-auto mt-20 p-6 shadow-lg bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <p>Welcome to your dashboard. Only authenticated users can access this page.</p>
        </div>
    );
};

export default Dashboard;
