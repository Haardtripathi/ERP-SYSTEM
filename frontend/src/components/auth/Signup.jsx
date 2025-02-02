
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { register, getAgentList } from '../../services/authService';
// import { toast } from 'react-hot-toast';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Mail, Lock, Loader2 } from 'lucide-react';

// const Signup = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [agentName, setAgentName] = useState('');
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             await register({ email, password, agentName });
//             toast.success('Signup successful');
//             navigate('/login');
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Signup failed');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
//             <Card className="w-[400px] mx-auto">
//                 <CardHeader>
//                     <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="email">Email</Label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     placeholder="Enter your email"
//                                     required
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="Agent Name">Agent Name</Label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                                 <Input
//                                     id="agent_name"
//                                     type="input"
//                                     value={agentName}
//                                     onChange={(e) => setAgentName(e.target.value)}
//                                     placeholder="Enter your Agent Name"
//                                     required
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <Label htmlFor="password">Password</Label>
//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     value={password}
//                                     onChange={(e) => setPassword(e.target.value)}
//                                     placeholder="Enter your password"
//                                     required
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>

//                         <Button
//                             type="submit"
//                             className="w-full"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                     Creating account...
//                                 </>
//                             ) : (
//                                 'Sign Up'
//                             )}
//                         </Button>

//                         <div className="text-center text-sm text-gray-500">
//                             Already have an account?{' '}
//                             <button
//                                 type="button"
//                                 onClick={() => navigate('/login')}
//                                 className="text-primary hover:underline"
//                             >
//                                 Login
//                             </button>
//                         </div>
//                     </form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default Signup;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, getAgentList } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agentName, setAgentName] = useState('');
    const [agentList, setAgentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAgentList = async () => {
            try {
                const data = await getAgentList();
                // //console.log(data.agentList[0].values);
                // Assuming the data structure matches what we saw in the image
                // where values array contains the agent names
                if (data && data.agentList[0].values) {
                    // //console.log(data.agentList[0].values)
                    setAgentList(data.agentList[0].values);
                }
            } catch (error) {
                toast.error('Failed to fetch agent list');
            }
        };

        fetchAgentList();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            //console.log({ email, password, agentName })
            await register({ email, password, agentName });
            toast.success('Signup successful');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
            <Card className="w-[400px] mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="agent-name">Agent Name</Label>
                            <Select
                                value={agentName}
                                onValueChange={setAgentName}
                                required
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Agent Name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agentList.map((agent) => (
                                        <SelectItem key={agent} value={agent}>
                                            {agent}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>

                        <div className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-primary hover:underline"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signup;