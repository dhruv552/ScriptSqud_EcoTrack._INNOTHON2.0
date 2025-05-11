import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Car, Wind, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SustainARideButtonProps {
    onClick?: () => void;
}

const SustainARideButton: React.FC<SustainARideButtonProps> = ({ onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        // Redirect to the specified URL in a new window
        window.open('http://localhost:5173/', '_blank');
        // Also call the passed onClick function if it exists
        if (onClick) onClick();
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="relative overflow-hidden border-blue-500 text-blue-500 hover:text-white hover:bg-blue-600/20 transition-colors group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <span className="relative z-10 flex items-center">
                <span className="relative">
                    <Car className="h-4 w-4 mr-2 transition-transform group-hover:translate-x-1" />
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                className="absolute -bottom-1 -left-1"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Wind className="h-3 w-3 text-cyan-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </span>
                SustainARide
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            className="absolute right-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Sparkles className="h-3 w-3 text-yellow-400" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </span>

            {/* Animated background gradient on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-20"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "loop" }}
                    />
                )}
            </AnimatePresence>
        </Button>
    );
};

export default SustainARideButton;