import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import { toast } from 'react-hot-toast';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await register({ email, password });
            toast.success('Signup successful');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 shadow-lg bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Signup</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 mb-4 border rounded-lg"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                >
                    Signup
                </button>
            </form>
        </div>
    );
};

export default Signup;
