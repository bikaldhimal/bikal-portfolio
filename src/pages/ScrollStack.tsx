import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export interface ScrollStackItemProps {
    itemClassName?: string;
    children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({
    children,
    itemClassName = '',
}) => (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>
        {children}
    </div>
);

interface ScrollStackProps {
    className?: string;
    children: ReactNode;
    itemScale?: number;
    itemStackDistance?: number;
    stackPosition?: string;
    scaleEndPosition?: string;
    baseScale?: number;
    useWindowScroll?: boolean;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
    children,
    className = '',
    itemScale = 0.03,
    itemStackDistance = 30,
    stackPosition = '20%',
    scaleEndPosition = '10%',
    baseScale = 0.85,
    useWindowScroll = false,
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const cardsRef = useRef<HTMLElement[]>([]);
    const isUpdatingRef = useRef(false);

    const calculateProgress = useCallback(
        (scrollTop: number, start: number, end: number) => {
            if (scrollTop < start) return 0;
            if (scrollTop > end) return 1;
            return (scrollTop - start) / (end - start);
        },
        []
    );

    const parsePercentage = useCallback(
        (value: string | number, containerHeight: number) => {
            if (typeof value === 'string' && value.includes('%')) {
                return (parseFloat(value) / 100) * containerHeight;
            }

            return typeof value === 'number'
                ? value
                : parseFloat(value);
        },
        []
    );

    const getScrollData = useCallback(() => {
        if (useWindowScroll) {
            return {
                scrollTop: window.scrollY,
                containerHeight: window.innerHeight,
            };
        }

        const scroller = scrollerRef.current;

        if (!scroller) {
            return {
                scrollTop: 0,
                containerHeight: 0,
            };
        }

        return {
            scrollTop: scroller.scrollTop,
            containerHeight: scroller.clientHeight,
        };
    }, [useWindowScroll]);

    const getElementOffset = useCallback(
        (element: HTMLElement) => {
            if (useWindowScroll) {
                const rect = element.getBoundingClientRect();
                return rect.top + window.scrollY;
            }

            return element.offsetTop;
        },
        [useWindowScroll]
    );

    const updateCardTransforms = useCallback(() => {
        if (!cardsRef.current.length || isUpdatingRef.current) return;

        isUpdatingRef.current = true;

        const { scrollTop, containerHeight } = getScrollData();

        const stackPositionPx = parsePercentage(
            stackPosition,
            containerHeight
        );

        const scaleEndPositionPx = parsePercentage(
            scaleEndPosition,
            containerHeight
        );

        const scroller = scrollerRef.current;

        const endElement = useWindowScroll
            ? (document.querySelector(
                '.scroll-stack-end'
            ) as HTMLElement | null)
            : (scroller?.querySelector(
                '.scroll-stack-end'
            ) as HTMLElement | null);

        const endElementTop = endElement
            ? getElementOffset(endElement)
            : 0;

        cardsRef.current.forEach((card, i) => {
            if (!card) return;

            const cardTop = getElementOffset(card);

            const pinStart =
                cardTop -
                stackPositionPx -
                itemStackDistance * i;

            const pinEnd =
                endElementTop -
                containerHeight / 2;

            const triggerStart = pinStart;
            const triggerEnd =
                cardTop - scaleEndPositionPx;

            const scaleProgress = calculateProgress(
                scrollTop,
                triggerStart,
                triggerEnd
            );

            const targetScale =
                baseScale + i * itemScale;

            const scale =
                1 -
                scaleProgress *
                (1 - targetScale);

            let translateY = 0;

            if (
                scrollTop >= pinStart &&
                scrollTop <= pinEnd
            ) {
                translateY =
                    scrollTop -
                    cardTop +
                    stackPositionPx +
                    itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY =
                    pinEnd -
                    cardTop +
                    stackPositionPx +
                    itemStackDistance * i;
            }

            card.style.transform =
                `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        });

        isUpdatingRef.current = false;
    }, [
        itemScale,
        itemStackDistance,
        stackPosition,
        scaleEndPosition,
        baseScale,
        useWindowScroll,
        getScrollData,
        getElementOffset,
        calculateProgress,
        parsePercentage,
    ]);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;

        if (!scroller) return;

        const cards = Array.from(
            useWindowScroll
                ? document.querySelectorAll(
                    '.scroll-stack-card'
                )
                : scroller.querySelectorAll(
                    '.scroll-stack-card'
                )
        ) as HTMLElement[];

        cardsRef.current = cards;

        const content = useWindowScroll
            ? document.body
            : (scroller.querySelector(
                '.scroll-stack-inner'
            ) as HTMLElement);

        const lenis = new Lenis({
            lerp: 0.1,
            duration: 1.2,
            smoothWheel: true,
            wrapper: useWindowScroll
                ? window
                : scroller,
            content,
        });

        lenis.on('scroll', updateCardTransforms);

        const raf = (time: number) => {
            lenis.raf(time);
            animationFrameRef.current =
                requestAnimationFrame(raf);
        };

        animationFrameRef.current =
            requestAnimationFrame(raf);

        updateCardTransforms();

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(
                    animationFrameRef.current
                );
            }

            lenis.destroy();
        };
    }, [
        useWindowScroll,
        updateCardTransforms,
    ]);

    return (
        <div
            className={`scroll-stack-scroller ${className}`.trim()}
            ref={scrollerRef}
        >
            <div className="scroll-stack-inner">
                {children}
                <div className="scroll-stack-end" />
            </div>
        </div>
    );
};

export default ScrollStack;