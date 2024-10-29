import React, { useState } from 'react';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white shadow-md">
            <div className="flex justify-between items-center p-4 max-w-6xl mx-auto">
                <div className="text-lg font-bold text-gray-800">
                    Vehicle Movement on a Map
                </div>
                <div className="relative">
                    <button 
                        onClick={toggleMenu} 
                        className="text-gray-800 focus:outline-none transition duration-200 hover:text-blue-600">
                        ☰
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                            <a 
                                href="#" 
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200" 
                                onClick={closeMenu}
                            >
                                Profile
                            </a>
                            <a 
                                href="#" 
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200" 
                                onClick={closeMenu}
                            >
                                My Account
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
