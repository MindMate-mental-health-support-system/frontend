import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, name, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div style={{ flex: 1 }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {label}
                </label>
            )}
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%'
                }}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '100%',
                        padding: '1rem 1.2rem',
                        background: 'var(--input-bg)',
                        border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--input-border)'}`,
                        borderRadius: '12px',
                        color: value ? 'var(--text-main)' : 'var(--text-muted)',
                        fontSize: '1.1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontWeight: value ? '500' : '400',
                        transition: 'all 0.2s ease',
                        boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.2)' : 'none'
                    }}
                >
                    <span>{selectedLabel}</span>
                    <ChevronDown
                        size={20}
                        style={{
                            color: 'var(--primary-light)',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}
                    />
                </button>

                {isOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 0.5rem)',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            animation: 'fadeIn 0.15s ease'
                        }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange({ target: { name, value: option.value } });
                                    setIsOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1.2rem',
                                    background: value === option.value ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                    border: 'none',
                                    color: value === option.value ? 'var(--primary)' : 'var(--text-main)',
                                    fontSize: '1rem',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontWeight: value === option.value ? '600' : '400',
                                    transition: 'all 0.2s ease',
                                    borderLeft: value === option.value ? '3px solid var(--primary)' : '3px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = value === option.value ? 'rgba(99, 102, 241, 0.2)' : 'transparent';
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
