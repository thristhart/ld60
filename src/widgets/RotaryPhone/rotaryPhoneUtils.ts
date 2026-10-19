export const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
export const rotorHoleSize = 50;

export function rotorHoleRingRadius(rotorSize: number) {
    return (rotorSize - 70 - rotorHoleSize) / 2;
}

export function digitAngle(digit: number) {
    return Math.PI / 8 + ((digit === 0 ? 10 : digit) * Math.PI) / 6;
}

export function holeOffset(digit: number, rotorSize: number) {
    const angle = digitAngle(digit);
    const r = rotorHoleRingRadius(rotorSize);
    return { x: r * Math.cos(angle), y: -r * Math.sin(angle) };
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
