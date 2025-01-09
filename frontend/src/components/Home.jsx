

import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

const Home = () => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-2xl px-4">
                <Card className="w-full">
                    <CardContent className="pt-8">
                        <div className="space-y-8 text-center">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight">
                                    Welcome to App
                                </h1>
                            </div>

                            {user ? (
                                <div className="space-y-6">
                                    <div className="rounded-lg bg-primary/5 p-6">
                                        <p className="text-lg text-muted-foreground">
                                            You are successfully logged in! Check out your dashboard for more features.
                                        </p>
                                    </div>

                                    <Button asChild size="lg" className="px-8">
                                        <Link to="/dashboard">
                                            <LayoutDashboard className="mr-2 h-5 w-5" />
                                            Go to Dashboard
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">


                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <Button asChild size="lg" className="px-8">
                                            <Link to="/login">
                                                <LogIn className="mr-2 h-5 w-5" />
                                                Login
                                            </Link>
                                        </Button>
                                        <Button asChild variant="outline" size="lg" className="px-8">
                                            <Link to="/signup">
                                                <UserPlus className="mr-2 h-5 w-5" />
                                                Register
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Home;