import React from 'react';
import './FluidBackground.css';

const FluidBackground = () => {
    return (
        <div className="fluid-background">
            <div className="fluid-blob blob-1"></div>
            <div className="fluid-blob blob-2"></div>
            <div className="fluid-blob blob-3"></div>
            <div className="fluid-blob blob-4"></div>

            {/* Floating Amber Particles */}
            <div className="fluid-blob amber-float-1"></div>
            <div className="fluid-blob amber-float-2"></div>
            <div className="fluid-blob amber-float-3"></div>

            <div className="glass-overlay"></div>
        </div>
    );
};

export default FluidBackground;
