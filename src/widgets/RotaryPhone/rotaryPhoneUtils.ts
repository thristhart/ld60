export const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

const rotorArtSize = 680;
const rotorArtHoleRingRadius = 245;
const rotorArtHoleRadius = 44;

// The art's holes aren't quite a perfect circle, so cut them where they're actually drawn
const rotorArtHoleCenters: Record<number, [number, number]> = {
    1: [461.3, 127.7],
    2: [337.3, 94.8],
    3: [217.3, 127.7],
    4: [125.3, 217.7],
    5: [93.4, 340.0],
    6: [125.3, 462.3],
    7: [216.3, 551.7],
    8: [340.3, 585.2],
    9: [461.3, 551.7],
    0: [550.9, 462.3],
};

export function rotorHoleSize(rotorSize: number) {
    return (2 * rotorArtHoleRadius * rotorSize) / rotorArtSize;
}

export function rotorHoleRingRadius(rotorSize: number) {
    return (rotorArtHoleRingRadius * rotorSize) / rotorArtSize;
}

export function digitAngle(digit: number) {
    return Math.PI / 6 + ((digit === 0 ? 10 : digit) * Math.PI) / 6;
}

export function holeOffset(digit: number, rotorSize: number) {
    const [x, y] = rotorArtHoleCenters[digit];
    const scale = rotorSize / rotorArtSize;
    return { x: (x - rotorArtSize / 2) * scale, y: (y - rotorArtSize / 2) * scale };
}

export function circlePath(cx: number, cy: number, r: number) {
    // here be dragons
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
}

export const fingerStopAngle = -Math.PI / 12;
export const fingerStopAdjust = Math.PI / 24;

export function maxRotation(digit: number) {
    return digitAngle(digit) - fingerStopAngle - fingerStopAdjust;
}

// Like pulse dialing: one pulse per digit whose full travel was reached, so an early release dials a lower digit
export function dialedDigit(rotation: number, tolerance: number) {
    const pulses = digits.filter((digit) => rotation >= maxRotation(digit) - tolerance).length;
    return pulses === 0 ? undefined : pulses % 10;
}
