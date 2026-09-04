import { useEffect, useRef, useState } from "react";

type SwissItemProps = {
    value: number;
    suffix?: string;
    label: string;
    description: string;
};

const SwissItem = ({
    value,
    suffix,
    label,
    description,
}: SwissItemProps) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    animate();
                }
            },
            { threshold: 0.4 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const animate = () => {
        const duration = 1200;
        const startTime = performance.now();

        const update = (time: number) => {
            const progress = Math.min(
                (time - startTime) / duration,
                1
            );

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    return (
        <div
            ref={ref}
            className="flex flex-col items-start"
        >
            {/* Label */}
            <span className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-white">
                {label}
            </span>

            {/* Number */}
            <h3 className="mb-6 font-sans text-8xl font-bold leading-none tracking-tight md:text-9xl">
                {count.toLocaleString()}
                {suffix}
            </h3>

            {/* Description */}
            <p className="max-w-sm font-sans text-base leading-6 text-white/65">
                {description}
            </p>
        </div>
    );
};

const MagicBento = () => {
    return (
        <section className="w-full bg-black py-32 text-white">
            <div className="mx-auto max-w-7xl px-6">

                {/* Section Header */}
                <div className="mb-24">
                    <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em]">
                        Beyond The Code
                    </h2>
                </div>

                {/* Strict Swiss Grid */}
                <div className="grid grid-cols-1 gap-x-24 gap-y-40 md:grid-cols-2">

                    <SwissItem
                        value={10}
                        suffix="+"
                        label="Projects Delivered"
                        description="Designed, developed, and delivered software solutions from concept to deployment."
                    />

                    <SwissItem
                        value={2}
                        suffix="+"
                        label="Years Experience"
                        description="Building scalable software with a focus on clean architecture and reliable systems."
                    />

                    <SwissItem
                        value={3}
                        suffix="+"
                        label="Core Disciplines"
                        description="Full Stack Development, AI & Automation, and Cybersecurity."
                    />

                    <SwissItem
                        value={1}
                        suffix="st"
                        label="Systems First"
                        description="Architecture precedes interface. Structure defines outcome."
                    />

                </div>
            </div>
        </section>
    );
};

export default MagicBento;