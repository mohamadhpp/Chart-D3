import React from 'react';

interface DotLoaderProps
{
    className?: string;
}

const DotLoader: React.FC<DotLoaderProps> = ({
                                                 className = ''
                                             }) =>
{
    return (
        <div
            className={`flex items-center justify-center space-x-1 w-full h-full py-1 px-2 ${className}`}
        >
            <div className="w-3 h-3 rounded-full animate-pulse bg-gray-900" />
            <div className="w-3 h-3 rounded-full animate-pulse [animation-delay:200ms] bg-gray-900" />
            <div className="w-3 h-3 rounded-full animate-pulse [animation-delay:400ms] bg-gray-900" />
        </div>
    );
};

export default DotLoader;