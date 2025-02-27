'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../src/context/AuthContext';

// Enhanced interactive particle background with mouse interaction
function ParticleBackground() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, radius: 150 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let animationFrameId;

        const particles = [];
        const particleCount = 150; // Increased particle count
        const connectionDistance = 120;
        const colors = ['#ff66b3', '#66b3ff', '#b366ff', '#66ffb3', '#ffb366'];

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        // Touch move handler for mobile
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current.x = e.touches[0].clientX;
                mouseRef.current.y = e.touches[0].clientY;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('resize', () => {
            width = (canvas.width = window.innerWidth);
            height = (canvas.height = window.innerHeight);
        });

        // Create particles with random properties
        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 5 + 1;
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: size,
                baseSize: size,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                maxSpeed: 2,
                angle: Math.random() * 360,
                glowing: Math.random() > 0.8,
                pulsating: Math.random() > 0.7,
                pulseSpeed: 0.02 + Math.random() * 0.08,
                pulseDirection: 1,
                pulseAmount: 0,
            });
        }

        // Draw connections between nearby particles
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = 1 - (distance / connectionDistance);
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, 'rgba(32, 32, 64, 0.7)');
            gradient.addColorStop(1, 'rgba(64, 32, 96, 0.7)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Update and draw particles
            particles.forEach(p => {
                // Apply mouse repulsion
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseRef.current.radius) {
                    const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
                    p.speedX += dx * force * 0.05;
                    p.speedY += dy * force * 0.05;
                }

                // Apply speed limits
                if (p.speedX > p.maxSpeed) p.speedX = p.maxSpeed;
                else if (p.speedX < -p.maxSpeed) p.speedX = -p.maxSpeed;

                if (p.speedY > p.maxSpeed) p.speedY = p.maxSpeed;
                else if (p.speedY < -p.maxSpeed) p.speedY = -p.maxSpeed;

                // Move particles
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around screen edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Gradually slow down
                p.speedX *= 0.99;
                p.speedY *= 0.99;

                // Pulsating size effect
                if (p.pulsating) {
                    p.pulseAmount += p.pulseSpeed * p.pulseDirection;
                    if (p.pulseAmount > 1) {
                        p.pulseAmount = 1;
                        p.pulseDirection = -1;
                    } else if (p.pulseAmount < 0) {
                        p.pulseAmount = 0;
                        p.pulseDirection = 1;
                    }
                    p.size = p.baseSize * (1 + p.pulseAmount);
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                // Add glow effect
                if (p.glowing) {
                    const gradient = ctx.createRadialGradient(
                        p.x, p.y, 0,
                        p.x, p.y, p.size * 3
                    );
                    gradient.addColorStop(0, p.color);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connections
            drawConnections();

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', () => {});
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
}

// Floating letters animation component
function FloatingTitle({ text }) {
    return (
        <div className="relative">
            <h1 className="text-center text-6xl font-extrabold relative">
                {text.split('').map((char, index) => (
                    <span
                        key={index}
                        className="inline-block hover:scale-150 hover:rotate-12 hover:text-yellow-400 transition-all duration-300 relative animate-float"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            textShadow: '0 0 15px rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </div>
    );
}

// Animated input component with focus effects
function AnimatedInput({ id, label, type, value, onChange, autoComplete }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative">
            <label
                htmlFor={id}
                className={`absolute left-4 transition-all duration-300 pointer-events-none text-gray-400
                    ${isFocused || value ? 'transform -translate-y-5 text-xs text-pink-500 font-bold' : 'top-2'}`}
            >
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                autoComplete={autoComplete}
                required
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`appearance-none block w-full px-4 py-2 pt-6 border rounded-md shadow-lg
                    bg-gray-800 bg-opacity-60 text-white transition-all duration-300
                    ${isFocused
                    ? 'border-pink-500 ring-2 ring-pink-500 ring-opacity-50 scale-105'
                    : 'border-gray-700'}`}
            />
            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 rounded-b-md
                ${isFocused ? 'w-full' : 'w-0'}`}></div>
        </div>
    );
}

// Interactive button component with hover and click effects
function InteractiveButton({ onClick, children }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    return (
        <button
            type="submit"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            className={`group relative w-full overflow-hidden py-3 px-4 rounded-md font-bold text-lg text-white
                transition-all duration-300
                ${isPressed ? 'scale-95' : isHovered ? 'scale-105' : ''}`}
        >
            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 z-0"></div>
            <div className={`absolute inset-0 bg-gradient-to-r from-pink-600 to-yellow-500 z-0 transition-opacity duration-300
                ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Particle burst on hover */}
            <div className={`absolute inset-0 overflow-hidden z-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-white opacity-70 animate-particle-burst"
                        style={{
                            left: '50%',
                            top: '50%',
                            animationDelay: `${i * 0.05}s`,
                            transform: `rotate(${i * 18}deg) translateY(${isPressed ? 0 : 30}px)`,
                            opacity: isPressed ? 0 : undefined
                        }}
                    ></div>
                ))}
            </div>

            {/* Glow effect */}
            <div className={`absolute inset-0 bg-white opacity-0 blur-lg transition-opacity duration-300
                ${isHovered ? 'opacity-20' : ''}`}></div>

            {/* Button text with its own animations */}
            <span className="relative z-10 inline-block transition-transform duration-300 group-hover:scale-110">
                {children}
            </span>
        </button>
    );
}

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const { login, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [boxRotation, setBoxRotation] = useState({ x: 0, y: 0 });
    const loginBoxRef = useRef(null);

    // 3D rotation effect following mouse position
    useEffect(() => {
        if (!loginBoxRef.current) return;

        const handleMouseMove = (e) => {
            const box = loginBoxRef.current.getBoundingClientRect();
            const boxCenterX = box.left + box.width / 2;
            const boxCenterY = box.top + box.height / 2;

            // Calculate rotation based on mouse position relative to box center
            const rotateY = ((e.clientX - boxCenterX) / (box.width / 2)) * 5; // Max 5 degrees
            const rotateX = -((e.clientY - boxCenterY) / (box.height / 2)) * 5; // Max 5 degrees

            setBoxRotation({ x: rotateX, y: rotateY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/projects/chatbot');
        }
    }, [isAuthenticated, loading, router]);

    // Enhanced shake animation when an error occurs
    useEffect(() => {
        if (error) {
            setShake(true);
            const timer = setTimeout(() => setShake(false), 820);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle login form submission with enhanced feedback
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Username and password are required');
            return;
        }

        const success = login(username, password);

        if (success) {
            // Success animation before redirect
            document.body.classList.add('login-success');
            setTimeout(() => {
                router.push('/projects/chatbot');
            }, 1000);
        } else {
            setLoginAttempts(prev => prev + 1);
            setError(loginAttempts >= 2
                ? 'Multiple failed attempts. Hint: Try the demo credentials below.'
                : 'Invalid username or password');
        }
    };

    // While authenticating, show an enhanced loading animation
    if (loading || isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="w-16 h-16 absolute top-0 border-4 border-pink-500 rounded-full border-b-transparent animate-spin-reverse"></div>
                </div>
                <p className="mt-6 text-white text-xl font-bold animate-pulse">Logging in...</p>
            </div>
        );
    }

    return (
        <>
            <ParticleBackground />

            <div className="min-h-screen flex flex-col relative z-10 justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated floating orbs in background */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full blur-xl animate-float-orb"
                        style={{
                            width: `${Math.random() * 200 + 100}px`,
                            height: `${Math.random() * 200 + 100}px`,
                            background: `radial-gradient(circle, 
                                rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2) 0%, 
                                transparent 70%)`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDuration: `${Math.random() * 20 + 10}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    ></div>
                ))}

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link href="/" className="block mb-8 transform hover:scale-110 transition-transform duration-300">
                        <div className="text-center relative">
                            <FloatingTitle text="NoteBook" />
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-gradient-x rounded-full"></div>
                        </div>
                    </Link>
                    <h2 className="mt-10 text-center text-3xl font-bold tracking-tight text-white drop-shadow-glow animate-pulse-subtle">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">
                    {/* 3D rotating login box */}
                    <div
                        ref={loginBoxRef}
                        className={`${shake ? 'animate-shake-hard' : ''} 
                            bg-gray-800 bg-opacity-60 backdrop-blur-xl py-8 px-4 shadow-2xl 
                            sm:rounded-lg sm:px-10 border border-gray-700 transition-all duration-200
                            hover:shadow-glow`}
                        style={{
                            transform: `perspective(1000px) rotateX(${boxRotation.x}deg) rotateY(${boxRotation.y}deg)`,
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-900 bg-opacity-50 border border-red-600 text-red-200 px-4 py-3 rounded-md relative animate-pulse-error" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                                        </svg>
                                    </span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <AnimatedInput
                                    id="username"
                                    label="Username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoComplete="username"
                                />

                                <AnimatedInput
                                    id="password"
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                            </div>

                            <div className="pt-4">
                                <InteractiveButton onClick={handleSubmit}>
                                    Sign in
                                </InteractiveButton>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-800 text-gray-400">
                                        Demo credentials
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 text-center">
                                <p className="text-sm text-gray-400">
                                    Username: <span className="font-mono bg-gray-700 px-2 py-1 rounded inline-block hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => setUsername('user')}>user</span>
                                </p>
                                <p className="text-sm text-gray-400">
                                    Password: <span className="font-mono bg-gray-700 px-2 py-1 rounded inline-block hover:bg-gray-600 transition-colors cursor-pointer" onClick={() => setPassword('password')}>password</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes float-orb {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(50px, 25px); }
                    50% { transform: translate(0, 50px); }
                    75% { transform: translate(-50px, 25px); }
                    100% { transform: translate(0, 0); }
                }
                
                @keyframes gradient-x {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes shake-hard {
                    0%, 100% { transform: translateX(0) perspective(1000px) rotateX(${boxRotation.x}deg) rotateY(${boxRotation.y}deg); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px) perspective(1000px) rotateX(${boxRotation.x}deg) rotateY(${boxRotation.y + 5}deg); }
                    20%, 40%, 60%, 80% { transform: translateX(10px) perspective(1000px) rotateX(${boxRotation.x}deg) rotateY(${boxRotation.y - 5}deg); }
                }
                
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                
                @keyframes pulse-error {
                    0%, 100% { border-color: #f56565; }
                    50% { border-color: #822727; }
                }
                
                @keyframes spin-reverse {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                
                @keyframes particle-burst {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1) translate(var(--translate-x, 50px), var(--translate-y, 50px)); opacity: 0; }
                }

                @keyframes login-success-anim {
                    0% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(20); }
                    100% { opacity: 0; transform: scale(40); }
                }
                
                .login-success::after {
                    content: '';
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                    z-index: 9999;
                    animation: login-success-anim 1s forwards;
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                
                .animate-float-orb {
                    animation: float-orb 20s ease-in-out infinite;
                }
                
                .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                }
                
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s ease-in-out infinite;
                }
                
                .animate-pulse-error {
                    animation: pulse-error 1s ease-in-out infinite;
                }
                
                .animate-spin-reverse {
                    animation: spin-reverse 1s linear infinite;
                }
                
                .animate-shake-hard {
                    animation: shake-hard 0.8s cubic-bezier(.36,.07,.19,.97) both;
                }
                
                .animate-particle-burst {
                    animation: particle-burst 1s ease-out forwards;
                }
                
                .drop-shadow-glow {
                    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
                }
                
                .shadow-glow {
                    box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
                }
            `}</style>
        </>
    );
}