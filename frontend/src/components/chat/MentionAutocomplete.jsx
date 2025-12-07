import React from 'react';
import { cn } from "@/lib/utils";

// Helper function to convert buffer to base64
const bufferToBase64 = (buffer) => {
    if (!buffer) return '';
    if (typeof buffer === 'string') return buffer;
    if (buffer.data && Array.isArray(buffer.data)) {
        const chunkSize = 1024;
        let result = '';
        for (let i = 0; i < buffer.data.length; i += chunkSize) {
            const chunk = buffer.data.slice(i, i + chunkSize);
            result += String.fromCharCode.apply(null, chunk);
        }
        return btoa(result);
    }
    return '';
};

const MentionAutocomplete = ({ 
    users, 
    searchTerm, 
    onSelect, 
    position, 
    currentUserId 
}) => {
    if (!users || users.length === 0) {
        return null;
    }

    // Filter users based on search term (excluding current user)
    // If searchTerm is empty, show all users (except current user)
    const filteredUsers = users
        .filter(user => {
            if (user._id === currentUserId) return false;
            // If no search term, show all users
            if (!searchTerm || searchTerm.trim() === '') return true;
            // Otherwise, filter by search term
            const name = user.agent_name?.toLowerCase() || '';
            const email = user.email?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();
            return name.includes(search) || email.includes(search);
        })
        .slice(0, 8); // Limit to 8 results

    if (filteredUsers.length === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                "absolute z-50 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-64 overflow-y-auto",
                "min-w-[240px] max-w-[320px] backdrop-blur-sm",
                "animate-in fade-in-0 zoom-in-95 duration-200"
            )}
            style={{
                bottom: `${position.bottom}px`,
                left: `${position.left}px`,
            }}
        >
            <div className="p-1">
                {filteredUsers.map((user, index) => (
                    <button
                        key={user._id}
                        type="button"
                        onClick={() => onSelect(user)}
                        className={cn(
                            "w-full px-3 py-2.5 text-left rounded-lg transition-all duration-150",
                            "flex items-center gap-3 hover:bg-blue-50 hover:shadow-sm",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                            index === 0 && "mt-0",
                            index === filteredUsers.length - 1 && "mb-0"
                        )}
                    >
                        {user.photo ? (
                            <img
                                src={`data:${user.photo.contentType};base64,${bufferToBase64(user.photo.data)}`}
                                alt={user.agent_name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {user.agent_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.agent_name}
                            </p>
                            {user.email && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {user.email}
                                </p>
                            )}
                        </div>
                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MentionAutocomplete;
