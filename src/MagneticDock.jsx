import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import './MagneticDock.css';

// ================= Custom Portfolio Icons =================
const IconHome = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const IconUser = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconBriefcase = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
const IconFolder = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const IconCode = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
const IconFile = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const IconMail = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;

// ================= Dock Item Physics =================
function DockItem({ item, mouseX, iconSize, maxScale, magneticDistance }) {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const distance = useTransform(mouseX, (val) => {
        if (!ref.current) return magneticDistance + 1;
        const rect = ref.current.getBoundingClientRect();
        return val - (rect.left + rect.width / 2);
    });

    const scale = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1]);
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const smoothScale = useSpring(scale, springConfig);
    const size = useTransform(smoothScale, (s) => s * iconSize);
    const y = useTransform(smoothScale, (s) => (s - 1) * -10);
    const smoothY = useSpring(y, springConfig);

    return (
        <motion.button
            ref={ref}
            onClick={item.onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="dock-item"
            style={{ width: size, height: size, y: smoothY }}
            whileTap={{ scale: 0.9 }}
        >
            <motion.div
                className="dock-icon-container"
                style={{
                    boxShadow: isHovered
                        ? "0 8px 24px rgba(14, 107, 82, 0.25), inset 0 1px 0 rgba(255,255,255,0.8)"
                        : "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                    borderColor: isHovered ? "var(--cyan)" : "rgba(255,255,255,0.5)",
                    color: isHovered ? "var(--cyan)" : "#111816"
                }}
            >
                {item.icon}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, transparent 100%)",
                        opacity: isHovered ? 0.9 : 0.5,
                    }}
                />
            </motion.div>

            <AnimatePresence>
                {item.isActive && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="dock-active-dot"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="dock-tooltip"
                    >
                        {item.label}
                        <div className="dock-tooltip-arrow" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emerald glow effect on hover */}
            <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                    boxShadow: isHovered ? "0 0 25px rgba(14, 107, 82, 0.35)" : "0 0 0px rgba(14, 107, 82, 0)",
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.button>
    );
}

// ================= Main Dock Wrapper =================
export default function MagneticDock() {
    const mousePosition = useMotionValue(Infinity);
    const [activeSection, setActiveSection] = useState('hero');

    // ================= NEW: SCROLL SPY LOGIC =================
    useEffect(() => {
        // Defines the horizontal line on the screen that triggers the section change
        // Currently set to trigger when a section hits the top 30% of the screen
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -70% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // List all the section IDs the dock should track
        const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'resume', 'contact'];

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        // Cleanup observer on unmount
        return () => {
            sections.forEach((id) => {
                const element = document.getElementById(id);
                if (element) observer.unobserve(element);
            });
        };
    }, []);
    // =========================================================

    // Smooth scroll handler
    const scrollTo = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // ... rest of your items array and return statement
    // Define your portfolio sections here
    const items = [
        { id: "hero", label: "Home", icon: <IconHome />, isActive: activeSection === 'hero', onClick: () => scrollTo('hero') },
        { id: "about", label: "About", icon: <IconUser />, isActive: activeSection === 'about', onClick: () => scrollTo('about') },
        { id: "experience", label: "Experience", icon: <IconBriefcase />, isActive: activeSection === 'experience', onClick: () => scrollTo('experience') },
        { id: "projects", label: "Projects", icon: <IconFolder />, isActive: activeSection === 'projects', onClick: () => scrollTo('projects') },
        { id: "skills", label: "Skills", icon: <IconCode />, isActive: activeSection === 'skills', onClick: () => scrollTo('skills') },
        { id: "resume", label: "Resume", icon: <IconFile />, isActive: activeSection === 'resume', onClick: () => scrollTo('resume') },
        { id: "contact", label: "Contact", icon: <IconMail />, isActive: activeSection === 'contact', onClick: () => scrollTo('contact') }, // Added Contact Here
    ];

    return (
        <motion.div
            onMouseMove={(e) => mousePosition.set(e.clientX)}
            onMouseLeave={() => mousePosition.set(Infinity)}
            className="dock-wrapper"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
        >
            {items.map((item) => (
                <DockItem
                    key={item.id}
                    item={item}
                    mouseX={mousePosition}
                    iconSize={36}
                    maxScale={1.25}
                    magneticDistance={90}
                />
            ))}
        </motion.div>
    );
}